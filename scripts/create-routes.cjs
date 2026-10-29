const fs = require("node:fs");
function write(path, text) {
  const file = "src/app/" + path + "/page.tsx";
  fs.mkdirSync(file.substring(0, file.lastIndexOf("/")), { recursive: true });
  fs.writeFileSync(file, text + "\n");
}
const simple = {
  pokedex: "pokedex/PokedexPage",
  "wiki/moves": "wiki/MovesPage",
  "wiki/fusions": "wiki/FusionsPage",
  "wiki/items": "wiki/ItemsPage",
  "wiki/achievements": "wiki/AchievementsPage",
  "wiki/lab": "wiki/LabPage",
  "wiki/mechanics": "wiki/MechanicsPage",
  "tier-list": "tier-list/TierListPage",
  guides: "guides/GuidesPage",
  leaderboard: "leaderboard/LeaderboardPage",
  updates: "updates/UpdatesPage",
  play: "play/PlayPage",
  contact: "legal/ContactPage",
};
for (const [path, module] of Object.entries(simple))
  write(path, `export { default, metadata } from '@/page/${module}';`);
for (const [path, module] of Object.entries({
  "pokedex/[slug]": "pokedex/PokemonDetailPage",
  "guides/[slug]": "guides/GuideDetailPage",
  "updates/[slug]": "updates/UpdateDetailPage",
}))
  write(
    path,
    `export { default, generateMetadata, generateStaticParams } from '@/page/${module}';`,
  );
for (const kind of ["moves", "items"])
  write(
    `wiki/${kind}/[slug]`,
    `import EntryDetailPage, {entryMetadata} from '@/page/wiki/EntryDetailPage';\nimport {${kind}} from '@/lib/data/wiki';\nexport function generateStaticParams(){return ${kind}.map(e=>({slug:e.slug}));}\nexport async function generateMetadata({params}:{params:Promise<{slug:string}>}){return entryMetadata('${kind}',(await params).slug);}\nexport default async function Page({params}:{params:Promise<{slug:string}>}){return <EntryDetailPage kind="${kind}" slug={(await params).slug}/>;}`,
  );
for (const slug of ["about", "privacy-policy", "terms", "disclaimer"])
  write(
    slug,
    `import LegalPage, {legalMetadata} from '@/page/legal/LegalPage';\nexport const metadata=legalMetadata('${slug}');\nexport default function Page(){return <LegalPage slug="${slug}"/>;}`,
  );
