import GuideArtwork from "./GuideArtwork";
import "@/style/content/cards.css";
export default function GuideCard({
  guide: g,
}: {
  guide: {
    slug: string;
    title: string;
    category: string;
    summary: string;
    icon: string;
    minutes: number;
  };
}) {
  return (
    <a href={`/guides/${g.slug}`} className={`guide-card guide-art-${g.icon}`}>
      <div className="guide-card-art">
        <GuideArtwork slug={g.slug} />
        <span className="guide-card-time">{g.minutes} MIN READ</span>
      </div>
      <div className="guide-card-info">
        <span className="eyebrow">{g.category}</span>
        <h3>{g.title}</h3>
        <p>{g.summary}</p>
        <span className="card-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </a>
  );
}
