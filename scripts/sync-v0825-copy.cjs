if(require("./data/active-snapshot.json").version!=="0.8.25")throw new Error("Historical migration: use current reviewed copy.");
const fs = require("node:fs");
const files = [
  "src/config/site.ts",
  "src/page/home/HomePage.tsx",
  "src/page/wiki/AchievementsPage.tsx",
  "src/page/wiki/CatalogExplorer.tsx",
  "src/page/wiki/FusionsPage.tsx",
  "src/page/pokedex/PokedexPage.tsx",
  "src/page/wiki/ItemsPage.tsx",
  "src/page/updates/UpdatesExplorer.tsx",
  "src/page/wiki/LabPage.tsx",
  "src/page/wiki/MovesPage.tsx",
  "src/page/wiki/MechanicsPage.tsx",
  "scripts/guide-lab.cjs",
];
for (const file of files)
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replaceAll("0.8.13", "0.8.25")
      .replaceAll("Oct 22, 2026", "Oct 23, 2026"),
  );
for (const file of ["scripts/guide-beginner.cjs", "scripts/guide-builds.cjs"])
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replaceAll("Photosynthesis", "Synthesis")
      .replaceAll("Charmander’s Blaze", "Charmander’s Sea of Flames"),
  );
const path = "src/data/legal/pages.json",
  legal = JSON.parse(fs.readFileSync(path, "utf8"));
legal.about.sections.find((s) => s.id === "data").paragraphs[0] =
  "Names, move kits, passive effects, unlock conditions and upgrade prices are checked against the game’s public English client and data. Species stats and calculated run baselines are labeled separately. The gameplay tables, published patch history and captured season standings currently cover version 0.8.25. Gameplay values were rechecked against build mvjzbutg on October 23, 2026, including all 151 species, 79 League kits, 389 moves and passives, 79 signature recipes, 152 items and vitamins, and every listed Lab level price.";
fs.writeFileSync(path, JSON.stringify(legal, null, 2) + "\n");
const mech = "src/data/wiki/mechanics.json",
  mechanics = JSON.parse(fs.readFileSync(mech, "utf8"));
const fusion = {
  id: "fusion-levels",
  slug: "fusion-levels",
  title: "Move Levels & Fusion Stars",
  icon: "fusion",
  text: "Normal moves reach level 8, or level 10 with TM Case. Bill’s Machine needs both ingredient moves at level 8 or higher. A fusion grows to ★5, or ★6 with TM Case. Weather, buff and existing fusion patterns are excluded from normal pair selection. Max Ether raises the vitamin level cap from 10 to 12; it does not raise the fusion cap.",
  href: "/wiki/fusions",
  link: "Check a fusion recipe",
  isDetails: false,
};
if (!mechanics.some((x) => x.id === fusion.id)) mechanics.push(fusion);
fs.writeFileSync(
  mech,
  JSON.stringify(
    mechanics.map((m) => ({
      ...m,
      gameVersion: "0.8.25",
      lastVerified: "2026-10-23",
      source: "https://pokebonk.com/",
    })),
    null,
    2,
  ) + "\n",
);
