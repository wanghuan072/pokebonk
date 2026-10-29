import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import entries from "@/data/wiki/vitamins.json";
import WikiNavigation from "@/components/content/WikiNavigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import CatalogExplorer from "./CatalogExplorer";
import {pageMetadata} from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/wiki-moves.css";
export const metadata=pageMetadata('/wiki/vitamins');
export default function VitaminsPage(){return <div className="wiki-screen"><section className="page-intro"><div className="container"><Breadcrumb items={[{label:'Vitamins'}]}/><h1>{pageCopy["/wiki/vitamins"].h1}</h1><p>{pageCopy["/wiki/vitamins"].description}</p><div className="page-meta"><span>26 vitamins · 5 card rarities</span><span>Checked v{gameVersion.version}</span></div></div></section><section className="page-section"><div className="container"><WikiNavigation current="/wiki/vitamins"/><CatalogExplorer kind="vitamins" entries={entries}/></div></section></div>}
