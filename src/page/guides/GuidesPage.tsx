import pageCopy from "@/data/content/pages.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import GuideExplorer from "./GuideExplorer";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/guides.css";
export const metadata = pageMetadata("/guides");
const copy = pageCopy["/guides"];
export default function GuidesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Guides" }]} />
          <span className="eyebrow">STARTER CHOICES · BUILDS · LAB COSTS</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-actions">
            <a className="button button-gold" href="/guides/beginners-guide">
              Start with the beginner guide →
            </a>
            <a className="button" href="/builds">
              See the Survival combinations →
            </a>
          </div>
        </div>
      </section>
      <section className="page-section guides-list-section">
        <div className="container">
          <div className="guides-list-content">
            <h2>Starter, Build & Lab Upgrade Guides</h2>
            <GuideExplorer />
          </div>
        </div>
      </section>
    </>
  );
}
