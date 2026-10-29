import Image from "next/image";
import HomeGameMenu from "./HomeGameMenu";
import GuideArtwork from "@/components/content/GuideArtwork";
import Icon from "@/components/common/Icon";
import HomeRoster from "./HomeRoster";
import { pokemon } from "@/lib/data/pokedex";
import { guides, releases, rankings } from "@/lib/data/editorial";
import { fusions, moves, lab, items, achievements, attacks, catalogItems, vitamins } from "@/lib/data/wiki";
import layout from "@/data/content/home-layout.json";
import homeCopy from "@/data/content/home.json";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/cards.css";
import "@/style/page/home.css";

export const metadata = pageMetadata("/");
const latest = releases[0];
const recipes = layout.fusionSlugs.map((slug) => fusions.find((f) => f.slug === slug)!);
const shortcuts = [
 {label:'Attacks',href:'/wiki/attacks',icon:'bolt',text:`${attacks.length} attacks & fusions`},
 {label:'Vitamins',href:'/wiki/vitamins',icon:'flask',text:`${vitamins.length} stat upgrades`},
 {label:'Items',href:'/wiki/items',icon:'gem',text:`${catalogItems.length} run items`},
 {label:'Lab',href:'/wiki/lab',icon:'flask',text:'24 permanent upgrades'},
 {label:'Achievements',href:'/wiki/achievements',icon:'trophy',text:`${achievements.length} goals`},
 {label:'Leaderboard',href:'/wiki/leaderboard',icon:'crown',text:'Season standings'},
];
function Heading({ number, title, href, label }: { number: string; title: string; href: string; label: string }) {
  return <div className="home-section-heading"><h2><span>{number}</span>{title}</h2><a href={href}>{label} ↗</a></div>;
}
export default function HomePage() {
  return <div className="container home-layout">
    <HomeGameMenu />
    <nav className="core-grid" aria-label="Explore PokeBonk content">{shortcuts.map((n) => <a className="core-card" key={n.href} href={n.href}><Icon name={n.icon} /><span><b>{n.label}</b><small>{n.text}</small></span><i aria-hidden="true">›</i></a>)}</nav>
    <div className="home-primary-grid">
      <section className="home-panel home-pokedex-section"><Heading number="01" title="Choose your Pokémon" href="/pokedex" label="All 151 Pokémon" /><HomeRoster featuredIds={layout.rosterIds} pokemon={pokemon.map(({ id, slug, name, image, isPlayable, isStarter }) => ({ id, slug, name, image, isPlayable, isStarter }))} /></section>
      <section className="home-panel system-fusion"><Heading number="02" title="Attacks & fusions" href="/wiki/attacks#fusions" label="All attacks" /><p className="home-panel-description">See which moves combine at Bill’s Machine.</p>{recipes.map((f) => { const partner = pokemon.find((p) => p.id === f.member)!; return <article className="home-fusion-card" key={f.slug}><a className="home-fusion-heading" href={`/wiki/attacks#${f.slug}`}><Image src={partner.image} width={28} height={28} alt={partner.name} unoptimized /><h3>{f.name}</h3><span>{f.type}</span></a><div className="fusion-recipe">{f.moves.map((slug, i) => { const move = moves.find((m) => m.slug === slug)!; return <span key={slug}>{i ? <i aria-hidden="true">＋</i> : null}<a href={`/wiki/attacks#${slug}`}><Image src={move.image} width={23} height={23} alt="" unoptimized />{move.name}</a></span>; })}<i aria-hidden="true">→</i><a href={`/wiki/attacks#${f.slug}`} aria-label={`View ${f.name} recipe`}><Image src={f.typeImage} width={26} height={26} alt="" unoptimized /></a></div></article>; })}<p className="home-fusion-tip">Both moves at Lv. 8 · Check the exact pair before committing.</p></section>
      <section className="home-panel system-lab"><Heading number="03" title="Choose your Lab upgrades" href="/wiki/lab" label="All upgrades" /><p className="home-panel-description">Compare permanent upgrades and their costs.</p>{layout.labIds.map((id) => { const u = lab.find((u) => u.id === id)!; return <a className="lab-mini-upgrades" key={id} href={`/wiki/lab#lab-${id}`}><Image src={u.image} width={28} height={28} alt="" unoptimized /><span><b>{u.name}</b><small>{u.max} {u.max === 1 ? "level" : "levels"}</small></span><span aria-hidden="true">›</span></a>; })}<a className="home-lab-button" href="/wiki/lab#calculator">Open upgrade calculator →</a></section>
    </div>
    <section className="home-panel home-strategies-section"><Heading number="04" title="First Runs, Survival & Co-op Guides" href="/guides" label="Browse guides" /><div className="home-guide-grid">{guides.map((g) => <a className="guide-card" key={g.slug} href={`/guides/${g.slug}`}><div className="guide-card-art"><GuideArtwork slug={g.slug} sizes="(max-width: 768px) 120px, 124px" /></div><div className="guide-card-info"><span className="eyebrow">{g.category} · {g.minutes} MIN</span><h3>{g.title}</h3><p>{g.summary}</p><span className="system-link">Read guide →</span></div></a>)}</div><p className="home-builds-link"><a className="system-link" href="/builds">Survival combinations we tested →</a></p></section>
    <div className="home-secondary-grid"><section className="home-panel home-tier-section"><Heading number="05" title="Compare the starting kits" href="/tier-list" label="Build your ranking" /><div className="home-tier"><div className="tier-preview">{rankings.tiers.slice(0, 3).map((t) => <div key={t.tier}><strong className={`rank-${t.tier}`}>{t.tier}</strong><div>{t.pokemon.slice(0, layout.tierPreviewLimit).map((slug) => { const p = pokemon.find((p) => p.slug === slug)!; return <a href={`/pokedex#${slug}`} key={slug} title={p.name}><Image src={p.image} width={32} height={32} alt={p.name} unoptimized /></a>; })}</div><span>{t.label}</span></div>)}</div><div className="home-tier-note"><h3>Rank your Pokémon</h3><p>Classic opening-kit recommendations, plus a drag-and-drop board for all 151.</p><a className="system-link" href="/tier-list">Make your own tier list ↗</a></div></div></section><section className="home-panel home-items-section"><Heading number="06" title="Choose items for your build" href="/wiki/items" label="Items & vitamins" /><div className="home-item-grid">{layout.itemSlugs.map((slug) => { const item = items.find((i) => i.slug === slug)!; return <a key={slug} href={`${item.category==='Vitamin'?'/wiki/vitamins':'/wiki/items'}#${slug}`}><Image src={item.image} width={29} height={29} alt="" unoptimized /><span>{item.name}</span></a>; })}</div><p className="home-items-note">Compare effects and level caps before taking another slot.</p></section></div>
    <a className="home-update" href={`/updates#${latest.slug}`}><span className="home-update-dot" /><b>Latest update</b><strong>v{latest.version}</strong><p>{latest.title.replaceAll("**", "")}</p><span>All updates →</span></a>
    <section className="home-faq-content"><div className="home-about"><span className="eyebrow">THE SITE AND THE GAME</span><h2>{homeCopy.aboutTitle}</h2><p>{homeCopy.about[0]}</p><h3>{homeCopy.aboutGameTitle}</h3><p>{homeCopy.about[1]}</p><a className="system-link" href="/about">About PokéBonk →</a></div><div><div className="home-faq-heading"><h2>Common PokeBonk questions</h2><a href="/guides/beginners-guide">Getting started ↗</a></div><div className="home-faq-grid">{homeCopy.faqs.map(([q, a, href]) => <details key={q}><summary>{q}<span aria-hidden="true">＋</span></summary><div><p>{a}</p><a href={href}>Learn more →</a></div></details>)}</div></div></section>
  </div>;
}
