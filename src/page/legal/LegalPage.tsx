import Breadcrumb from "@/components/content/Breadcrumb";
import pages from "@/data/legal/pages.json";
import pageCopy from "@/data/content/pages.json";
import { pageMetadata } from "@/seo/metadata";
import { getPageModified } from "@/seo/history";
import { site } from "@/config/site";
import "@/style/content/article.css";
import "@/style/page/legal.css";
export type LegalSlug = keyof typeof pages;
export const legalMetadata = (slug: LegalSlug) => pageMetadata("/" + slug);
export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const page = pages[slug],
    path = "/" + slug,
    copy = pageCopy[path as keyof typeof pageCopy];
  const schema = {
    "@context": "https://schema.org",
    "@type":
      slug === "about"
        ? "AboutPage"
        : slug === "contact"
          ? "ContactPage"
          : "WebPage",
    name: copy.h1,
    url: site.url + path,
    dateModified: getPageModified(path),
    isPartOf: { "@id": site.url + "/#website" },
  };
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: copy.h1 }]} />
          <span className="eyebrow">POKEBONKDB.ORG</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-meta">
            <span>Updated {getPageModified(path)}</span>
          </div>
        </div>
      </section>
      <section className="legal-article-section">
        <div className="container">
          <div className="article-layout">
            <article className="prose">
              {page.sections.map((s) => (
                <section id={s.id} key={s.id}>
                  <h2>{s.title}</h2>
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {(slug === "about" && s.id === "game") ||
                  (slug === "copyright" && s.id === "links") ? (
                    <p>
                      <a href="/play">Open the game from the Play page</a>
                    </p>
                  ) : null}
                  {slug === "contact" && s.id === "email" ? (
                    <p>
                      <a href={`mailto:${site.contactEmail}`}>
                        {site.contactEmail}
                      </a>
                    </p>
                  ) : null}
                </section>
              ))}
              <p>
                <a href="/about">About Us</a> ·{" "}
                <a href="/privacy-policy">Privacy Policy</a> ·{" "}
                <a href="/terms">Terms of Service</a> ·{" "}
                <a href="/copyright">Copyright</a> ·{" "}
                <a href="/contact">Contact Us</a>
              </p>
            </article>
            <aside className="article-aside">
              <h2>On this page</h2>
              {page.sections.map((s) => (
                <a key={s.id} href={"#" + s.id}>
                  {s.title}
                </a>
              ))}
            </aside>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
