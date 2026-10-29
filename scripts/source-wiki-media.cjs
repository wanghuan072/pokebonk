// Cache exact artwork paths used by the inspected original game interface.
// Manual research step; never fetch third-party assets during production builds.
const fs = require("node:fs/promises");
const path = require("node:path");
const types = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];
async function main() {
  const read = async (f) => JSON.parse(await fs.readFile(f, "utf8"));
  const rawItems = await read("docs/research/items.json");
  const config = await read("docs/research/official-config.json");
  const lab = await read("docs/research/lab-costs.json");
  const jobs = new Map();
  const add = (asset, file, kind, version) =>
    jobs.set(file, {
      file,
      kind,
      url: `https://pokebonk.com/assets/${asset}?v=${version}`,
    });
  for (const type of types)
    add(
      `ui/types/${type}.png`,
      `/images/types/game/${type}.png`,
      "Original game type icon",
      "B21hKCIf",
    );
  const keys = new Set([
    ...config.rr.map((x) => x.key),
    ...config.cr.map((x) => x.icon),
    ...lab.map((x) => x.icon),
    "poke-ball",
    "great-ball",
    "master-ball",
    "star-piece",
  ]);
  for (const key of keys)
    add(
      rawItems[key]?.icon || `items/${key}.png`,
      `/images/items/pokebonk/${key}.png`,
      "Original game item sprite",
      "Kgc19xzJ",
    );
  for (const name of [
    "stardust",
    "research",
    "map-bill",
    "mission",
    "record",
    "gold",
    "crown",
    "check",
    "champion",
    "fullscreen",
    "map-portal",
  ])
    add(
      `ui/icons/${name}.png`,
      `/images/icons/game/${name}.png`,
      "Original game interface icon",
      "kF4K1v3m",
    );
  for (const rank of ["master", "elite"])
    add(
      `ui/ranks/${rank}.png`,
      `/images/ranks/game/${rank}.png`,
      "Original game rank badge",
      "TWsEfU0e",
    );
  let index = 0;
  const queue = [...jobs.values()],
    records = [],
    failed = [];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (index < queue.length) {
        const job = queue[index++];
        try {
          // Keep the original game asset; fail rather than substituting another provider.
          const response = await fetch(job.url, {
            signal: AbortSignal.timeout(25000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const bytes = Buffer.from(await response.arrayBuffer());
          if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
            throw new Error("Expected PNG image");
          await fs.mkdir(path.dirname("public" + job.file), {
            recursive: true,
          });
          await fs.writeFile("public" + job.file, bytes);
          records.push({
            ...job,
            retrieved: "2026-10-23",
            provider: "pokebonk.com",
            copyright: "Respective Pokémon and PokeBonk artwork rights holders",
          });
        } catch (error) {
          failed.push({ file: job.file, error: error.message });
        }
      }
    }),
  );
  records.sort((a, b) => a.file.localeCompare(b.file));
  await fs.writeFile(
    "src/data/media/wiki-sources.json",
    JSON.stringify(records, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({ downloaded: records.length, failures: failed }, null, 2),
  );
  if (failed.length) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
