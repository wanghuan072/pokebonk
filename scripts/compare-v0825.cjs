const fs = require("node:fs");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const skip = new Set(["gameVersion", "lastVerified", "source", "isDetails"]);
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !skip.has(k))
        .map(([k, v]) => [k, clean(v)]),
    );
  return value;
}
function diff(a, b, path = "") {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === "object" && typeof b === "object")
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) =>
      diff(a[k], b[k], path ? path + "." + k : k),
    );
  return [{ field: path, before: a ?? null, after: b ?? null }];
}
const rules = read("docs/research/v0825-rule-comparison.json");
const oldRuntime = {
  ...read("docs/research/v0.8.13/runtime-reference.json"),
  fusions: rules.old.fusions,
};
const currentRuntime = {
  ...read("docs/research/runtime-reference.json"),
  fusions: rules.current.fusions,
};
const report = {
  version: "0.8.25",
  build: read("docs/research/v0825-source-manifest.json").build,
  checkedAt: "2026-10-23",
  sourceFiles: read("docs/research/v0825-source-manifest.json").files,
  collections: {},
  runtime: diff(oldRuntime, currentRuntime),
  caps: { before: rules.old.caps, after: rules.current.caps },
  fusionValidation: {
    forwardPairs: rules.current.resolved.length,
    reversePairs: rules.current.resolved.length,
    levelCases: rules.current.readiness.length,
    excludedPatterns: rules.current.exclusions,
  },
  notes: [
    "Fusion class, cooldown, range, power, hit weighting and status fields were not previously published; their addition is an enrichment, not a balance change.",
    "TM Case already allowed fusion ★6 in the archived v0.8.13 implementation. v0.8.25 corrects the English item description.",
  ],
};
report.itemRemoval = {
  before: rules.old.removal,
  after: rules.current.removal,
};
report.runtimeScope =
  "Extracted level-one move definitions, baselines, evolution paths, passive metadata and signature recipe metadata. This is not a claim that every attack handler is unchanged.";
report.behaviorChanges = [
  {
    version: "0.8.17",
    change:
      "Selling TM Case and Max Ether now trims the corresponding over-cap move, fusion and vitamin levels.",
    verification:
      "Executed the original removeItem method and move-level trimming function with controlled inventory fixtures.",
  },
  {
    version: "0.8.17",
    change:
      "Official notes report fixes for fusions ignoring extra projectiles. Guide advice now accounts for this when comparing older build reports.",
    verification: "Published official release notes; no measured DPS claim.",
  },
];
for (const path of [
  "pokedex/pokemon",
  "wiki/moves",
  "wiki/fusions",
  "wiki/items",
  "wiki/lab",
  "wiki/achievements",
  "tier-list/rankings",
  "guides/guides",
]) {
  const before = read(
      "docs/research/site-before-v0825/" + path.replaceAll("/", "-") + ".json",
    ),
    after = read("src/data/" + path + ".json");
  if (!Array.isArray(before)) {
    report.collections[path] = { changes: diff(clean(before), clean(after)) };
    continue;
  }
  const key = (x) => x.slug || x.id;
  const changes = [];
  for (const entry of after) {
    const old = before.find((x) => key(x) === key(entry));
    const fields = diff(clean(old), clean(entry));
    if (fields.length) changes.push({ key: key(entry), fields });
  }
  report.collections[path] = {
    countBefore: before.length,
    countAfter: after.length,
    added: after.filter((x) => !before.some((y) => key(y) === key(x))).map(key),
    removed: before
      .filter((x) => !after.some((y) => key(y) === key(x)))
      .map(key),
    changed: changes,
  };
  console.log(
    path,
    after.length,
    "changed",
    changes.length,
    changes.slice(0, 5).map((x) => x.key),
  );
}
fs.mkdirSync("docs/audits", { recursive: true });
fs.writeFileSync(
  "docs/audits/v0825-data-diff.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  "runtime changed fields",
  report.runtime.length,
  report.runtime.slice(0, 15),
);
