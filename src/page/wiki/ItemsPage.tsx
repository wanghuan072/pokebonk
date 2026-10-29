import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import entries from "@/data/wiki/catalog-items.json";
import WikiNavigation from "@/components/content/WikiNavigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import CatalogExplorer from "./CatalogExplorer";
import {pageMetadata} from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/wiki-moves.css";
export const metadata=pageMetadata('/wiki/items');
export default function ItemsPage(){return <div className="wiki-screen"><section className="page-intro"><div className="container"><Breadcrumb items={[{label:'Items'}]}/><h1>{pageCopy["/wiki/items"].h1}</h1><p>{pageCopy["/wiki/items"].description}</p><div className="page-meta"><span>126 items · 59 Lab unlocks</span><span>Checked v{gameVersion.version}</span></div></div></section><section className="page-section"><div className="container"><WikiNavigation current="/wiki/items"/><CatalogExplorer kind="items" entries={entries}/></div></section></div>}
