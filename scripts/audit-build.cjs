const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const data = (name) =>
  JSON.parse(fs.readFileSync("src/data/" + name + ".json", "utf8"));
const pokemon = data("pokedex/pokemon"),
  moves = data("wiki/moves"),
  items = data("wiki/items"),
  guides = data("guides/guides"),
  releases = data("updates/releases"),
  fusions = data("wiki/fusions"),
  achievements = data("wiki/achievements"),
  lab = data("wiki/lab");
const fixed = [
  "/",
  "/play",
  "/pokedex",
  "/wiki/attacks",
  "/wiki/vitamins",
  "/wiki/items",
  "/wiki/achievements",
  "/wiki/lab",
  "/tier-list",
  "/builds",
  "/guides",
  "/wiki/leaderboard",
  "/events",
  "/updates",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/copyright",
];
const routes = new Set([
  ...fixed,
  ...pokemon.filter(x=>x.isDetails).map((x) => "/pokedex/" + x.slug),
  ...moves.filter(x=>x.isDetails).map((x) => "/wiki/moves/" + x.slug),
  ...items.filter(x=>x.isDetails).map((x) => "/wiki/items/" + x.slug),
  ...guides.map((x) => "/guides/" + x.slug),
  ...releases.filter(x=>x.isDetails).map((x) => "/updates/" + x.slug),
]);
for (const collection of [pokemon, moves, items, guides, releases])
  assert.equal(
    new Set(collection.map((x) => x.slug)).size,
    collection.length,
    "Duplicate slug",
  );
for (const p of pokemon) {
  assert.ok(fs.existsSync("public" + p.image));
  for (const move of p.moves)
    assert.ok(
      moves.some((m) => m.slug === move),
      `Missing ${move}`,
    );
  if (p.passive)
    assert.ok(
      moves.some((m) => m.slug === p.passive),
      `Missing passive ${p.passive}`,
    );
  assert.ok(p.gameVersion && p.lastVerified);
}
for (const f of fusions)
  for (const slug of f.moves) assert.ok(moves.some((m) => m.slug === slug));
for (const g of guides)
  for (const slug of g.related) assert.ok(guides.some((x) => x.slug === slug));
assert.equal(new Set(achievements.map((x) => x.id)).size, achievements.length);
for (const u of lab) {
  assert.equal(u.max, u.costsByLevel.length);
  assert.ok(u.costsByLevel.every((x) => Number.isInteger(x) && x >= 0));
}
let linkCount = 0,
  imageCount = 0;
const titles = new Map();
const anchorCache = new Map();
function anchors(route) {
  if (!anchorCache.has(route)) {
    const html = fs.readFileSync(
      path.join(
        ".next/server/app",
        route === "/" ? "index.html" : route + ".html",
      ),
      "utf8",
    );
    const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,`Duplicate anchor on ${route}`);
    anchorCache.set(
      route,
      new Set([...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((m) => m[1])),
    );
  }
  return anchorCache.get(route);
}
// Presence of a file alone is insufficient: every Wiki collection needs an
// explicit illustration, and downloaded game assets must actually be PNGs.
for (const [collection, entries] of Object.entries({
  moves,
  items,
  fusions,
  achievements,
  lab,
})) {
  for (const entry of entries) {
    assert.ok(
      entry.image,
      `Unillustrated ${collection} entry: ${entry.slug || entry.id}`,
    );
    assert.ok(
      fs.existsSync("public" + entry.image),
      `Missing ${collection} artwork: ${entry.image}`,
    );
  }
}
for (const record of JSON.parse(
  fs.readFileSync("src/data/media/wiki-sources.json", "utf8"),
)) {
  const bytes = fs.readFileSync("public" + record.file);
  assert.equal(
    bytes.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    `Invalid image payload ${record.file}`,
  );
}
for (const route of routes) {
  const file = path.join(
    ".next/server/app",
    route === "/" ? "index.html" : route + ".html",
  );
  assert.ok(fs.existsSync(file), "Missing generated route " + route);
  const html = fs.readFileSync(file, "utf8");
  assert.equal(
    (html.match(/<h1[ >]/g) || []).length,
    1,
    "Exactly one H1 on " + route,
  );
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title, "Missing title " + route);
  assert.ok(
    !titles.has(title),
    `Duplicate title ${title}: ${titles.get(title)} and ${route}`,
  );
  titles.set(title, route);
  assert.ok(
    /name="description" content="[^"]+"/.test(html),
    "Description " + route,
  );
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical, "Canonical " + route);
  assert.equal(new URL(canonical).pathname, route, "Canonical path " + route);
  assert.ok(html.includes('property="og:image"'), "OG image " + route);
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, "&");
    if (
      href.startsWith("#") ||
      (href.startsWith("/") && !href.startsWith("//"))
    ) {
      const destination = new URL(href, "http://audit.test" + route);
      if (destination.hash)
        assert.ok(
          anchors(destination.pathname).has(
            decodeURIComponent(destination.hash.slice(1)),
          ),
          `Broken anchor ${href} on ${route}`,
        );
    }
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const pathname = decodeURIComponent(href.split(/[?#]/)[0]);
    assert.ok(
      routes.has(pathname),
      "Broken internal link " + href + " on " + route,
    );
    linkCount++;
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    assert.ok(/alt="[^"]*"/.test(tag), "Missing image alt " + route);
    let src = tag.match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
    if (!src) continue;
    if (src.startsWith("/_next/image"))
      src = new URL(src, "http://audit.test").searchParams.get("url");
    if (src?.startsWith("/images/")) {
      assert.ok(fs.existsSync("public" + src), "Missing image " + src);
      imageCount++;
    }
  }
}
console.log(
  `PASS: ${routes.size} routes, unique titles, metadata, canonical paths, one H1, ${linkCount} internal links and ${imageCount} images.`,
);
console.log(
  `PASS: ${pokemon.length} Pokédex entries, ${pokemon.filter((p) => p.isPlayable).length} partners, ${moves.length} moves/abilities, ${fusions.length} signature recipes, ${items.length} items/vitamins, ${achievements.length} achievements and ${lab.length} cost tables.`,
);
