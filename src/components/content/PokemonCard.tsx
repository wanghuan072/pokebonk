import GameSprite from "@/components/content/GameSprite";
import type { Pokemon } from "@/types/pokemon";
import { moves } from "@/lib/data/wiki";
import "@/style/content/cards.css";
export default function PokemonCard({
  pokemon: p,
  anchored = true,
}: {
  pokemon: Pokemon;
  anchored?: boolean;
}) {
  return (
    <article
      className={`pokemon-card tone-${p.types[0]}`}
      id={anchored ? p.slug : undefined}
    >
      <div className="pokemon-card-art">
        <span className="pokemon-card-number">
          #{String(p.id).padStart(3, "0")}
        </span>
        <GameSprite
          id={p.id}
          alt={`${p.name}`}
          width={240}
          height={180}
        />
      </div>
      <div className="pokemon-card-info">
        <h3>{p.name}</h3>
        <div className="type-tags">
          {p.types.map((t) => (
            <span className={`type-tag type-${t}`} key={t}>
              {t}
            </span>
          ))}
        </div>
        <p>{p.isPlayable ? p.role : "Pokédex entry"}</p>
        {p.baseStats ? (
          <div
            className="pokemon-card-stats"
            title="Base species stats shown in the original League"
          >
            <span>
              Species HP <b>{p.baseStats.hp}</b>
            </span>
            <span>
              ATK <b>{p.baseStats.atk}</b>
            </span>
            <span>
              DEF <b>{p.baseStats.def}</b>
            </span>
          </div>
        ) : null}
        {p.moves[0] ? (
          <div className="pokemon-card-move">
            {moves.find((m) => m.slug === p.moves[0])?.name}
          </div>
        ) : null}
        <span className="pokemon-card-status">
          {p.isStarter
            ? "● Starter choice"
            : p.isPlayable
              ? "● League partner"
              : "◇ Discovery entry"}
        </span>
        {p.isDetails ? (
          <a href={`/pokedex/${p.slug}`}>View entry →</a>
        ) : (
          <details className="pokemon-inline">
            <summary>
              Stats & kit <span>＋</span>
            </summary>
            <p>{p.description}</p>
            <dl className="inline-stats">
              {Object.entries(p.baseStats || {}).map(([k, v]) => (
                <div key={k}>
                  <dt>{k.toUpperCase()}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {p.baseRunStats ? (
              <p>
                Before passives and upgrades: {p.baseRunStats.hp} HP · {p.baseRunStats.armor}{" "}
                armor · {p.baseRunStats.regen} regen
              </p>
            ) : null}
            <p>
              {(p.isStarter ? `One of the three first-partner choices. To add an unchosen starter to your League: ${p.unlockCondition}` : p.unlockCondition) ||
                (p.isStarter
                  ? "Available as a starting partner."
                  : "Evolution / discovery entry; not a separate League starting partner.")}
            </p>
            {p.passive ? (
              <p>
                <b>Passive: </b>
                {moves.find((m) => m.slug === p.passive)?.description ||
                  p.passive}
              </p>
            ) : null}
            <ul>
              {p.moves.map((slug) => (
                <li key={slug}>{moves.find((m) => m.slug === slug)?.name}</li>
              ))}
            </ul>
            {p.evolution?.length ? (
              <p>
                Next:{" "}
                {p.evolution
                  .map((e) => `${e.name}${e.level ? ` at Lv ${e.level}` : ""}`)
                  .join(" / ")}
              </p>
            ) : null}
          </details>
        )}
      </div>
    </article>
  );
}
