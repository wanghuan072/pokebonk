import pageCopy from "@/data/content/pages.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import LeaderboardExplorer from "./LeaderboardExplorer";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/leaderboard-new.css";
export const metadata = pageMetadata("/wiki/leaderboard");
const copy = pageCopy["/wiki/leaderboard"];
export default function LeaderboardPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Wiki", href: "/wiki/attacks" }, { label: "Leaderboard" }]} />
          <span className="eyebrow">SEASON 2 · STANDINGS SNAPSHOT</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-meta">
            <span>Official Global standings</span>
            <span>Captured October 28, 2026</span>
            <span>KOs · Survival · Time attack · 100 trainers each</span>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <LeaderboardExplorer />
        </div>
      </section>
    </>
  );
}
