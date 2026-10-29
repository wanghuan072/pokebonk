// Generates factual records from the reviewed active client. See docs/data-maintenance.md.
const fs = require("node:fs"),
  ts = require("typescript");
const profile = require("./data/active-snapshot.json");
const read = (n) =>
  JSON.parse(fs.readFileSync("docs/research/" + n + ".json", "utf8"));
const config = read("official-config"),
  words = read("english-strings"),
  en = read("i18n-en");
const { source, map } = require("./lib/official-client.cjs").loadClient();
const sourceNames = Object.fromEntries(
  Object.entries(map.variables).map(([old, current]) => [current, old]),
);
const literal = (n) => {
  if (!n) return undefined;
  if (ts.isStringLiteralLike(n)) return n.text;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.MinusToken)
    return -literal(n.operand);
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(n))
    return n.elements.map(literal).filter((x) => x !== undefined);
  if (ts.isObjectLiteralExpression(n))
    return Object.fromEntries(
      n.properties
        .filter(ts.isPropertyAssignment)
        .map((p) => [p.name.text, literal(p.initializer)])
        .filter((x) => x[1] !== undefined),
    );
  if (ts.isCallExpression(n) && n.expression.getText(source) === "c") {
    let text = literal(n.arguments[0]);
    return words[text] || text;
  }
};
const vars = {};
function walk(n) {
  if (
    ts.isVariableDeclaration(n) &&
    n.parent.parent.parent === source &&
    [
      "kg",
      "zm",
      "Km",
      "Qm",
      "sh",
      "fh",
      "Yh",
      "Ly",
      "zy",
      "Hy",
      "Xy",
      "nb",
      "db",
      "Cm",
      "Cp",
      "Ep",
      "Lp",
      "Up",
      "Yp",
      "Gh",
    ].includes(sourceNames[n.name.getText(source)])
  )
    vars[sourceNames[n.name.getText(source)]] = literal(n.initializer);
  ts.forEachChild(n, walk);
}
walk(source);
// The client appends 65 partner Ultimates after the initial table.
function appendUltimate(n) {
  if (
    ts.isBinaryExpression(n) &&
    n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    ts.isElementAccessExpression(n.left) &&
    n.left.expression.getText(source) === map.variables.Cm
  ) {
    const id = literal(n.left.argumentExpression),
      value = literal(n.right);
    if (id !== undefined && value?.names) vars.Cm[id] = value;
  }
  ts.forEachChild(n, appendUltimate);
}
appendUltimate(source);
Object.assign(vars.Cm, vars.Cp, vars.Ep, vars.Lp, vars.Up, vars.Yp);
const runtime = read("runtime-reference");
const runtimeMoves = new Map(runtime.moves.map((m) => [m.key, m.definition]));
const runtimeEvolution = new Map(runtime.evolutions.map((e) => [e.id, e]));
// Match the client’s final Object.assign order, including newer passive overrides.
vars.kg = Object.assign(
  {},
  vars.kg,
  vars.zm,
  vars.Km,
  vars.Qm,
  vars.sh,
  vars.fh,
);
const stamp = {
  gameVersion: config.m,
  lastVerified: profile.checkedAt,
  source: "https://pokebonk.com/",
};
if (stamp.gameVersion !== profile.version)
  throw Error("Review the version before generating gameplay data.");
function write(path, data) {
  if (Array.isArray(data))
    data = data.map((entry) => ({ ...entry, isDetails: false }));
  fs.mkdirSync("src/data/" + path.substring(0, path.lastIndexOf("/")), {
    recursive: true,
  });
  fs.writeFileSync("src/data/" + path, JSON.stringify(data, null, 2) + "\n");
}
const roster = new Map(config.ot.map((x) => [x.id, x]));
const rawPokemon = read("pokemon").filter((x) => x.id <= 151);
function partnerFor(p) {
  let current = p;
  while (current) {
    if (roster.has(current.id)) return roster.get(current.id);
    current = rawPokemon.find((x) => x.id === current.evoFrom);
  }
  return null;
}
const pokemon = rawPokemon.map((p) => {
  const member = roster.get(p.id);
  const origin = partnerFor(p);
  const path = origin ? runtimeEvolution.get(origin.id) : null;
  const total = Object.values(p.stats).reduce((sum, n) => sum + n, 0);
  const ratio = (n) => (n / total) * 6;
  const evolution = rawPokemon
    .filter((x) => x.evoFrom === p.id)
    .map((next) => {
      const step = path?.steps.find((s) => s.id === next.id);
      return {
        slug: next.key,
        name: en.pokemon[next.id] || next.name,
        level: path?.branch?.includes(next.id)
          ? path.branchLevel
          : (step?.level ?? null),
      };
    });
  const ultimate = vars.Cm?.[origin?.id];
  return {
    id: p.id,
    slug: p.key,
    name: en.pokemon[p.id] || p.name,
    types: p.types,
    image: `/images/pokemon/game/portraits/${p.id}.png`,
    imageSource: `https://pokebonk.com/assets/portraits/${p.id}.png?v=OEZJxMKF`,
    baseStats: p.stats,
    baseRunStats: member
      ? {
          hp: Math.round(70 + 45 * ratio(p.stats.hp)),
          armor: Number(
            (6 * ratio(p.stats.def) + 3 * ratio(p.stats.spd)).toFixed(2),
          ),
          regen: Number((0.25 + 0.25 * ratio(p.stats.hp)).toFixed(2)),
          moveSpeed: Number((0.92 + 0.12 * ratio(p.stats.spe)).toFixed(3)),
          physical: Number((0.82 + 0.2 * ratio(p.stats.atk)).toFixed(3)),
          special: Number((0.82 + 0.2 * ratio(p.stats.spa)).toFixed(3)),
        }
      : null,
    evolution,
    evolutionOrigin: origin
      ? {
          id: origin.id,
          name: en.pokemon[origin.id],
          slug: rawPokemon.find((x) => x.id === origin.id).key,
        }
      : null,
    evolutionPath: path
      ? path.steps.map((s) => ({
          id: s.id,
          name: en.pokemon[s.id],
          slug: rawPokemon.find((x) => x.id === s.id).key,
          level: s.level,
        }))
      : [],
    evolutionBranch: path?.branch
      ? path.branch.map((id) => ({
          id,
          name: en.pokemon[id],
          level: path.branchLevel,
        }))
      : [],
    ultimate: ultimate
      ? {
          names: ultimate.names,
          descriptions: ultimate.descs,
          type: ultimate.type,
          durations: ultimate.dur,
          origin: origin.id,
          forms:
            path?.steps.slice(0, ultimate.names.length).map((s) => ({
              id: s.id,
              name: en.pokemon[s.id],
              image: `/images/pokemon/game/portraits/${s.id}.png`,
            })) || [],
        }
      : null,
    isPlayable: !!member,
    role: member?.role || "Pokédex entry",
    isStarter: !!member?.start,
    description: member
      ? `${en.pokemon[p.id] || p.name} is a ${member.role.toLowerCase()} League partner whose opening move is ${en.moves[read("moves").find((m) => m.key === member.kit[0]).id]}.`
      : `${en.pokemon[p.id] || p.name} is included in the original game's Kanto Pokédex. A Pokédex entry does not by itself confirm a selectable League partner.`,
    unlockCondition: member
      ? (Array.isArray(member.challenge)
          ? member.challenge
          : [member.challenge]
        )
          .filter(Boolean)
          .map((x) => x.desc)
          .join(" ")
      : null,
    passive: member?.passive || null,
    moves: member?.kit || [],
    kitLevels: member?.kit.map((_, i) => Math.max(1, config.it[i])) || [],
    evoFrom: p.evoFrom,
    family: p.family,
    evoLevels: member?.evoLevels || null,
    ...stamp,
  };
});
write("pokedex/pokemon.json", pokemon);
const moveMap = new Map(read("moves").map((m) => [m.key, m]));
const used = [...new Set(config.ot.flatMap((p) => p.kit))];
const moves = used
  .filter((k) => moveMap.has(k))
  .map((k) => {
    let m = moveMap.get(k);
    return {
      id: m.id,
      slug: k,
      name: en.moves[m.id] || k.replaceAll("-", " "),
      type: m.type,
      category: config.ot.some((p) => p.kit[0] === k)
        ? "Starting move"
        : "Kit move",
      shape: runtimeMoves.get(k).arch,
      damageClass: runtimeMoves.get(k).cls,
      description: runtimeMoves.get(k).desc,
      baseDefinition: runtimeMoves.get(k),
      relatedPokemon: pokemon
        .filter((p) => p.moves.includes(k))
        .map((p) => p.slug),
      ...stamp,
    };
  });
const passives = Object.entries(vars.kg || {}).map(([key, p]) => ({
  id: key,
  slug: key,
  name:
    p.name ||
    key
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
  type: "passive",
  category: "Passive ability",
  shape: null,
  description: p.desc,
  relatedPokemon: pokemon.filter((x) => x.passive === key).map((x) => x.slug),
  ...stamp,
}));
const illustratedMoves = [
  ...moves,
  ...passives.filter((p) => p.relatedPokemon.length),
].map((m) => {
  const partners = m.relatedPokemon.map((slug) =>
    pokemon.find((p) => p.slug === slug),
  );
  const passive = m.type === "passive";
  return {
    ...m,
    image: passive ? partners[0].image : `/images/types/game/${m.type}.png`,
    imageAlt: passive
      ? `${partners[0].name}, partner with ${m.name}`
      : `${m.type} type icon from PokeBonk`,
    imageKind: passive ? "Partner portrait" : "Original game type icon",
    partners: partners.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.image,
    })),
  };
});
write("wiki/moves.json", illustratedMoves);
const fusions = ["Ly", "zy", "Hy", "Xy", "nb", "db"]
  .flatMap((k) => vars[k] || [])
  .map((f) => ({
    slug: f.key,
    name: f.name,
    description: f.desc,
    moves: f.moves || [],
    member: f.member || null,
    kind: f.kind,
    type: f.type,
    secondaryType: f.type2 || null,
    damageClass: f.cls,
    cooldown: f.cd,
    power: f.power,
    hits: f.hits,
    range: f.range,
    status: f.status || null,
    image: `/images/pokemon/game/portraits/${f.member}.png`,
    typeImage: `/images/types/game/${f.type}.png`,
    pair: f.pair || null,
    ...stamp,
  }))
  .filter((f) => f.name);
write("wiki/fusions.json", fusions);
const title = (s) =>
  s
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
write("wiki/items.json", [
  ...config.rr.map((x) => ({
    slug: x.key,
    name: en.items?.[x.key]?.name || title(x.key),
    category: "Item",
    image: `/images/items/pokebonk/${x.key}.png`,
    description: x.desc,
    rarity: config.or[x.rarity],
    max: x.max || null,
    ...stamp,
  })),
  ...config.cr.map((x) => ({
    slug: x.key,
    name: x.name,
    category: "Vitamin",
    image: `/images/items/pokebonk/${x.icon}.png`,
    description: `${x.desc}. ${x.kind === "mul" ? "+ " + Math.round(x.per * 100) + "%" : "+ " + x.per} per common-rarity level.${x.note ? " " + x.note : ""}`,
    rarity: null,
    max: null,
    ...stamp,
  })),
]);
write(
  "wiki/achievements.json",
  config.Jt.map((x) => ({
    ...x,
    image: "/images/items/pokebonk/great-ball.png",
    completedImage: "/images/items/pokebonk/poke-ball.png",
    category: config.Yt.find(
      (category) => category.id === (x.cat || "progress"),
    ).name,
    ...stamp,
  })),
);
write(
  "wiki/lab.json",
  read("lab-costs").map((x) => ({
    ...x,
    image: `/images/items/pokebonk/${x.icon}.png`,
    category: x.stat ? "Permanent stats" : "Unlocks & tools",
    ...stamp,
  })),
);
write(
  "updates/releases.json",
  read("current-releases")
    .filter((x) => x.notes.length)
    .map((x) => ({
      slug: "v" + x.version.replaceAll(".", "-"),
      version: x.version,
      title: x.title || "PokeBonk " + x.version,
      noteTypes: x.noteTypes,
      date: x.date,
      notes: x.notes,
      gameVersion: read("current-releases")[0].version,
      lastVerified: profile.checkedAt,
      source: stamp.source,
    })),
);
require("./build-tier-analysis.cjs");
require("./enrich-current-data.cjs");
console.log({
  pokemon: pokemon.length,
  partners: roster.size,
  moves: moves.length,
  passives: passives.length,
  fusions: fusions.length,
  achievements: config.Jt.length,
  lab: config.Gt.length,
});

require("./sync-current-features.cjs");
