import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import GameSprite from "@/components/content/GameSprite";
import Breadcrumb from "@/components/content/Breadcrumb";
import { pokemon, getPokemon } from "@/lib/data/pokedex";
import { moves, attacks, vitamins, catalogItems, lab, fusions } from "@/lib/data/wiki";
import detailData from "@/data/pokedex/details.json";
import buildData from "@/data/pokedex/detail-builds.json";
import buildRoutes from "@/data/builds/routes.json";
import rankings from "@/data/tier-list/rankings.json";
import recommendations from "@/data/tier-list/recommendations.json";
import { contentPath } from "@/lib/content-path";
import { pageMetadata } from "@/seo/metadata";
import { site } from "@/config/site";
import VitaminPlanner from "./VitaminPlanner";
import "@/style/content/article.css";
import "@/style/page/pokemon-detail.css";

const details: Record<string, typeof detailData.bulbasaur> = detailData;
const builds: Record<string, typeof buildData.bulbasaur> = buildData;
const statLabels = { hp: "HP", atk: "Attack", def: "Defense", spa: "Sp. Attack", spd: "Sp. Defense", spe: "Speed" };
export function generateStaticParams() {
  return pokemon.filter(p => p.isDetails).map(p => ({ slug: p.slug }));
}
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const p = getPokemon((await params).slug);
  return p?.isDetails && details[p.slug] ? pageMetadata(`/pokedex/${p.slug}`, details[p.slug].seo) : {};
}
export default function PokemonDetailPage({params}: {params: Promise<{slug: string}>}) {
  return <Suspense fallback={<section className="page-section"><div className="container" role="status">Loading Pokémon guide…</div></section>}><PokemonDetailContent params={params} /></Suspense>;
}
async function PokemonDetailContent({params}: {params: Promise<{slug: string}>}) {
  const p = getPokemon((await params).slug);
  if (!p?.isDetails || !details[p.slug]) notFound();
  const copy = details[p.slug];
  const origin = pokemon.find(x => x.id === p.evolutionOrigin.id)!;
  const plan = builds[origin.slug];
  const buildRoute = buildRoutes.find(route=>route.partner===origin.slug);
  const family = pokemon.filter(x => x.family === p.family);
  const passive = moves.find(m => m.slug === origin.passive);
  const fusion = fusions.find(f => f.member === origin.id);
  const ranking = rankings.entries.find(e => e.id === origin.id);
  const note = recommendations.entries.find(e => e.slug === origin.slug);
  const stage = p.evolutionPath.findIndex(x => x.id === p.id);
  const selectedUltimate = p.ultimate?.names[stage];
  const enabled = pokemon.filter(x => x.isDetails);
  const index = enabled.findIndex(x => x.id === p.id);
  const schema = {"@context":"https://schema.org", "@type":"WebPage", name: p.name, description: copy.seo.description, url: `${site.url}/pokedex/${p.slug}`, isPartOf: {"@id":`${site.url}/#website`}, about: {"@type":"Thing", name:p.name, image:site.url+p.image}};
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g,"\u003c")}} />
    <section className="page-intro"><div className="container">
      <Breadcrumb items={[{label:"Pokédex",href:"/pokedex"},{label:p.name}]} />
      <span className="eyebrow">KANTO #{String(p.id).padStart(3,"0")} · {p.isPlayable ? "LEAGUE PARTNER" : `${origin.name.toUpperCase()} EVOLUTION`}</span>
      <h1>{p.name}</h1><p>{copy.intro}</p>
      <div className="page-meta"><span>Game data v{p.gameVersion}</span><span>Checked {p.lastVerified}</span><span>Build advice: our recommendations</span></div>
    </div></section>
    <section className="page-section pokemon-overview-section"><div className="container">
      <div className="pokemon-overview-content">
        <div className={`pokemon-detail-art tone-${p.types[0]}`}><span className="pokemon-detail-number">#{String(p.id).padStart(3,"0")}</span><div className="pokemon-card-art"><GameSprite id={p.id} width={360} height={270} alt={p.name} /></div><span>Original game animation · {p.name}</span></div>
        <div className="pokemon-overview-copy"><span className="eyebrow">YOUR RUN AT A GLANCE</span><h2>{copy.heading}</h2><div className="type-tags">{p.types.map(t=><span className={`type-tag type-${t}`} key={t}>{t}</span>)}</div>
          <dl><div><dt>Start the run as</dt><dd><a href={contentPath("/pokedex",origin)}>{origin.name}</a> · {origin.role}</dd></div><div><dt>This stage</dt><dd>{stage===0 ? "Starting form · Lv. 1" : `Evolves at run Lv. ${p.evolutionPath[stage].level}`}</dd></div><div><dt>Opening attack</dt><dd><a href={`/wiki/attacks#${origin.moves[0]}`}>{attacks.find(a=>a.slug===origin.moves[0])?.name}</a></dd></div><div><dt>Family passive</dt><dd>{passive?.name}</dd></div><div><dt>This form’s Ultimate</dt><dd><a href="#ultimate">{selectedUltimate}</a></dd></div></dl>
          <div className="related-links"><a className="button" href="#build">Plan vitamins</a><a href={`/tier-list#recommend-${origin.slug}`}>Why we rank {origin.name} {ranking?.tier} →</a></div>
        </div>
      </div>
      <nav className="pokemon-detail-tabs" aria-label="Entry sections">{[["kit","Attacks & passive"],["evolution","Evolution"],["stats","Stats"],["ultimate","Ultimate"],["build","Build planner"],["ranking","Our verdict"]].map(([id,label])=><a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <div className="pokemon-detail-layout"><div className="prose">
        <section id="kit"><h2>{origin.name}’s kit, through every form</h2><p>{p.id===origin.id ? "The first attack starts equipped. Later kit levels unlock attack offers; they do not automatically equip or level the attack." : `${p.name} uses the run started with ${origin.name}. The levels below describe that partner’s attack offers, not a new loadout unlocked by evolution.`} Kit-offer levels and the level of an individual attack are separate.</p>
          {passive ? <div className="pokemon-passive"><span className="eyebrow">FAMILY PASSIVE</span><h3>{passive.name}</h3><p>{passive.description}</p></div> : null}
          <div className="pokemon-move-list">{origin.moves.map((slug,i)=>{const attack=attacks.find(a=>a.slug===slug)!;return <a key={slug} href={`/wiki/attacks#${slug}`}><Image src={attack.image} alt="" width={32} height={32} unoptimized/><span><strong>{attack.name}</strong><small>{attack.label} · {i===0 ? "Starts equipped" : `Kit offer from Lv. ${origin.kitLevels[i]}`}</small></span><b>↗</b></a>})}</div>
          <details className="pokemon-attack-notes"><summary>What the four attacks do</summary>{origin.moves.map(slug=>{const a=attacks.find(a=>a.slug===slug)!;return <div key={slug}><h3><a href={`/wiki/attacks#${slug}`}>{a.name}</a></h3><p>{a.description}</p></div>})}</details>
          {fusion ? <article className="pokemon-passive pokemon-fusion"><span className="eyebrow">FAMILY SIGNATURE · {fusion.damageClass.toUpperCase()}</span><h3><a href={`/wiki/attacks#${fusion.slug}`}>{fusion.name} ↗</a></h3><div className="related-links">{fusion.moves.map(slug=><a href={`/wiki/attacks#${slug}`} key={slug}>{attacks.find(a=>a.slug===slug)?.name}</a>)}</div><p>{fusion.description}</p><p>Both component attacks must reach attack level 8. The later kit offer still needs to appear and be upgraded; reaching a run level alone does not complete the fusion.</p><a href={`/wiki/attacks#${fusion.slug}`}>Inspect the recipe, upgrades and comparison values →</a></article>:null}
        </section>
        <section id="evolution"><h2>Your evolution checkpoints</h2><p>These are PokeBonk run levels. They differ from evolution levels in the main Pokémon games. Evolved forms stay attached to the partner you started with.</p><div className="pokemon-evolution-chain">{p.evolutionPath.map(step=>{const f=pokemon.find(x=>x.id===step.id)!;return <a href={contentPath("/pokedex",f)} key={f.id} aria-current={f.id===p.id?"page":undefined}><GameSprite id={f.id} width={96} height={80} alt=""/><strong>{f.name}</strong><span>{step.level===1?"Start here":`Run Lv. ${step.level}`}</span><small>{f.isDetails?"Open entry →":"View in Pokédex →"}</small></a>})}</div><h3>What to focus on as {p.name}</h3><p>{copy.play}</p><aside className="notice"><strong>Watch out:</strong> {copy.caution}</aside></section>
        <section id="stats"><h2>Species stats and your run baseline</h2><p>The six bars describe {p.name}’s species stats. Your current in-run values also depend on your starting partner, passive, evolution bonuses, Lab purchases and collected upgrades.</p><div className="pokemon-stat-bars">{Object.entries(p.baseStats).map(([key,value])=><div key={key}><span>{statLabels[key as keyof typeof statLabels]}</span><b>{value}</b><progress value={value} max={255} aria-label={`${statLabels[key as keyof typeof statLabels]} ${value}`}/></div>)}</div>
          {origin.baseRunStats?<><h3>{origin.name}’s starting baseline</h3><p>Before the passive, Lab, vitamins, items or evolution bonuses. {p.id!==origin.id ? `These values are for ${origin.name} at the start, not ${p.name} after evolving.` : "The League preview can show higher numbers after applying the passive."}</p><dl className="pokemon-baseline">{[["Max HP",origin.baseRunStats.hp],["Armor",origin.baseRunStats.armor],["HP regen / s",origin.baseRunStats.regen],["Movement multiplier",`×${origin.baseRunStats.moveSpeed}`],["Physical multiplier",`×${origin.baseRunStats.physical}`],["Special multiplier",`×${origin.baseRunStats.special}`]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></>:null}
        </section>
        {p.ultimate?<section id="ultimate"><h2>Ultimate progression</h2><p>Each stage has its own Ultimate in a run started with {origin.name}. The highlighted card is {p.name}’s form. The listed time describes the ability’s duration, not its recharge time.</p><div className="pokemon-ultimates">{p.ultimate.names.map((name,i)=><article key={name} aria-current={stage===i?"true":undefined}><div><Image src={p.ultimate!.forms[i].image} width={48} height={48} alt="" unoptimized/><span className="eyebrow">{p.ultimate!.forms[i].name} · {p.ultimate!.durations[i]} s{stage===i?" · THIS FORM":""}</span></div><h3>{name}</h3><p>{p.ultimate!.descriptions[i]}</p></article>)}</div></section>:null}
        <section id="build"><h2>Build around the attacks you kept</h2><p>These are starting points for a {origin.name} family run, not a promise of one best loadout. Keep damage, survival and movement balanced around what is ending your attempts. The planner uses the three base vitamin slots and saves locally on this device.</p>
          <VitaminPlanner partner={origin.slug} name={origin.name} choices={plan.vitamins.map(pick=>{const v=vitamins.find(v=>v.slug===pick.slug)!;return {slug:v.slug,name:v.name,image:v.image,label:v.label,why:pick.why}})} />
          {buildRoute ? <p><a href={`/builds#${buildRoute.id}`}>Follow the {origin.name} build route, attack by attack →</a></p> : null}
          <h3>Items worth comparing</h3><div className="pokemon-build-picks">{plan.items.map(pick=>{const item=catalogItems.find(i=>i.slug===pick.slug)!;return <article key={item.slug}><a href={`/wiki/items#${item.slug}`}><Image src={item.image} alt="" width={36} height={36} unoptimized/><strong>{item.name} ↗</strong></a><p>{item.description}</p><p>{pick.why}</p><small>{item.unlockCost==null?"Starting item pool":`Lab unlock: ${item.unlockCost.toLocaleString("en-US")} Stardust`}</small></article>})}</div>
          <h3>Before spending Stardust</h3><p>Buy for the problem you actually have. A fourth move slot gives a future attack room, while health, armor, recovery or movement can help you reach the later offers in the first place.</p><div className="pokemon-build-picks">{plan.lab.map(id=>{const upgrade=lab.find(u=>u.id===id)!;return <article key={id}><a href={`/wiki/lab#lab-${id}`}><Image src={upgrade.image} alt="" width={32} height={32} unoptimized/><strong>{upgrade.name} ↗</strong></a><p>{upgrade.desc}</p><small>{upgrade.max} {upgrade.max===1?"level":"levels"} · First purchase {upgrade.costsByLevel[0]} Stardust</small></article>})}</div>
        </section>
        <section id="unlock"><h2>How to play this family</h2><p>{origin.isStarter?`${origin.name} is one of the first-partner choices in a fresh session. If you chose a different starter, its League challenge is: ${origin.unlockCondition}`:`To unlock ${origin.name}, complete its League challenge: ${origin.unlockCondition} Then follow the game’s encounter and capture steps.`}</p>{p.id!==origin.id?<p>Start the run as {origin.name} and reach run level {p.evolutionPath[stage].level} to evolve into {p.name}. This form is not listed as a separate starting partner.</p>:null}<a href="/guides/beginners-guide">First runs, unlocks and the upgrade choices that matter →</a></section>
        {ranking&&note?<section id="ranking"><span className="eyebrow">OUR CLASSIC OPENING RECOMMENDATION</span><h2>Tier {ranking.tier}: why we place {origin.name} here</h2><p>{note.why}</p><p>{note.play}</p><aside className="notice"><strong>The tradeoff:</strong> {note.tradeoff}</aside><p>{ranking.score}/100 is an editorial opening score, with comfort weighted at 50%, offensive potential at 30% and utility at 20%. It is not a measured win rate. {p.id!==origin.id?`${p.name} is grouped with ${origin.name}; this score does not rank the evolved form’s late-run ceiling.`:"Survival scaling and co-op team roles can change the choice."}</p><div className="related-links"><a href={`/tier-list#recommend-${origin.slug}`}>Compare the complete ranking →</a><a href="/tier-list#ranking-criteria">How we compare openings</a></div></section>:null}
        <section id="next"><h2>Take the build into your next mode</h2><div className="pokemon-build-picks"><article><h3>First Classic clear</h3><p>Choose a partner, keep the opening attack productive and spend upgrades where the run is struggling.</p><a href="/guides/beginners-guide">Read the starter guide →</a></article><article><h3>Survival</h3><p>A safe opening is only the start. Plan how the attacks and defenses will hold up as pressure grows.</p><a href="/guides/endless-mode-guide">Plan a Survival run →</a></article><article><h3>Co-op</h3><p>Compare your role with the rest of the party rather than filling every slot as if you were alone.</p><a href="/guides/coop-mode-guide">Plan with your team →</a></article></div><p className="source-note">Game values: reviewed public v{p.gameVersion} client, {p.lastVerified}. Recommendations describe build choices rather than measured results. <a href="https://pokebonk.com/" target="_blank" rel="noopener noreferrer">Open the original game ↗</a> · <a href="/about">About this fan guide</a></p></section>
      </div><aside className="article-aside"><h2>On this page</h2>{[["kit","Attacks & signature"],["evolution","Evolution checkpoints"],["stats","Stats & baseline"],["ultimate","Ultimate progression"],["build","Vitamins, items & Lab"],["unlock","How to unlock"],["ranking","Our recommendation"],["next","Mode guides"]].map(([id,label])=><a key={id} href={`#${id}`}>{label}</a>)}<h3>Compare this family</h3>{family.map(f=><a key={f.id} href={contentPath("/pokedex",f)} aria-current={f.id===p.id?"page":undefined}>{f.name} →</a>)}</aside></div>
      <nav className="pokemon-detail-pagination" aria-label="Pokédex entries">{enabled[index-1]?<a href={`/pokedex/${enabled[index-1].slug}`}>← {enabled[index-1].name}</a>:<a href="/pokedex">← All Pokémon</a>}<a href={`/pokedex#${p.slug}`}>Back to Pokédex</a>{enabled[index+1]?<a href={`/pokedex/${enabled[index+1].slug}`}>{enabled[index+1].name} →</a>:<a href="/pokedex#butterfree">Butterfree · Pokédex preview →</a>}</nav>
    </div></section>
  </>;
}
