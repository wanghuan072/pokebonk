import gameVersion from "@/data/site/game-version.json";
import pageCopy from "@/data/content/pages.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import UpdatesExplorer from "./UpdatesExplorer";
import { releases } from "@/lib/data/editorial";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/updates-new.css";
export const metadata = pageMetadata("/updates");
const copy = pageCopy["/updates"];
export default function UpdatesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Updates" }]} />
          <span className="eyebrow">PATCH NOTES · BALANCE CHANGES · FIXES</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-meta">
            <span>{releases.length} published releases</span>
            <span>Through v{releases[0].version}</span>
            <span>Checked {gameVersion.checkedLabel}</span>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <UpdatesExplorer />
        </div>
      </section>
    </>
  );
}
