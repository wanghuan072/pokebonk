const semanticSource=require("./semantic-source.cjs");
const fs = require("node:fs");
const crypto = require("node:crypto");
const ts = require("typescript");
const vm = require("node:vm");
const read = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(read("src/data/" + file + ".json"));
function getTdk() {
  const code = ts.transpileModule(read("src/seo/tdk.js"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(code, context);
  return context.exports.default;
}
function validateSeo(seo, route) {
  if (
    !seo ||
    !/Pok[eé]Bonk/.test(seo.title) ||
    !/Pok[eé]Bonk/.test(seo.description) ||
    seo.title.length < 40 ||
    seo.title.length > 60 ||
    seo.description.length < 140 ||
    seo.description.length > 160
  )
    throw new Error("Invalid SEO copy or length: " + route);
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((k) => !["source", "imageSource", "lastVerified"].includes(k))
        .map((k) => [k, stable(value[k])]),
    );
  return value;
}
function source(file, reader = read) {
  const ast = ts.createSourceFile(
    file,
    reader(file),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const transformed = ts.transform(ast, [
    (context) => (root) => {
      function visit(node) {
        if (ts.isImportDeclaration(node)) return undefined;
        if (ts.isJsxText(node))
          return ts.factory.createJsxText(node.text.replace(/\s+/g, " "));
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(root, visit);
    },
  ]);
  const printed = ts
    .createPrinter({ removeComments: true })
    .printFile(transformed.transformed[0]);
  transformed.dispose();
  return printed;
}
function collectPages(
  overrides = {},
  reader = read,
  readAsset = (file) => fs.readFileSync(file),
) {
  const load = (name) => overrides[name] ?? json(name);
  const tdk = overrides.tdk ?? getTdk();
  for (const [route, seo] of Object.entries(tdk)) validateSeo(seo, route);
  const copy = load("content/pages"),
    pokemon = load("pokedex/pokemon"),
    moves = load("wiki/moves"),
    items = load("wiki/items"),
    guides = load("guides/guides"),
    releases = load("updates/releases");
  for (const guide of guides.filter((g) => g.isDetails))
    validateSeo(guide.seo, "/guides/" + guide.slug);
  const card = (g) => ({
    slug: g.slug,
    title: g.title,
    summary: g.summary,
    category: g.category,
    minutes: g.minutes,
    isDetails: g.isDetails,
    art: load("media/guide-visuals")[g.slug],
  });
  const homeLayout = load("content/home-layout");
  const homeRecipes = load("wiki/fusions").filter((f) => homeLayout.fusionSlugs.includes(f.slug));
  const homeMoveSlugs = new Set(homeRecipes.flatMap((f) => f.moves));
  const data = {
    "/": [
      load("content/home"),
      { season:load("leaderboard/snapshot").season, verifiedAt:load("leaderboard/snapshot").verifiedAt, entries:load("leaderboard/snapshot").boards[0].entries.slice(0,5) },
      load("events/events").map(({slug,name,start,end})=>({slug,name,start,end})),
      homeLayout,
      pokemon.map(({ id, slug, name, image, isPlayable, isStarter }) => ({ id, slug, name, image, isPlayable, isStarter })),
      { species: pokemon.length, partners: pokemon.filter((p) => p.isPlayable).length, moves: moves.length, items: items.length, achievements: load("wiki/achievements").length, fusions: load("wiki/fusions").length + load("wiki/generic-fusions").length },
      homeRecipes,
      moves.filter((m) => homeMoveSlugs.has(m.slug)).map(({slug,name,image}) => ({slug,name,image})),
      guides.map(card),
      releases.slice(0, 1).map((r) => ({ slug:r.slug, version:r.version, date:r.date, note:r.notes[0] })),
      load("wiki/lab").filter((u) => homeLayout.labIds.includes(u.id)).map(({id,name,image,max}) => ({id,name,image,max})),
      items.filter((i) => homeLayout.itemSlugs.includes(i.slug)).map(({slug,name,image}) => ({slug,name,image})),
      load("tier-list/rankings").tiers.slice(0,3).map((t) => ({tier:t.tier,label:t.label,pokemon:t.pokemon.slice(0,homeLayout.tierPreviewLimit)})),
    ],
    "/play": [],
    "/pokedex": pokemon,
    "/wiki/attacks": load("wiki/attacks"),
    "/wiki/vitamins": load("wiki/vitamins"),
    "/wiki/items": load("wiki/catalog-items"),
    "/wiki/achievements": [load("wiki/achievements"),load("wiki/achievement-art")],
    "/wiki/lab": [load("wiki/lab"),load("wiki/catalog-items")],
    "/tier-list": [load("tier-list/rankings"),load("tier-list/recommendations"), pokemon, moves],
    "/builds": (() => {
      const routes = load("builds/routes");
      const attackSlugs = new Set(routes.flatMap((route) => route.slots.flatMap((slot) => [slot.attack, ...(slot.attacks || []), slot.result].filter(Boolean))));
      const vitaminSlugs = new Set(routes.flatMap((route) => route.vitamins.map((pick) => pick.slug)));
      const itemSlugs = new Set(routes.flatMap((route) => route.items.map((pick) => pick.slug)));
      return [
        routes,
        load("wiki/attacks").filter((attack) => attackSlugs.has(attack.slug)).map(({ slug, name, image }) => ({ slug, name, image })),
        load("wiki/vitamins").filter((vitamin) => vitaminSlugs.has(vitamin.slug)).map(({ slug, name, image, label }) => ({ slug, name, image, label })),
        load("wiki/catalog-items").filter((item) => itemSlugs.has(item.slug)).map(({ slug, name, image, description }) => ({ slug, name, image, description })),
        pokemon.filter((entry) => routes.some((route) => route.partner === entry.slug || route.shownAs === entry.id)).map(({ id, slug, name, image }) => ({ id, slug, name, image })),
      ];
    })(),
    "/guides": guides.map(card),
    "/wiki/leaderboard": [load("leaderboard/snapshot")],
    "/events": [load("events/events"),load("events/daily-mutations")],
    "/updates": releases,
  };
  const files = {
    "/": ["home/HomePage", "home/HomeGameMenu", "home/HomeRoster", "@GuideArtwork", "@GameBackdrop", "@TrainerAvatar"],
    "/play": ["play/PlayPage"],
    "/pokedex": [
      "pokedex/PokedexPage",
      "pokedex/PokedexExplorer",
    ],
    "/wiki/attacks": ["wiki/AttacksPage", "wiki/CatalogExplorer"],
    "/wiki/vitamins": ["wiki/VitaminsPage", "wiki/CatalogExplorer"],
    "/wiki/items": ["wiki/ItemsPage", "wiki/CatalogExplorer"],
    "/wiki/achievements": ["wiki/AchievementsPage", "wiki/AchievementTracker"],
    "/wiki/lab": ["wiki/LabPage", "wiki/LabUpgradeExplorer", "wiki/LabCalculator"],
    "/tier-list": ["tier-list/TierListPage", "tier-list/TierWorkshop", "tier-list/PlayerRecommendations"],
    "/builds": ["builds/BuildsPage"],
    "/guides": [
      "guides/GuidesPage",
      "guides/GuideExplorer",
      "@GuideCard",
      "@GuideArtwork",
    ],
    "/wiki/leaderboard": [
      "leaderboard/LeaderboardPage",
      "leaderboard/LeaderboardExplorer", "@TrainerAvatar",
    ],
    "/events": ["events/EventsPage", "events/DailyMutations"],
    "/updates": ["updates/UpdatesPage", "updates/UpdatesExplorer"],
  };
  const legal = load("legal/pages");
  for (const route of [
    "/about",
    "/privacy-policy",
    "/terms",
    "/copyright",
    "/contact",
  ]) {
    data[route] = legal[route.slice(1)];
    files[route] = ["legal/LegalPage"];
  }
  const payloads = {};
  const metadataCode = source("src/seo/metadata.ts", reader);
  const layout = ts.createSourceFile(
    "layout.tsx",
    reader("src/app/layout.tsx"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const schemaNodes = [];
  function findSchema(node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(layout) === "script"
    )
      schemaNodes.push(
        ts
          .createPrinter({ removeComments: true })
          .printNode(ts.EmitHint.Unspecified, node, layout),
      );
    ts.forEachChild(node, findSchema);
  }
  findSchema(layout);
  const codeCache = new Map();
  function code(file, route) {
    const name = file.startsWith("!") ? file.slice(1) : file.startsWith("@")
      ? "src/components/content/" + file.slice(1) + ".tsx"
      : "src/page/" + file + ".tsx";
    const key=route+":"+name;
    if(!codeCache.has(key))codeCache.set(key,semanticSource(name,reader,route));
    return codeCache.get(key);
  }
  for (const route of Object.keys(tdk))
    payloads[route] = {
      schemaVersion: 2,
      origin: "https://pokebonkdb.org",
      seo: tdk[route],
      copy: copy[route],
      data: data[route],
      code: [...files[route], ...(files[route].some((f) => ["home/HomePage", "pokedex/PokedexExplorer", "@PokemonCard", "wiki/CatalogExplorer", "wiki/FusionFinder", "tier-list/TierWorkshop"].includes(f)) ? ["@GameSprite"] : [])].map(file=>code(file,route)),
      metadataCode,
      schema: schemaNodes,
      breadcrumb: route === "/" ? undefined : code("@Breadcrumb",route),
    };
  for (const [collection, prefix, template] of [
    [pokemon, "/pokedex/", "pokedex/PokemonDetailPage"],
    [load("wiki/attacks"), "/wiki/attacks/", "wiki/EntryDetailPage"],
    [items, "/wiki/items/", "wiki/EntryDetailPage"],
    [guides, "/guides/", "guides/GuideDetailPage"],
    [releases, "/updates/", "updates/UpdateDetailPage"],
  ]) {
    for (const entry of collection.filter((e) => e.isDetails))
      payloads[prefix + entry.slug] = {
        schemaVersion: 2,
        entry,
        code: prefix === "/guides/" ? [code(template,prefix+entry.slug), code("@GameSprite",prefix+entry.slug), code("@GuideArtwork",prefix+entry.slug)] : code(template,prefix+entry.slug),
        metadataCode,
        schema: schemaNodes,
        breadcrumb: code("@Breadcrumb",prefix+entry.slug),
        related: guides
          .filter((g) => entry.related?.includes(g.slug))
          .map(card),
        art:
          prefix === "/guides/"
            ? load("media/guide-visuals")[entry.slug]
            : undefined,
      };
  }
  const assetCache = new Map();
  for (const payload of Object.values(payloads)) {
    const ids = new Set([...JSON.stringify(payload).matchAll(/\/images\/pokemon\/game\/portraits\/(\d+)\.png/g)].map((m) => Number(m[1])));
    for (const section of payload.entry?.sections || []) for (const id of section.portraits || []) ids.add(id);
    if (ids.size) payload.animations = Object.fromEntries([...ids].sort((a,b)=>a-b).map((id) => [id, load("media/game-sprites")[id]]));
    const paths = [
      ...new Set(
        JSON.stringify(stable(payload)).match(
          /\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg)/g,
        ) || [],
      ),
    ].sort();
    payload.images = Object.fromEntries(
      paths.map((path) => {
        if (!assetCache.has(path)) {
          if (!fs.existsSync("public" + path))
            throw new Error("Missing fingerprint image: " + path);
          assetCache.set(
            path,
            crypto
              .createHash("sha256")
              .update(readAsset("public" + path))
              .digest("hex"),
          );
        }
        return [path, assetCache.get(path)];
      }),
    );
  }
  return Object.fromEntries(
    Object.entries(payloads)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([route, payload]) => [
        route,
        crypto
          .createHash("sha256")
          .update(JSON.stringify(stable(payload)))
          .digest("hex"),
      ]),
  );
}
function reconcile(fingerprints, history, date) {
  return Object.fromEntries(
    Object.entries(fingerprints).map(([route, fingerprint]) => [
      route,
      {
        fingerprint,
        modified:
          history[route]?.fingerprint === fingerprint
            ? history[route].modified
            : date,
      },
    ]),
  );
}
module.exports = { collectPages, reconcile, getTdk };
