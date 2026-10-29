import pageCopy from "@/data/content/pages.json";
import rankings from "@/data/tier-list/rankings.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import GameSprite from "@/components/content/GameSprite";
import PlayerRecommendations from "./PlayerRecommendations";
import TierWorkshop from "./TierWorkshop";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/tier-workshop.css";
export const metadata = pageMetadata("/tier-list");
const copy = pageCopy["/tier-list"];
export default function TierListPage() {
 return <div className="tier-list-content">
  <section className="page-intro"><div className="container">
   <div className="hero-copy"><Breadcrumb items={[{label:"Tier List"}]}/><span className="eyebrow">YOUR NEXT PARTNER · YOUR NEXT CLEAR</span><h1>PokeBonk <span>Tier List</span><small> - {copy.h1.split(' - ')[1]}</small></h1><p>{copy.description}</p>
    <div className="hero-buttons"><a href="#your-tier-board"><b>Build your tier list</b><small>Drag & rank all 151 Pokémon →</small></a><a href="#our-ranking"><b>Our recommendations</b><small>79 starting kits, explained →</small></a></div>
    <div className="page-meta"><span>151 Pokémon</span><span>79 starting kits</span><span>v{rankings.gameVersion}</span><span>Saved in your browser</span></div>
   </div>
   <aside className="recommended-leaders" aria-label="Top Classic opening recommendations"><header><span>★</span><div><b>Classic picks</b><small>OUR OPENING RECOMMENDATIONS</small></div></header>{rankings.entries.slice(0,3).map((p,i)=><a href={`#recommend-${p.slug}`} key={p.slug}><span className="pick-number">{i+1}</span><GameSprite id={p.id} alt="" width={48} height={48}/><div><b>{p.name}</b><small>{p.focus}</small></div><strong>{p.tier}</strong></a>)}<p>Recovery, protection and a steady opening. Each placement has a reason below.</p><a className="button" href="#ranking-criteria">How we rank the kits →</a></aside>
  </div></section>
  <section className="page-section"><div className="container"><TierWorkshop/><PlayerRecommendations/></div></section>
 </div>
}
