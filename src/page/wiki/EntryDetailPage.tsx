import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import PokemonCard from "@/components/content/PokemonCard";
import { moves, items, fusions } from "@/lib/data/wiki";
import { pokemon } from "@/lib/data/pokedex";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/wiki-detail.css";
export function entryMetadata(kind: "moves" | "items", slug: string) {
  const e = (kind === "moves" ? moves : items).find((e) => e.slug === slug);
  return e?.isDetails
    ? pageMetadata(
        `${e.name} - PokeBonk ${e.category} Guide`,
        `${e.name} in PokeBonk: ${e.description.slice(0, 135)}`,
        `/wiki/${kind}/${slug}`,
      )
    : {};
}
export default function EntryDetailPage({
  kind,
  slug,
}: {
  kind: "moves" | "items";
  slug: string;
}) {
  const e = (kind === "moves" ? moves : items).find((x) => x.slug === slug);
  if (!e || !e.isDetails) notFound();
  const move = kind === "moves" ? moves.find((m) => m.slug === slug) : null;
  const item = kind === "items" ? items.find((i) => i.slug === slug) : null;
  const related = move
    ? pokemon.filter((p) => move.relatedPokemon.includes(p.slug))
    : [];
  const recipes = fusions.filter((f) => f.moves.includes(slug));
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb
            items={[
              {
                label: kind === "moves" ? "Moves & Skills" : "Items & Vitamins",
                href: `/wiki/${kind}`,
              },
              { label: e.name },
            ]}
          />
          <span className="eyebrow">{e.category}</span>
          <h1>
            {e.name}
          </h1>
          <p>{e.description}</p>
          <div className="page-meta">
            <span>v{e.gameVersion}</span>
            <span>Checked {e.lastVerified}</span>
          </div>
        </div>
      </section>
      <section className="page-section wiki-detail-section">
        <div className="container">
          <div className="wiki-detail-content">
            <div className="wiki-detail-symbol">
              <Image
                src={e.image}
                width={96}
                height={96}
                alt={move?.imageAlt || e.name}
                unoptimized
              />
              <span>{e.category}</span>
              {move ? <small>{move.imageKind}</small> : null}
            </div>
            <div className="prose">
              <section>
                <h2>
                  {kind === "moves"
                    ? "Move Overview & Effects"
                    : "Overview & Effects"}
                </h2>
                <p>{e.description}</p>
                {move ? (
                  <p>
                    Category: <strong>{move.category}</strong>.{" "}
                    {move.type !== "passive" ? `Type: ${move.type}.` : ""}{" "}
                    {move.shape ? `Attack pattern: ${move.shape}.` : ""}
                    {move.damageClass
                      ? ` Damage class: ${move.damageClass}.`
                      : ""}
                  </p>
                ) : null}
                {item ? (
                  <p>
                    {item.rarity
                      ? `Item rarity: ${item.rarity}.`
                      : "Vitamin bonuses here describe the common-rarity level."}{" "}
                    {item.max
                      ? `The public configuration lists a stack cap of ${item.max}.`
                      : ""}
                  </p>
                ) : null}
              </section>
              {move ? (
                <>
                  <section>
                    <h2>Level Scaling</h2>
                    <p>
                      Read the move panel during your run for its current
                      damage, cooldown and level scaling. These depend on
                      upgrades and active modifiers; traditional move power and
                      PP are not used here as run statistics.
                    </p>
                    <a href="/tier-list">
                      Understand move levels and slots →
                    </a>
                  </section>
                  <section>
                    <h2>Fusion Relationships</h2>
                    {recipes.length ? (
                      recipes.map((f) => (
                        <div key={f.slug} className="notice">
                          <strong>{f.name}</strong>
                          <p>
                            {f.moves
                              .map(
                                (k) =>
                                  moves.find((m) => m.slug === k)?.name || k,
                              )
                              .join(" + ")}{" "}
                            · Both level 8
                          </p>
                          <a href={`/wiki/attacks#${f.slug}`}>
                            Inspect this fusion →
                          </a>
                        </div>
                      ))
                    ) : (
                      <p>
                        No signature pair for this entry is included in the
                        current finder. Generic type and reaction outcomes can
                        differ; check Bill’s Machine in the game.
                      </p>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <section>
                    <h2>Unlock Method & Availability</h2>
                    <p>
                      The checked client includes this{" "}
                      {e.category.toLowerCase()} in its configuration. Specific
                      account unlock conditions are not independently catalogued
                      for this entry. Inspect the Lab’s item and discovery menus
                      before planning around its availability.
                    </p>
                  </section>
                  <section>
                    <h2>Recommended Uses & Builds</h2>
                    <p>
                      Match the effect to the moves and stats in your current
                      run. A physical damage bonus supports physical attacks; a
                      special damage bonus supports special attacks. Read your
                      pause panel before accepting a bonus based only on its
                      name.
                    </p>
                    <a href="/tier-list">
                      Follow the build planning checklist →
                    </a>
                  </section>
                </>
              )}
              <section>
                <h2>Tips for Your Next Run</h2>
                <p>
                  Compare one change at a time with the same partner, mode,
                  region and difficulty. Check whether the effect improves your
                  survival or the attack you rely on. Keep an escape route open
                  while collecting upgrades.
                </p>
              </section>
              <p className="source-note">
                Reference: the original game’s public client, v{e.gameVersion}.
                Checked {e.lastVerified}. The <a href="/play">Play page</a>{" "}
                opens the game.
              </p>
            </div>
          </div>
          {related.length ? (
            <>
              <h2>
                {move?.type === "passive"
                  ? `Partners with ${e.name}`
                  : `League Kits That Include ${e.name}`}
              </h2>
              <div className="wiki-related-grid">
                {related.map((p) => (
                  <PokemonCard key={p.id} pokemon={p} />
                ))}
              </div>
            </>
          ) : null}
          <div className="related-links">
            <a href={`/wiki/${kind}`}>
              ← All {kind === "moves" ? "moves & skills" : "items & vitamins"}
            </a>
            <a href="/tier-list">Build planning</a>
            <a href="/wiki/lab">Lab upgrades</a>
          </div>
        </div>
      </section>
    </>
  );
}
