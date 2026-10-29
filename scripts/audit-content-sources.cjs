// Independent audit of all published records against the pinned source data,
// inspected original calculators, full configuration and artwork identities.
const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const crypto = require("node:crypto");
const profile = require("./data/active-snapshot.json");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const data = (name) => read(`src/data/${name}.json`);
const raw = (name) => read(`docs/research/${name}.json`);
const config = raw("official-config"),
  english = raw("i18n-en"),
  runtime = raw("runtime-reference");
const pokemon = data("pokedex/pokemon"),
  moves = data("wiki/moves"),
  items = data("wiki/items"),
  fusions = data("wiki/fusions"),
  achievements = data("wiki/achievements"),
  lab = data("wiki/lab");
const species = raw("pokemon").filter((p) => p.id <= 151),
  runtimeMoves = new Map(runtime.moves.map((m) => [m.key, m.definition]));
let assertions = 0;
const eq = (actual, expected, label) => {
  assert.deepEqual(actual, expected, label);
  assertions++;
};
const manifest = read(profile.manifest);
for (const [download, active] of [
  ["game.js", "official-game.js"],
  ["news.js", "official-news.js"],
  ["en.js", "official-en.js"],
  ["pokemon.json", "pokemon.json"],
  ["moves.json", "moves.json"],
  ["items.json", "items.json"],
  ["i18n-en.json", "i18n-en.json"],
])
  eq(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync("docs/research/" + active))
      .digest("hex"),
    manifest.files.find((f) => f.file === download).sha256,
    active + " pinned reviewed source identity",
  );
eq(config.m, profile.version, "official game version");
for (const collection of [pokemon, moves, items, fusions, achievements, lab])
  for (const entry of collection)
    eq(
      entry.gameVersion,
      config.m,
      (entry.slug || entry.id) + " verified game version",
    );
for (const p of pokemon) {
  const original = species.find((s) => s.id === p.id),
    partner = config.ot.find((s) => s.id === p.id);
  eq(p.name, english.pokemon[p.id], p.slug + " species name");
  eq(p.slug, original.key, p.slug + " slug");
  eq(p.types, original.types, p.slug + " types");
  eq(p.baseStats, original.stats, p.slug + " six species stats");
  eq(p.image, `/images/pokemon/game/portraits/${p.id}.png`, p.slug + " image identity");
  eq(p.imageSource, `https://pokebonk.com/assets/portraits/${p.id}.png?v=OEZJxMKF`, p.slug + " original image source");
  eq(p.isPlayable, !!partner, p.slug + " League eligibility");
  eq(p.isStarter, !!partner?.start, p.slug + " starting eligibility");
  eq(p.moves, partner?.kit || [], p.slug + " kit");
  eq(p.passive, partner?.passive || null, p.slug + " passive");
  eq(p.evoFrom, original.evoFrom, p.slug + " preceding evolution");
  eq(p.family, original.family, p.slug + " evolution family");
  if (partner) {
    const challenge = [partner.challenge]
      .flat()
      .filter(Boolean)
      .map((x) => x.desc)
      .join(" ");
    eq(p.unlockCondition, challenge, p.slug + " unlock conditions");
    const path = runtime.evolutions.find((e) => e.id === p.id);
    eq(
      p.evolutionPath.map((e) => ({ id: e.id, level: e.level })),
      path.steps,
      p.slug + " original League evolution path",
    );
    const stats = runtime.baselines.find((s) => s.id === p.id).stats;
    eq(p.baseRunStats.hp, stats.maxHp, p.slug + " run HP");
    for (const key of ["armor", "regen", "moveSpeed", "physical", "special"])
      eq(
        p.baseRunStats[key],
        Number(stats[key].toFixed(key === "armor" || key === "regen" ? 2 : 3)),
        p.slug + " baseline " + key,
      );
  }
  const ultimate = runtime.ultimates[p.evolutionOrigin.id];
  eq(p.ultimate.names, ultimate.names, p.slug + " inherited Ultimate names");
  eq(
    p.ultimate.descriptions,
    ultimate.descs,
    p.slug + " inherited Ultimate effects",
  );
  for (const next of p.evolution) {
    const path = runtime.evolutions.find((e) => e.id === p.evolutionOrigin.id);
    const id = pokemon.find((p) => p.slug === next.slug).id;
    eq(
      next.level,
      path.branch?.includes(id)
        ? path.branchLevel
        : path.steps.find((s) => s.id === id)?.level,
      p.slug + " next run threshold",
    );
  }
}
for (const m of moves) {
  if (m.type !== "passive") {
    const source = runtimeMoves.get(m.slug);
    eq(m.name, source.name, m.slug + " translated move name");
    eq(m.type, source.type, m.slug + " move type");
    eq(m.shape, source.arch, m.slug + " actual attack pattern");
    eq(m.damageClass, source.cls, m.slug + " actual damage class");
    eq(m.description, source.desc, m.slug + " generated effect and statuses");
    eq(
      m.baseDefinition,
      source,
      m.slug + " complete level-one calculator result",
    );
    eq(
      m.image,
      `/images/types/game/${source.type}.png`,
      m.slug + " move icon identity",
    );
    eq(
      m.relatedPokemon,
      config.ot
        .filter((p) => p.kit.includes(m.slug))
        .map((p) => species.find((s) => s.id === p.id).key),
      m.slug + " associated partners",
    );
  } else {
    eq(
      m.name,
      runtime.passives[m.slug].name,
      m.slug + " original passive name",
    );
    eq(
      m.description,
      runtime.passives[m.slug].desc,
      m.slug + " original passive effect",
    );
    const owners = config.ot
      .filter((p) => p.passive === m.slug)
      .map((p) => species.find((s) => s.id === p.id).key);
    eq(m.relatedPokemon, owners, m.slug + " passive owners");
    eq(
      m.image,
      pokemon.find((p) => p.slug === owners[0]).image,
      m.slug + " passive portrait identity",
    );
  }
}
for (const f of fusions) {
  const source = runtime.fusions.find((x) => x.key === f.slug);
  eq(
    [f.name, f.description, f.member, f.type, f.moves],
    [source.name, source.desc, source.member, source.type, source.moves],
    f.slug + " original fusion definition",
  );
  for (const [field, original] of [
    ["damageClass", "cls"],
    ["cooldown", "cd"],
    ["power", "power"],
    ["hits", "hits"],
    ["range", "range"],
  ])
    eq(f[field], source[original], f.slug + " fusion " + field);
  eq(f.secondaryType, source.type2 || null, f.slug + " secondary type");
  eq(f.status, source.status || null, f.slug + " status");
  const owner = config.ot.find((p) => p.id === f.member);
  assert.ok(
    f.moves.every((move) => owner.kit.includes(move)),
    f.slug + " parent move ownership",
  );
  assertions++;
  eq(
    f.image,
    `/images/pokemon/game/portraits/${f.member}.png`,
    f.slug + " signature portrait",
  );
  eq(
    f.typeImage,
    `/images/types/game/${f.type}.png`,
    f.slug + " result type icon",
  );
}
for (const i of items) {
  const source =
    i.category === "Vitamin"
      ? config.cr.find((x) => x.key === i.slug)
      : config.rr.find((x) => x.key === i.slug);
  eq(
    i.name,
    i.category === "Vitamin"
      ? source.name
      : english.items?.[i.slug]?.name ||
          i.slug
            .split("-")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" "),
    i.slug + " English item name",
  );
  eq(
    i.image,
    `/images/items/pokebonk/${source.icon || source.key}.png`,
    i.slug + " item image identity",
  );
  if (i.category === "Item") {
    eq(i.description, source.desc, i.slug + " game-specific item effect");
    eq(i.rarity, config.or[source.rarity], i.slug + " rarity");
    eq(i.max, source.max || null, i.slug + " stack limit");
  } else
    eq(
      i.description,
      `${source.desc}. ${source.kind === "mul" ? "+ " + Math.round(source.per * 100) + "%" : "+ " + source.per} per common-rarity level.${source.note ? " " + source.note : ""}`,
      i.slug + " vitamin increment",
    );
}
for (const a of achievements) {
  const source = config.Jt.find((x) => x.id === a.id);
  for (const key of ["name", "desc", "counter", "goal", "reward"])
    eq(a[key], source[key], a.id + " achievement " + key);
  eq(
    a.category,
    config.Yt.find((c) => c.id === (source.cat || "progress")).name,
    a.id + " original achievement category",
  );
}
// Re-evaluate original cost functions, rather than trusting cached cost tables.
let code = fs.readFileSync("docs/research/official-news.js", "utf8");
const exportList = code.match(/export\{([^}]+)\}/)[1];
code = code.replace(
  /^import[^;]+;/,
  `const t=(s,p)=>{let v=words[s]||s;for(const k in p||{})v=v.replaceAll('{'+k+'}',p[k]);return v};const e=[];`,
);
code = code.replace(
  /export\{[^}]+\};?/,
  `globalThis.exports={${exportList
    .split(",")
    .map((x) => {
      const [a, b = a] = x.trim().split(" as ");
      return JSON.stringify(b) + ":" + a;
    })
    .join(",")}}`,
);
const context = vm.createContext(
  { words: raw("english-strings") },
  { codeGeneration: { strings: false, wasm: false } },
);
vm.runInContext(code, context, { timeout: 5000 });
for (const upgrade of lab) {
  const source = context.exports[profile.exports.Gt].find((x) => x.id === upgrade.id);
  eq(upgrade.name, source.name, upgrade.id + " Lab name");
  eq(upgrade.desc, source.desc, upgrade.id + " Lab effect");
  eq(upgrade.max, source.max, upgrade.id + " Lab cap");
  eq(
    upgrade.image,
    `/images/items/pokebonk/${source.icon}.png`,
    upgrade.id + " Lab illustration identity",
  );
  eq(
    upgrade.costsByLevel,
    Array.from({ length: source.max }, (_, n) => source.cost(n)),
    upgrade.id + " complete original cost function",
  );
}
const releases = data("updates/releases"),
  current = JSON.parse(fs.readFileSync("docs/research/recheck-2026-10-28/releases.json","utf8")).filter(r=>r.notes.length).map(r=>({...r,notes:r.notes.map(n=>(Array.isArray(n)?n[1]:n).replace(/\*\*/g,""))}));
eq(
  releases.map((r) => ({ version: r.version, date: r.date, notes: r.notes })),
  current.map((r) => ({ version: r.version, date: r.date, notes: r.notes })),
  "all published release history",
);
const featureConfig=JSON.parse(fs.readFileSync("docs/research/recheck-2026-10-28/config.json","utf8"));
for(const event of data("events/events")) { const original=Object.values(featureConfig).find(v=>Array.isArray(v)&&v[0]?.id==="halloween26").find(e=>e.id===event.id); for(const key of ["name","desc","start","end","claimDays","track","quests","board","clans","cosmetics"])eq(event[key],original[key],event.id+" original event "+key); }
const daily=data("events/daily-mutations");
const officialMutations=Object.values(featureConfig).find(v=>Array.isArray(v)&&v[0]?.id==="metronome"&&v[0]?.enemy);
for(const m of daily.mutations){const original=officialMutations.find(v=>v.id===m.id);for(const key of ["tier","swap","enemy","scaling","xp","gold","hp","dmg","name","prize","desc","rules"])eq(m[key],original[key],m.id+" mutation "+key);}
eq(daily.stardust,Object.values(featureConfig).find(v=>Array.isArray(v)&&JSON.stringify(v)==="[0,0,60,120,180,300]"),"daily cumulative Stardust milestones");
for(const a of achievements.filter(a=>a.look))eq(a.coopEligible,!/taking at most \d+ hits/.test(config.Jt.find(s=>s.id===a.id).desc),a.id+" cooperative Looks eligibility");
for(const m of data("media/current-feature-sources"))eq(crypto.createHash("sha256").update(fs.readFileSync("public"+m.file)).digest("hex"),m.sha256,m.file+" original mutation image");
const visuals = data("media/guide-visuals");
const checkedRules = raw("current-rule-comparison").current,
  rules = data("wiki/rules");
eq(
  rules.moveLevelCap,
  checkedRules.caps["tmCase=false,maxEther=false"].move,
  "ordinary move cap",
);
eq(
  rules.moveLevelCapWithTmCase,
  checkedRules.caps["tmCase=true,maxEther=false"].move,
  "TM Case move cap",
);
eq(
  rules.fusionStarCap,
  checkedRules.caps["tmCase=false,maxEther=false"].fusion,
  "fusion star cap",
);
eq(
  rules.fusionStarCapWithTmCase,
  checkedRules.caps["tmCase=true,maxEther=false"].fusion,
  "TM Case fusion cap",
);
eq(
  rules.vitaminLevelCapWithMaxEther,
  checkedRules.caps["tmCase=false,maxEther=true"].vitamin,
  "Max Ether vitamin cap",
);
eq(
  checkedRules.removal["tm-case"],
  { normalMove: 8, fusion: 5, vitamin: 12 },
  "original TM Case removal and level trimming",
);
eq(
  checkedRules.removal["max-ether"],
  { normalMove: 10, fusion: 6, vitamin: 10 },
  "original Max Ether removal and level trimming",
);
eq(
  checkedRules.readiness.length,
  79 * 4,
  "all signature recipe level combinations",
);
for (const result of checkedRules.readiness)
  eq(
    result.ready,
    result.left >= rules.fusionIngredientLevel &&
      result.right >= rules.fusionIngredientLevel,
    result.key + " level " + result.left + "/" + result.right,
  );
const ranking = data("tier-list/rankings");
eq(ranking.gameVersion, config.m, "recommendation version");
eq(
  ranking.entries.map((p) => p.id).sort((a, b) => a - b),
  config.ot.map((p) => p.id).sort((a, b) => a - b),
  "complete recommendation roster",
);
for (const entry of ranking.entries) {
  const p = pokemon.find((p) => p.id === entry.id);
  eq(entry.baseline, p.baseRunStats, p.slug + " recommendation baseline");
  eq(
    entry.passive,
    runtime.passives[p.passive].desc,
    p.slug + " recommendation passive",
  );
  eq(
    entry.kit.map((m) => m.slug),
    p.moves,
    p.slug + " recommendation kit",
  );
}
for (const guide of data("guides/guides"))
  eq(guide.gameVersion, config.m, guide.slug + " guide version");
const beginner = data("guides/guides").find(
  (g) => g.slug === "beginners-guide",
);
for (const id of [1, 7, 4]) {
  const p = pokemon.find((p) => p.id === id),
    passive = runtime.passives[p.passive];
  eq(
    beginner.sections[1].rows.find((r) => r[0] === p.name),
    [p.name, String(p.baseRunStats.hp), passive.name + ": " + passive.desc],
    p.slug + " guide starter facts",
  );
}
for (const guide of data("guides/guides"))
  assert.ok(
    visuals[guide.slug],
    guide.slug + " explicit relevant guide illustration",
  );
fs.mkdirSync("docs/audits", { recursive: true });
fs.writeFileSync(
  "docs/audits/content-source-verification.json",
  JSON.stringify(
    {
      checkedAt: profile.checkedAt,
      gameplaySnapshot: config.m,
      releaseHistory: releases[0].version,
      assertions,
      counts: {
        pokemon: pokemon.length,
        moves: moves.length,
        items: items.length,
        fusions: fusions.length,
        achievements: achievements.length,
        lab: lab.length,
        releases: releases.length,
      },
      status: "passed",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `PASS: ${assertions} source comparisons across all content collections.`,
);
