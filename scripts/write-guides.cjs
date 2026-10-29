throw new Error("Historical generator: current reviewed content must not be overwritten. See docs/data-maintenance.md.");
const fs = require("node:fs");
const lab = JSON.parse(fs.readFileSync("src/data/wiki/lab.json", "utf8"));
const pokemon = JSON.parse(
  fs.readFileSync("src/data/pokedex/pokemon.json", "utf8"),
);
const moves = JSON.parse(fs.readFileSync("src/data/wiki/moves.json", "utf8"));
const fusions = JSON.parse(
  fs.readFileSync("src/data/wiki/fusions.json", "utf8"),
);
const create = (slug, title, category, summary, icon, content) => ({
  slug,
  title,
  category,
  summary,
  icon,
  minutes: Math.ceil(content.flat().join(" ").split(/\s+/).length / 190),
  isDetails: true,
  sections: content.map(([title, text, ...paragraphs]) => ({
    title,
    text,
    paragraphs,
    steps: [],
    image: "",
    caption: "",
    portraits: [],
    columns: [],
    rows: [],
    callout: "",
  })),
  related: ["beginners-guide", "best-builds", "lab-upgrade-guide"].filter(
    (s) => s !== slug,
  ),
  gameVersion: pokemon[0].gameVersion,
  lastVerified: pokemon[0].lastVerified,
  source: "https://pokebonk.com/",
});
const data = [
  create(
    "beginners-guide",
    "Starter Choices & First-Run Survival",
    "Beginner guide",
    "Compare the three starters, learn movement and level-up choices, and decide when to work toward a fusion.",
    "compass",
    require("./guide-beginner.cjs"),
  ),
  create(
    "best-builds",
    "Damage, Recovery & Move Fusion Builds",
    "Build guide",
    "Compare Bulbasaur, Squirtle and Machop builds, match stat bonuses to damage classes, and choose fusion ingredients.",
    "fusion",
    require("./guide-builds.cjs"),
  ),
  create(
    "lab-upgrade-guide",
    "Lab Upgrade Costs & Spending Priorities",
    "Lab upgrades",
    "Compare Stardust costs, stat upgrades, extra slots, Refresh, Skip and Banish before choosing your next purchase.",
    "flask",
    [...require("./guide-lab.cjs"), ...require("./guide-current-progression.cjs")],
  ),
];
const [beginner, builds, progress] = data;
for (const [index, id] of [
  [2, 1],
  [3, 7],
  [4, 66],
]) {
  const p = pokemon.find((p) => p.id === id);
  Object.assign(builds.sections[index], {
    columns: ["Move", "Damage class", "Pattern", "Listed kit level"],
    rows: p.moves.map((slug, i) => {
      const m = moves.find((m) => m.slug === slug);
      return [
        m.name,
        m.damageClass || "Utility",
        m.shape || "Passive",
        String(p.kitLevels[i]),
      ];
    }),
  });
}
Object.assign(builds.sections[5], {
  columns: ["Partner", "Signature result", "Required pair (both Lv 8+)"],
  rows: [1, 7, 66].map((id) => {
    const p = pokemon.find((p) => p.id === id),
      f = fusions.find((f) => f.member === id);
    return [
      p.name,
      f.name,
      f.moves
        .map((slug) => moves.find((m) => m.slug === slug).name)
        .join(" + "),
    ];
  }),
});
Object.assign(beginner.sections[0], {
  image: "",
  caption:
    "The original starter selection. Choose one of these three first; the other two can join your League after completing two runs.",
});
Object.assign(beginner.sections[1], {
  portraits: [1, 7, 4],
  columns: ["Partner", "Unmodified run HP", "Passive to build around"],
  rows: [1, 7, 4].map((id) => {
    const p = pokemon.find((p) => p.id === id),
      passive = moves.find((m) => m.slug === p.passive);
    return [
      p.name,
      String(p.baseRunStats.hp),
      passive.name + ": " + passive.description,
    ];
  }),
  callout:
    "Species HP and run HP are different. These run baselines exclude passives, Lab and upgrades.",
});
Object.assign(beginner.sections[3], {
  steps: [
    "Identify whether the offer adds a move, raises a level or modifies a stat.",
    "Check the slot it needs and the damage class it supports.",
    "Choose one reason to take it. Do not change the entire build for one attractive card.",
  ],
});
Object.assign(beginner.sections[4], {
  image: "/images/home/game/league.webp",
  caption:
    "The League interface shows the kit, passive and progression. Check these before committing to a recipe.",
});
beginner.sections[5].callout =
  "One partner, one setting, one build change, one note after each run. Try a new partner when you have a specific reason to want its passive.";
Object.assign(builds.sections[1], {
  portraits: [66, 63, 1],
  columns: ["Check", "What to inspect", "Common mistake"],
  rows: [
    [
      "Damage class",
      "Physical / special on each move",
      "Choosing vitamins from the element",
    ],
    [
      "Pattern",
      "Strike, barrage, beam, area, buff…",
      "Treating base damage as measured DPS",
    ],
    [
      "Role",
      "Clear, boss pressure, recovery, control",
      "Taking a move with no job for it",
    ],
  ],
});
builds.sections[2].portraits = [1, 2, 3];
builds.sections[3].portraits = [7, 8, 9];
builds.sections[4].portraits = [66, 67, 68];
builds.sections[2].callout =
  "Use this route for repeated chip damage. If one burst or a closed route ends the opening, immediate protection and movement deserve attention first.";
builds.sections[5].steps = [
  "Check the exact signature pair.",
  "Reach level 8 with both ingredients while keeping your opening functional.",
  "Read the live machine preview.",
  "Give the freed slot a specific job.",
];
Object.assign(progress.sections[0], {
  image: "",
  caption:
    "The original Lab, captured with its introductory overlay. Prices below come from the client cost curves.",
});
Object.assign(progress.sections[1], {
  columns: ["Upgrade", "Level 0 → 1", "Effect"],
  rows: ["slot-move", "slot-vit", "reroll", "skip", "banish"].map((id) => {
    const u = lab.find((x) => x.id === id);
    if (!u) throw Error("Missing upgrade " + id);
    return [u.name, u.costsByLevel[0] + " Stardust", u.desc];
  }),
  callout:
    "Both vitamin-slot levels cost 3,570 Stardust together, not 2,040. Always add the next-level prices.",
});
progress.sections[2].portraits = [7, 1, 113];
Object.assign(progress.sections[3], {
  columns: ["Situation", "Consider", "Reason to wait"],
  rows: [
    [
      "You reject a needed fusion ingredient",
      "4th move",
      "No stable opening yet",
    ],
    [
      "Useful stat jobs compete for capacity",
      "Vitamin slots",
      "Current vitamins do not help your main attacks",
    ],
    [
      "Room remains, but the right offers rarely arrive",
      "Offer control",
      "The build goal changes every run",
    ],
  ],
});
const guideSeo = {
  "beginners-guide": {
    name: "Starter Choices & First-Run Survival",
    title: "Starter & Survival Guide - PokeBonk Beginner Tips",
    description:
      "Choose a PokeBonk starter, survive the opening and make useful level-up choices. Learn movement, fusion basics and how to review what ended your last run.",
  },
  "best-builds": {
    name: "Damage, Recovery & Move Fusion Builds",
    title: "Damage & Fusion Builds - PokeBonk Strategy Guide",
    description:
      "Plan a PokeBonk build around damage class, recovery and attack coverage. Follow Bulbasaur, Squirtle and Machop routes with real move and fusion tables.",
  },
  "lab-upgrade-guide": {
    name: "Lab Upgrade Costs & Spending Priorities",
    title: "Lab Costs & Upgrade Priorities - PokeBonk Guide",
    description:
      "Spend PokeBonk Stardust on upgrades that solve your next-run problem. Compare slot costs, stat boosts and offer-control tools with practical budget examples.",
  },
};
for (const g of data) {
  const seo = guideSeo[g.slug];
  g.title = seo.name;
  g.seo = {
    title: seo.title,
    description: seo.description,
    keywords: ["PokeBonk", g.category, "PokeBonk guide"],
  };
  if (
    seo.title.length < 40 ||
    seo.title.length > 60 ||
    seo.description.length < 140 ||
    seo.description.length > 160
  )
    throw Error(`Guide SEO length: ${g.slug} ${seo.description.length}`);
}
progress.sections[5].callout =
  "“I am saving ___ Stardust for ___ because my next build needs ___.” If the last blank is hard to fill, keep the currency until the target is clearer.";
fs.writeFileSync(
  "src/data/guides/guides.json",
  JSON.stringify(data, null, 2) + "\n",
);
const visuals = {
  "beginners-guide": {
    kind: "screenshot",
    src: "/images/home/game/starters.webp",
    alt: "PokeBonk starter selection: Bulbasaur, Charmander and Squirtle",
  },
  "best-builds": {
    kind: "screenshot",
    src: "/images/home/game/league.webp",
    alt: "League menu showing Squirtle’s passive, move kit and progression",
  },
  "lab-upgrade-guide": {
    kind: "screenshot",
    src: "/images/home/game/lab.webp",
    alt: "Lab upgrade menu with its introductory overlay",
  },
};
fs.writeFileSync(
  "src/data/media/guide-visuals.json",
  JSON.stringify(visuals, null, 2) + "\n",
);
console.log(
  data.map((g) => ({
    slug: g.slug,
    minutes: g.minutes,
    sections: g.sections.length,
  })),
);

// Keep exactly three public guides: beginner, Survival and co-op.
require("./write-mode-guides.cjs");
