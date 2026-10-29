const fs = require("node:fs/promises");
const crypto = require("node:crypto");
async function main() {
  const dir = "docs/research/";
  await fs.mkdir(dir + "v0.8.13", { recursive: true });
  const files = [
    "official-entry.js",
    "official-game.js",
    "official-news.js",
    "official-en.js",
    "english-strings.json",
    "official-config.json",
    "runtime-reference.json",
    "lab-costs.json",
    "pokemon.json",
    "moves.json",
    "items.json",
    "i18n-en.json",
  ];
  for (const file of files) {
    try {
      await fs.access(dir + "v0.8.13/" + file);
    } catch {
      await fs.copyFile(dir + file, dir + "v0.8.13/" + file);
    }
  }
  await fs.mkdir(dir + "site-before-v0825", { recursive: true });
  for (const file of [
    "pokedex/pokemon",
    "wiki/moves",
    "wiki/fusions",
    "wiki/items",
    "wiki/lab",
    "wiki/achievements",
    "tier-list/rankings",
    "guides/guides",
  ]) {
    const dest =
      dir + "site-before-v0825/" + file.replaceAll("/", "-") + ".json";
    try {
      await fs.access(dest);
    } catch {
      await fs.copyFile("src/data/" + file + ".json", dest);
    }
  }
  const manifest = {
    version: "0.8.25",
    checkedAt: new Date().toISOString(),
    files: [],
  };
  async function get(url, file) {
    const response = await fetch(new URL(url, "https://pokebonk.com/"), {
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });
    if (!response.ok) throw Error(response.status + " " + url);
    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(dir + file, bytes);
    manifest.files.push({
      file,
      url: response.url,
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
    });
    return bytes.toString("utf8");
  }
  const html = await get("/?lang=en", "current-index.html");
  manifest.build = html.match(/name="pokebonk-build" content="([^"]+)"/)[1];
  const entryPath = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)]
    .map((m) => m[1])
    .find((p) => p.includes("/main-"));
  const entry = await get(entryPath, "current-entry.js");
  for (const [pattern, file] of [
    [/\.\/main-[\w-]+\.js/, "current-game.js"],
    [/\.\/news-[\w-]+\.js/, "current-news.js"],
    [/\.\/en-[\w-]+\.js/, "current-en.js"],
  ])
    await get("/assets/" + entry.match(pattern)[0].slice(2), file);
  const game = await fs.readFile(dir + "current-game.js", "utf8");
  for (const [relative, file] of [
    ["data/pokemon.json", "current-pokemon.json"],
    ["data/moves.json", "current-moves.json"],
    ["data/items.json", "current-items.json"],
    ["data/i18n/en.json", "current-i18n-en.json"],
  ]) {
    const escaped = relative.replaceAll(".", "\\.");
    const hash = game.match(new RegExp(escaped + '\\?[^`"\\s]+'))?.[0];
    await get("/" + (hash || relative), file);
  }
  await fs.writeFile(
    dir + "v0825-source-manifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(JSON.stringify(manifest, null, 2));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
