// Manual provenance verification: compare used image bytes/pixels with their
// recorded original URLs. Does not run during application builds.
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const sharp = require("sharp");
const hash = (b) => crypto.createHash("sha256").update(b).digest("hex");
async function main() {
  const profile = require("./data/active-snapshot.json");
  const read = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
  const previous = process.argv.includes("--retry-failed") ? await read("docs/audits/media-source-verification.json") : null;
  const manifests = [
    ...(await read("src/data/media/current-feature-sources.json")),
    ...(await read("src/data/media/sources.json")),
    ...(await read("src/data/media/wiki-sources.json")),
    ...(await read("src/data/media/game-sprite-sources.json")).records,
    ...(await read("src/data/media/game-scenery-sources.json")),
  ];
  const sources = new Map(manifests.map((m) => [m.file, m]));
  const records = Object.values(await read("src/data/media/game-sprites.json")).map((s) => s.src);
  records.push("/images/home/game-tower.jpg",...(await read("src/data/events/daily-mutations.json")).mutations.map(m=>m.image));
  for (const name of [
    "pokedex/pokemon",
    "wiki/moves",
    "wiki/items",
    "wiki/fusions",
    "wiki/generic-fusions",
    "wiki/achievements",
    "wiki/lab",
  ]) {
    const entries = await read(`src/data/${name}.json`);
    for (const e of entries)
      for (const key of ["image", "typeImage", "completedImage"])
        if (e[key]) records.push(e[key]);
  }
  for (const visual of Object.values(
    await read("src/data/media/guide-visuals.json"),
  ))
    if (visual.kind === "icons") records.push(visual.src);
  for (const entry of (await read("src/data/leaderboard/snapshot.json"))
    .entries)
    records.push(`/images/ranks/game/${entry.badge.toLowerCase()}.png`);
  const queue = [...new Set(records)].filter((file) => !previous || previous.results.some((r) => r.file === file && r.result === "FAILED")).map((file) => {
    if (!sources.has(file)) throw Error("Unrecorded source " + file);
    return sources.get(file);
  });
  let cursor = 0;
  const results = [];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (cursor < queue.length) {
        const record = queue[cursor++];
        try {
          let response;
          for (let attempt = 0; attempt < 2; attempt++) {
            response = await fetch(record.url, {
              signal: AbortSignal.timeout(25000),
            });
            if (response.ok) break;
          }
          if (!response.ok) throw Error("Source HTTP " + response.status);
          const original = Buffer.from(await response.arrayBuffer()),
            local = await fs.readFile("public" + record.file);
          const expected = record.crop ? await sharp(original).extract(record.crop).png().toBuffer() : record.file.endsWith(".webp")
            ? await sharp(original).webp({ quality: 90 }).toBuffer()
            : original;
          const exact = hash(expected) === hash(local);
          if (!exact) {
            const a = await sharp(record.crop ? expected : original)
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true });
            const b = await sharp(local)
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true });
            if (
              a.info.width !== b.info.width ||
              a.info.height !== b.info.height
            )
              throw Error("Source dimensions do not match");
            let squared = 0;
            for (let i = 0; i < a.data.length; i++)
              squared += (a.data[i] - b.data[i]) ** 2;
            const rmse = Math.sqrt(squared / a.data.length);
            if (rmse > 4)
              throw Error("Source pixel mismatch, RMSE " + rmse.toFixed(3));
            results.push({
              file: record.file,
              url: record.url,
              result: "matching pixels after image encoding",
              rmse,
            });
          } else
            results.push({
              file: record.file,
              url: record.url,
              result: "exact bytes after documented encoding",
              sha256: hash(local),
            });
        } catch (error) {
          results.push({
            file: record.file,
            url: record.url,
            result: "FAILED",
            error: error.message,
          });
        }
      }
    }),
  );
  if (previous) results.push(...previous.results.filter((r) => !results.some((fresh) => fresh.file === r.file)));
  results.sort((a, b) => a.file.localeCompare(b.file));
  await fs.mkdir("docs/audits", { recursive: true });
  await fs.writeFile(
    "docs/audits/media-source-verification.json",
    JSON.stringify(
      {
        checkedAt: profile.checkedAt,
        checked: results.length,
        failures: results.filter((x) => x.result === "FAILED").length,
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log({
    checked: results.length,
    failures: results.filter((x) => x.result === "FAILED"),
  });
  if (results.some((x) => x.result === "FAILED")) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
