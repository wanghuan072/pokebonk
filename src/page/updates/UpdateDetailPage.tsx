import { notFound } from "next/navigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import { releases } from "@/lib/data/editorial";
import { pageMetadata } from "@/seo/metadata";
import { site } from "@/config/site";
import "@/style/content/article.css";
import "@/style/page/updates.css";
export function generateStaticParams() {
  return releases.map((u) => ({ slug: u.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = releases.find((u) => u.slug === slug);
  return u?.isDetails
    ? pageMetadata(
        `PokeBonk v${u.version} Patch Notes`,
        `PokeBonk v${u.version}, released ${u.date}: ${u.notes[0].slice(0, 110)}`,
        `/updates/${u.slug}`,
      )
    : {};
}
export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = releases.findIndex((u) => u.slug === slug);
  const u = releases[index];
  if (!u || !u.isDetails) notFound();
  const newer = releases[index - 1],
    older = releases[index + 1];
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Updates", href: "/updates" },
              { label: `v${u.version}` },
            ]}
          />
          <span className="eyebrow">
            {u.version === "0.8.0" ? "SEASON 2 LAUNCH" : "PATCH NOTES"}
          </span>
          <h1>PokeBonk v{u.version} Patch Notes</h1>
          <p>
            The published changes for this release, with related references to
            help you prepare your next run.
          </p>
          <div className="page-meta">
            <span>Released {u.date}</span>
            <span>Checked {u.lastVerified}</span>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <div className="prose update-detail-content">
            <section>
              <h2>Update Overview</h2>
              <p>
                This release appears in the original game’s public update
                history with {u.notes.length} published{" "}
                {u.notes.length === 1 ? "note" : "notes"}. The following list
                reflects that release entry; changes to server policies are not
                independently verified here.
              </p>
            </section>
            <section>
              <h2>
                {u.version === "0.8.0"
                  ? "New Features & Season 2 Changes"
                  : "Changes & Fixes"}
              </h2>
              <ul className="update-detail-notes">
                {u.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Check your build after an update</h2>
              <p>
                After updating, compare the current controls and move panels
                with your saved setup. Recheck a build or unlock goal if a patch
                changes the system it depends on.
              </p>
              <div className="related-links">
                <a href="/guides/beginners-guide">Controls & bindings</a>
                <a href="/wiki/attacks#fusions">Move fusions</a>
                <a href="/wiki/lab">Lab reference</a>
                <a href="/tier-list">Mode comparison</a>
              </div>
            </section>
            <p className="source-note">
              Primary source: the original PokéBonk release history. The{" "}
              <a href="/play">Play page</a> opens the game. Read the current
              in-game notes for subsequent changes.
            </p>
            <nav
              className="update-pagination"
              aria-label="Previous and next update"
            >
              {older ? (
                <a href={`/updates/${older.slug}`}>
                  <small>OLDER RELEASE</small>← v{older.version}
                </a>
              ) : (
                <span />
              )}
              {newer ? (
                <a href={`/updates/${newer.slug}`}>
                  <small>NEWER RELEASE</small>v{newer.version} →
                </a>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `PokeBonk v${u.version} Patch Notes`,
            datePublished: u.date,
            dateModified: u.lastVerified,
            author: {
              "@type": "Organization",
              name: site.name,
              url: site.url + "/about",
            },
            mainEntityOfPage: site.url + "/updates/" + u.slug,
            image: site.url + "/opengraph-image",
          }).replace(/</g, "\u003c"),
        }}
      />
    </>
  );
}
