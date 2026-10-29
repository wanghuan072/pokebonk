import GameSprite from "@/components/content/GameSprite";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/content/Breadcrumb";
import PokemonCard from "@/components/content/PokemonCard";
import { pokemon, getPokemon } from "@/lib/data/pokedex";
import { moves } from "@/lib/data/wiki";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/pokemon-detail.css";
export function generateStaticParams() {
  return pokemon.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getPokemon((await params).slug);
  return p?.isDetails
    ? pageMetadata(
        `${p.name} - PokeBonk Pokédex`,
        `${p.name} in PokeBonk: ${p.types.join("/")} types, ${p.isPlayable ? "League move kit, passive and unlock challenge" : "Pokédex entry and related evolution family"}.`,
        `/pokedex/${p.slug}`,
      )
    : {};
}
export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getPokemon((await params).slug);
  if (!p || !p.isDetails) notFound();
  const passive = moves.find((m) => m.slug === p.passive);
  const family = pokemon.filter((x) => x.family === p.family);
  const related = pokemon
    .filter((x) => x.id !== p.id && x.types.some((t) => p.types.includes(t)))
    .slice(0, 4);
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb
            items={[{ label: "Pokédex", href: "/pokedex" }, { label: p.name }]}
          />
          <span className="eyebrow">
            POKÉDEX #{String(p.id).padStart(3, "0")}
          </span>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <div className="page-meta">
            <span>
              {p.isPlayable ? "Confirmed League partner" : "Pokédex entry"}
            </span>
            <span>
              v{p.gameVersion} · Checked {p.lastVerified}
            </span>
          </div>
        </div>
      </section>
      <section className="page-section pokemon-overview-section">
        <div className="container">
          <div className="pokemon-overview-content">
            <div className={`pokemon-detail-art tone-${p.types[0]}`}>
              <div className="pokemon-card-art">
                <GameSprite
                  id={p.id}
                  width={480}
                  height={360}
                  alt={`${p.name}`}
                />
              </div>
              <span>Original game animation</span>
            </div>
            <div className="pokemon-overview-copy">
              <h2>Pokémon Overview</h2>
              <div className="type-tags">
                {p.types.map((t) => (
                  <span className={`type-tag type-${t}`} key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <dl>
                <div>
                  <dt>Pokédex number</dt>
                  <dd>#{String(p.id).padStart(3, "0")}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{p.role}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>
                    {p.isStarter
                      ? "Starting partner"
                      : p.isPlayable
                        ? "League challenge & capture"
                        : "No separate League configuration confirmed"}
                  </dd>
                </div>
                <div>
                  <dt>Starting move</dt>
                  <dd>
                    {p.moves[0] ? (
                      <a href={`/wiki/attacks/${p.moves[0]}`}>
                        {moves.find((m) => m.slug === p.moves[0])?.name ||
                          p.moves[0]}
                      </a>
                    ) : (
                      "Not applicable to this entry"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <div className="pokemon-detail-layout">
            <div className="prose">
              <section id="moves">
                <h2>Moves & Abilities</h2>
                {passive ? (
                  <div className="pokemon-passive">
                    <span className="eyebrow">PASSIVE ABILITY</span>
                    <h3>
                      <a href={`/wiki/attacks/${passive.slug}`}>{passive.name}</a>
                    </h3>
                    <p>{passive.description}</p>
                  </div>
                ) : (
                  <p>
                    A separate League passive is not confirmed for this entry.
                  </p>
                )}
                <div className="pokemon-move-list">
                  {p.moves.map((slug, i) => {
                    const m = moves.find((x) => x.slug === slug);
                    return (
                      <a href={`/wiki/attacks/${slug}`} key={slug}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <strong>{m?.name || slug}</strong>
                        <small>
                          {i === 0
                            ? "Starting move · Lv 1"
                            : `Learn at Lv ${p.kitLevels[i]}`}
                        </small>
                        <b>→</b>
                      </a>
                    );
                  })}
                </div>
                {!p.moves.length ? (
                  <p>
                    Check a starting partner in this evolution family for its
                    confirmed kit.
                  </p>
                ) : null}
              </section>
              <section id="stats">
                <h2>Base Stats</h2>
                <p>
                  Species stats from the original game’s Pokédex data and League
                  “Base Stats” panel. These are separate from your modified
                  in-run values.
                </p>
                <div className="pokemon-stat-bars">
                  {Object.entries(p.baseStats).map(([key, value]) => (
                    <div key={key}>
                      <span>
                        {
                          {
                            hp: "HP",
                            atk: "Attack",
                            def: "Defense",
                            spa: "Sp. Attack",
                            spd: "Sp. Defense",
                            spe: "Speed",
                          }[key]
                        }
                      </span>
                      <b>{value}</b>
                      <progress value={value} max={255} aria-label={key} />
                    </div>
                  ))}
                </div>
                {p.baseRunStats ? (
                  <>
                    <h3>Run Baseline</h3>
                    <p>
                      Before Lab purchases, passive effects, items and evolution
                      bonuses: {p.baseRunStats.hp} max HP,{" "}
                      {p.baseRunStats.armor.toFixed(1)} armor,{" "}
                      {p.baseRunStats.regen.toFixed(2)} HP/s regeneration and ×
                      {p.baseRunStats.moveSpeed.toFixed(2)} movement speed. Your
                      League preview adds the partner’s passive on top.
                    </p>
                  </>
                ) : null}
              </section>
              {p.ultimate ? (
                <section id="ultimate">
                  <h2>Ultimate Abilities</h2>
                  <p>
                    Ultimate forms for runs starting with{" "}
                    {p.evolutionOrigin?.name}. Evolved forms retain that
                    partner’s Ultimate progression.
                  </p>
                  <div className="pokemon-ultimates">
                    {p.ultimate.names.map((name, i) => (
                      <article key={name}>
                        <span className="eyebrow">
                          {p.ultimate?.forms[i]?.name ||
                            (p.evolutionBranch.length && i === 1
                              ? "Chosen Eevee evolution"
                              : `Form ${i + 1}`)}
                        </span>
                        {p.ultimate?.forms[i] ? (
                          <Image
                            src={p.ultimate.forms[i].image}
                            width={56}
                            height={56}
                            alt={p.ultimate.forms[i].name}
                          />
                        ) : null}
                        <h3>{name}</h3>
                        <p>{p.ultimate?.descriptions?.[i]}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
              <section id="evolution">
                <h2>Evolution Family</h2>
                <div className="pokemon-evolution-chain">
                  {family.map((f) => (
                    <a key={f.id} href={`/pokedex/${f.slug}`}>
                      <GameSprite
                        id={f.id}
                        width={110}
                        height={83}
                        alt={f.name}
                      />
                      <span>{f.name}</span>
                    </a>
                  ))}
                </div>
                <p>
                  {p.evolution.length
                    ? p.evolution
                        .map(
                          (e) =>
                            `${p.name} → ${e.name} at run level ${e.level}`,
                        )
                        .join(" · ")
                    : "This is the last recorded form of this evolution path."}{" "}
                  {p.evolutionOrigin
                    ? ` Run path for ${p.evolutionOrigin.name}: ${p.evolutionPath.map((s) => `${s.name} (Lv ${s.level})`).join(" → ")}${p.evolutionBranch.length ? ` → choose ${p.evolutionBranch.map((b) => b.name).join(" / ")} at Lv ${p.evolutionBranch[0].level}` : ""}.`
                    : ""}{" "}
                  These are PokeBonk run thresholds, not traditional evolution
                  levels.
                </p>
              </section>
              <section id="unlock">
                <h2>How to Unlock {p.name}</h2>
                <p>
                  {p.isStarter
                    ? "You can choose this Pokémon when starting a fresh Guest session. To obtain another starter later, inspect its League challenge."
                    : p.isPlayable
                      ? "Complete the League challenge below, then follow the wild encounter and capture process."
                      : "This species is a confirmed Pokédex entry, but we do not mark it as a separately selectable League partner."}
                </p>
                {p.unlockCondition ? (
                  <div className="notice">
                    <strong>League challenge:</strong> {p.unlockCondition}
                  </div>
                ) : null}
                <a href="/guides/beginners-guide">
                  Read the full unlock guide →
                </a>
              </section>
              <section id="builds">
                <h2>Build Planning & Strategy</h2>
                <p>
                  {p.isPlayable
                    ? `Start with ${p.name}’s ${p.role.toLowerCase()} role and the attack pattern of its opening move. Read whether each attack uses physical or special damage before choosing vitamins.`
                    : "Use a confirmed partner’s kit as the starting point for a build. A Pokédex species listing alone does not establish a playable setup."}
                </p>
                <p>
                  Compare items with the attacks you currently use, leave room
                  for future move choices, and address the source of damage that
                  ended your previous run. No untested “best build” is claimed
                  for this entry.
                </p>
                <div className="related-links">
                  <a href="/wiki/items">Items & Vitamins</a>
                  <a href="/tier-list">Build planning guide</a>
                  <a href="/tier-list">Survival kit comparison</a>
                </div>
              </section>
              <p className="source-note">
                Checked against the original game’s public v{p.gameVersion}{" "}
                client on {p.lastVerified}. Live balance may differ. The{" "}
                <a href="/play">Play page</a> opens the game.
              </p>
            </div>
            <aside className="article-aside">
              <h2>On this page</h2>
              {[
                ["moves", "Moves & abilities"],
                ["stats", "Run stats"],
                ["evolution", "Evolution family"],
                ["unlock", "Unlock condition"],
                ["builds", "Build planning"],
              ].map(([id, label]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </aside>
          </div>
          <h2>Related Pokémon</h2>
          <div className="pokemon-related-grid">
            {related.map((r) => (
              <PokemonCard key={r.id} pokemon={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
