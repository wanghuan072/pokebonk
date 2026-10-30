import GameSprite from "@/components/content/GameSprite";
import { notFound } from "next/navigation";
import Image from "next/image";
import { pokemon } from "@/lib/data/pokedex";
import Breadcrumb from "@/components/content/Breadcrumb";
import GuideCard from "@/components/content/GuideCard";
import GuideArtwork, {
  getGuideVisual,
} from "@/components/content/GuideArtwork";
import { guides } from "@/lib/data/editorial";
import { pageMetadata } from "@/seo/metadata";
import { site } from "@/config/site";
import { getPageModified } from "@/seo/history";
import "@/style/content/article.css";
import "@/style/page/guides.css";
const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "");
export function generateStaticParams() {
  return guides.filter((g) => g.isDetails).map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  return g ? pageMetadata(`/guides/${g.slug}`, g.seo) : {};
}
export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  if (!g || !g.isDetails) notFound();
  const related = guides.filter((x) => g.related.includes(x.slug));
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.summary,
    dateModified: getPageModified("/guides/" + g.slug),
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url + "/about",
    },
    mainEntityOfPage: site.url + "/guides/" + g.slug,
    publisher: { "@id": site.url + "/#publisher" },
    image: site.url + getGuideVisual(g.slug).src,
  };
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb
            items={[{ label: "Guides", href: "/guides" }, { label: g.title }]}
          />
          <span className="eyebrow">
            {g.category} · {g.minutes} MIN READ
          </span>
          <h1>{g.title}</h1>
          <p>{g.summary}</p>
          <div className="page-meta">
            <span>By pokebonkdb.org</span>
            <span>Game version {g.gameVersion}</span>
            <span>Updated {getPageModified("/guides/" + g.slug)}</span>
          </div>
        </div>
      </section>
      <section className="guide-article-section">
        <div className="container">
          <div className="article-layout">
            <article className="prose">
              <figure className="guide-article-figure">
                <div className="guide-article-visual">
                  <GuideArtwork
                    slug={g.slug}
                    sizes="(max-width:768px) 90vw, 70vw"
                  />
                </div>
                <figcaption>{getGuideVisual(g.slug).alt}.</figcaption>
              </figure>
              {g.sections.map((s) => (
                <section key={s.title} id={anchor(s.title)}>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.portraits.length ? (
                    <div className="guide-roster-strip">
                      {s.portraits.map((id) => {
                        const p = pokemon.find((p) => p.id === id)!;
                        return (
                          <a href={`/pokedex#${p.slug}`} key={id}>
                            <GameSprite
                              id={p.id}
                              alt={p.name}
                              width={120}
                              height={110}
                            />
                            <span>{p.name}</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                  {s.columns.length ? (
                    <div className="table-scroll guide-reference-table">
                      <table>
                        <thead>
                          <tr>
                            {s.columns.map((c) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.rows.map((r, i) => (
                            <tr key={i}>
                              {r.map((c, j) => (
                                <td key={j}>{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {s.callout ? (
                    <aside className="guide-field-note">
                      <b>Keep in mind</b>
                      <p>{s.callout}</p>
                    </aside>
                  ) : null}
                  {s.image ? (
                    <figure className="guide-inline-figure">
                      <Image
                        src={s.image}
                        alt={s.caption}
                        width={1280}
                        height={720}
                        sizes="(max-width:768px) 90vw, 65vw"
                      />
                      <figcaption>{s.caption}</figcaption>
                    </figure>
                  ) : null}
                  {s.steps.length ? (
                    <ol>
                      {s.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                </section>
              ))}
              <section className="guide-quick-reference">
                <h2>Check move kits, fusion recipes and Lab costs</h2>
                <p>
                  Check a partner’s kit, compare two fusion ingredients or add
                  up your next Lab purchase before starting another run.
                </p>
                <div className="related-links">
                  <a href="/pokedex">Pokédex & League partners</a>
                  <a href="/wiki/attacks">Moves & passives</a>
                  <a href="/wiki/items">Items & vitamins</a>
                  <a href="/wiki/lab#calculator">Lab calculator</a>
                  <a href="/wiki/attacks#fusions">Fusion finder</a>
                </div>
              </section>
              <p>
                <a href="/about#independence">About these guides</a>
              </p>
            </article>
            <aside className="article-aside">
              <h2>On this page</h2>
              {g.sections.map((s) => (
                <a key={s.title} href={"#" + anchor(s.title)}>
                  {s.title}
                </a>
              ))}
              <a href="#main-content">Back to top ↑</a>
            </aside>
          </div>
          <div className="guide-related-section">
            <h2>Related PokeBonk guides</h2>
            <div className="guide-related-grid">
              {related.map((g) => (
                <GuideCard guide={g} key={g.slug} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\u003c"),
        }}
      />
    </>
  );
}
