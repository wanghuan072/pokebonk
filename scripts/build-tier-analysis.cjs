const fs = require("node:fs");
const profile = require("./data/active-snapshot.json");
const pokemon = JSON.parse(
  fs.readFileSync("src/data/pokedex/pokemon.json", "utf8"),
);
const moves = JSON.parse(fs.readFileSync("src/data/wiki/moves.json", "utf8"));
const roles = {
  sustain: [
    "bulbasaur",
    "zubat",
    "chansey",
    "tangela",
    "staryu",
    "slowpoke",
    "lapras",
    "bellsprout",
    "clefairy",
    "ekans",
    "oddish",
  ],
  defense: [
    "squirtle",
    "gastly",
    "abra",
    "geodude",
    "kabuto",
    "omanyte",
    "rhyhorn",
    "nidoran-f",
    "mr-mime",
    "mewtwo",
    "goldeen",
  ],
  offense: [
    "machop",
    "krabby",
    "pinsir",
    "kangaskhan",
    "zapdos",
    "mewtwo",
    "scyther",
    "rattata",
    "moltres",
    "mew",
    "hitmonchan",
    "hitmonlee",
  ],
  control: [
    "gastly",
    "articuno",
    "ekans",
    "pikachu",
    "tangela",
    "paras",
    "horsea",
    "clefairy",
    "growlithe",
    "slowpoke",
    "jynx",
    "mr-mime",
    "abra",
  ],
  setup: ["magikarp", "caterpie", "weedle", "ditto", "eevee", "dratini"],
};
const partners = pokemon.filter((p) => p.isPlayable);
const percentile = (key, value) =>
  Math.round(
    (partners.filter((p) => p.baseRunStats[key] <= value).length /
      partners.length) *
      100,
  );
const entries = partners
  .map((p) => {
    const s = p.baseRunStats,
      passive = moves.find((m) => m.slug === p.passive),
      kit = p.moves.map((slug) => moves.find((m) => m.slug === slug));
    const sustain = roles.sustain.includes(p.slug),
      defense = roles.defense.includes(p.slug),
      control = roles.control.includes(p.slug),
      offense = roles.offense.includes(p.slug),
      setup = roles.setup.includes(p.slug);
    const durability = Math.round(
      percentile("hp", s.hp) * 0.55 +
        percentile("armor", s.armor) * 0.2 +
        percentile("regen", s.regen) * 0.25,
    );
    const comfort = Math.min(
      100,
      Math.round(
        durability * 0.45 +
          25 +
          (sustain ? 20 : 0) +
          (defense ? 15 : 0) +
          (control ? 10 : 0) -
          (setup ? 15 : 0),
      ),
    );
    const pressure = Math.min(
      100,
      Math.round(
        Math.max(
          percentile("physical", s.physical),
          percentile("special", s.special),
        ) *
          0.6 +
          15 +
          (offense ? 20 : 0) +
          (control ? 5 : 0),
      ),
    );
    const utility = Math.min(
      100,
      30 +
        (sustain ? 25 : 0) +
        (defense ? 20 : 0) +
        (control ? 20 : 0) +
        (p.slug === "mew" ? 25 : 0),
    );
    const score = Math.round(comfort * 0.5 + pressure * 0.3 + utility * 0.2),
      tier = score >= 72 ? "S" : score >= 61 ? "A" : score >= 48 ? "B" : "C";
    return {
      slug: p.slug,
      name: p.name,
      id: p.id,
      isDetails: false,
      tier,
      score,
      comfort,
      pressure,
      utility,
      durability,
      focus: sustain
        ? "Recovery"
        : defense
          ? "Defense"
          : offense
            ? "Offense"
            : control
              ? "Control"
              : setup
                ? "Setup"
                : "Flexible",
      passive: passive?.description || "",
      kit: kit.map((m) => ({
        name: m.name,
        slug: m.slug,
        type: m.type,
        shape: m.shape,
      })),
      baseline: s,
      caution: setup
        ? "Needs a deliberate opening and a plan for its payoff."
        : s.hp < 105
          ? "A smaller opening HP pool leaves less room for contact mistakes."
          : s.moveSpeed < 1
            ? "A slower baseline makes route choice and spacing more important."
            : "Passive benefits still depend on the attacks and targets in your run.",
    };
  })
  .sort((a, b) => b.score - a.score || a.id - b.id);
const data = {
  gameVersion: pokemon[0].gameVersion,
  lastVerified: profile.checkedAt,
  scope:
    "All 79 League starting kits; evolved forms belong to their original partner",
  basis:
    "Editorial Classic opening-comfort model. No measured DPS or win-rate claim. Player board includes all 151 species.",
  method: {
    weights: { comfort: 50, pressure: 30, utility: 20 },
    description:
      "Comfort combines relative baseline HP (55%), armor (20%) and regen (25%), then curated recovery, defense and control bonuses with a setup penalty. Pressure uses the stronger physical/special baseline percentile plus an editorial offensive-kit bonus. Utility rewards recovery, protection and control. Scores compare openings, not endgame damage.",
    limitations: [
      "Baselines exclude passive modifiers, Lab, vitamins, items and enemy resistances.",
      "Passive bonuses are editorial judgments, not measured effect sizes.",
      "Attack geometry, targeting, status immunity and late-run scaling can reverse an ordering.",
      "Non-evolving partners also receive growth; they are not penalized for lacking evolution.",
      "A later patch may alter these versioned kits.",
    ],
    sources: [
      { label: "Original game client / League", url: "https://pokebonk.com/" },
      {
        label: "Community numeric tier model (different assumptions)",
        url: "https://poke-bonk.wiki/tier-list/",
      },
      {
        label: "Community kit / coverage comparison",
        url: "https://pokebonk.run/builds/tier-list/",
      },
    ],
  },
  entries,
  versionReview: {
    build: profile.build,
    kitsChecked: partners.length,
    movesChecked: moves.length,
    summary:
      `Recalculated for v${profile.version} from all 79 current League kits, original baseline calculators and passive definitions. The checked opening inputs are unchanged from v0.8.25, so the model scores stay the same. Co-op target sharing, fusion scaling and cosmetic unlocks are outside this solo Classic opening comparison.`,
  },
  tiers: ["S", "A", "B", "C"].map((tier) => ({
    tier,
    label: {
      S: "Strong opening",
      A: "Reliable",
      B: "Build dependent",
      C: "Needs a plan",
    }[tier],
    pokemon: entries.filter((e) => e.tier === tier).map((e) => e.slug),
    reason:
      "Classic opening-comfort model; see the full criteria and kit evidence on the tier-list page.",
  })),
};
fs.writeFileSync(
  "src/data/tier-list/rankings.json",
  JSON.stringify(data, null, 2) + "\n",
);
