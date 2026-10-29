import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import AchievementTracker from "./AchievementTracker";
import {pageMetadata} from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/wiki-moves.css";
import "@/style/page/wiki-achievements.css";
export const metadata=pageMetadata('/wiki/achievements');
export default function AchievementsPage(){return <div className="wiki-screen"><section className="page-intro"><div className="container"><Breadcrumb items={[{label:'Achievements'}]}/><h1>{pageCopy["/wiki/achievements"].h1}</h1><p>{pageCopy["/wiki/achievements"].description}</p><div className="page-meta"><span>228 achievements · 158 Looks</span><span>Checked v{gameVersion.version}</span></div></div></section><section className="page-section"><div className="container"><AchievementTracker/></div></section></div>}
