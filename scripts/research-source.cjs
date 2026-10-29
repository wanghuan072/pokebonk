// Manual downloader for the inspected public snapshot; never part of site builds.
const fs = require("node:fs/promises");
const files = {
  "official-entry.js": "assets/main-BgUJZRkG-mvjzbutg.js",
  "official-game.js": "assets/main-C90gB5C0-mvjzbutg.js",
  "official-en.js": "assets/en-D7CrqP_e-mvjzbutg.js",
  "official-news.js": "assets/news-SYOogixF-mvjzbutg.js",
  "pokemon.json": "data/pokemon.json?v=5l9YG1H_",
  "moves.json": "data/moves.json?v=Ixf0MGdc",
  "items.json": "data/items.json?v=3BUkWvy1",
  "i18n-en.json": "data/i18n/en.json?v=3yGJZ_Pq",
};
async function main() {
  await fs.mkdir("docs/research", { recursive: true });
  for (const [name, relative] of Object.entries(files)) {
    const response = await fetch("https://pokebonk.com/" + relative, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(
        `${name}: HTTP ${response.status}; review the pinned source before changing versions.`,
      );
    await fs.writeFile("docs/research/" + name, await response.text());
    console.log("Saved " + name);
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
