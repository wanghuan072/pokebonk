import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import {pageMetadata} from "@/seo/metadata";
import LabUpgradeExplorer from "./LabUpgradeExplorer";
import LabCalculator from "./LabCalculator";
import "@/style/content/article.css";
import "@/style/page/wiki-moves.css";
import "@/style/page/wiki-lab.css";
export const metadata=pageMetadata('/wiki/lab');
export default function LabPage(){return <div className="wiki-screen"><section className="page-intro"><div className="container"><Breadcrumb items={[{label:'Lab'}]}/><h1>{pageCopy["/wiki/lab"].h1}</h1><p>{pageCopy["/wiki/lab"].description}</p><div className="page-meta"><span>24 upgrades · 111 total levels</span><span>Checked v{gameVersion.version}</span><a href="#calculator">Calculate several levels ↓</a></div></div></section><section className="page-section"><div className="container"><LabUpgradeExplorer/><LabCalculator/><p className="catalog-note">Archive adds five slots per Lab level. From level 1 onward, every two purchased unlocks from the 59-item catalogue add another slot. Six levels and all 59 unlocks give 59 Archive slots. Archived items stay out of Poké Balls and Meowth’s shop.</p></div></section></div>}
