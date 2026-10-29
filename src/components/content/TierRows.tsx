import GameSprite from "@/components/content/GameSprite";
import { rankings } from "@/lib/data/editorial";
import { getPokemon } from "@/lib/data/pokedex";
import "@/style/content/tier-rows.css";
export default function TierRows({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="tier-rows">
      {rankings.tiers.map((t) => (
        <div className={`tier-row tier-${t.tier}`} key={t.tier}>
          <div className="tier-rank">
            <strong>{t.tier}</strong>
            <small>{t.label}</small>
          </div>
          <div className="tier-members">
            {(expanded ? t.pokemon : t.pokemon.slice(0, 5)).map((slug) => {
              const p = getPokemon(slug)!;
              return (
                <a href={`/pokedex#${slug}`} key={slug}>
                  <GameSprite id={p.id} width={80} height={60} alt={p.name} />
                  <span>{p.name}</span>
                </a>
              );
            })}
            {!t.pokemon.length ? (
              <span className="tier-unranked">More partners under review</span>
            ) : null}
            {expanded ? <p>{t.reason}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
