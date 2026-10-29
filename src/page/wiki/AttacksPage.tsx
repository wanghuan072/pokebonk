import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import entries from "@/data/wiki/attacks.json";
import WikiNavigation from "@/components/content/WikiNavigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import CatalogExplorer from "./CatalogExplorer";
import {pageMetadata} from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/wiki-moves.css";
export const metadata=pageMetadata('/wiki/attacks');
export default function AttacksPage(){return <div className="wiki-screen"><section className="page-intro"><div className="container"><Breadcrumb items={[{label:'Attacks'}]}/><h1>{pageCopy["/wiki/attacks"].h1}</h1><p>{pageCopy["/wiki/attacks"].description}</p><div className="page-meta"><span>493 attacks · 106 fusions</span><span>Checked v{gameVersion.version}</span></div></div></section><section className="page-section"><div className="container"><WikiNavigation current="/wiki/attacks"/><CatalogExplorer kind="attacks" entries={entries}/></div></section></div>}
