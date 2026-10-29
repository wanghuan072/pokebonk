import WikiNavigation from "@/components/content/WikiNavigation";
import gameVersion from "@/data/site/game-version.json";
import pageCopy from "@/data/content/pages.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import { pokemon } from "@/lib/data/pokedex";
import PokedexExplorer from "./PokedexExplorer";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/content/cards.css";
import "@/style/page/pokedex.css";
export const metadata = pageMetadata("/pokedex");
const copy = pageCopy["/pokedex"];
export default function PokedexPage() {
  return (
    <>
      <section className="page-intro pokedex-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Pokédex" }]} />
          <span className="eyebrow">POKÉMON STATS · MOVE KITS · LEAGUE UNLOCKS</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-meta">
            <span>151 Pokédex entries</span>
            <span>79 League partners</span>
            <span>Checked v{gameVersion.version} · {gameVersion.checkedLabel}</span>
          </div>
        </div>
      </section>
      <section className="page-section pokedex-list-section">
        <div className="container">
          <div className="pokedex-list-content">
            <h2>All Pokémon in PokeBonk</h2>
            <p className="section-lede">
              A discovery entry and a selectable League partner are different.
              Filter the roster, then hover over a portrait to inspect its kit and stats. On touch screens, tap a portrait.
            </p>
            <WikiNavigation current="/pokedex"/><PokedexExplorer pokemon={pokemon} />
          </div>
        </div>
      </section>
      <section className="page-section pokedex-starters-section">
        <div className="container">
          <div className="pokedex-starters-content">
            <h2>Starter Pokémon</h2>
            <p className="section-lede">Choose Bulbasaur, Charmander or Squirtle as your first partner. The other two can join your League after completing two runs.</p>
            <div className="notice">
              Unsure where to start?{" "}
              <a className="content-link" href="/guides/beginners-guide">
                Compare the starting move kits and passives →
              </a>
            </div>
            <h2>How to Unlock Pokémon</h2>
            <p>
              Check a locked partner’s League card for its challenge. Completing
              a condition and capturing a partner are separate steps. Evolution
              during a run does not automatically create another starting League
              card.
            </p>
            <a className="button" href="/guides/beginners-guide">
              Read the unlock guide →
            </a>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <div className="page-faq">
            <h2>PokeBonk Pokédex FAQ</h2>
            <details>
              <summary>Are all 151 entries playable partners?</summary>
              <p>
                No. The checked v{gameVersion.version} public client contains 79 League partner
                configurations. Some other species appear through the Pokédex or
                evolution.
              </p>
            </details>
            <details>
              <summary>Where do the Pokémon images come from?</summary>
              <p>
                The cards play the original game’s idle animations. Artwork credits and usage
                information are on the Copyright page.
              </p>
            </details>
            <details>
              <summary>Where are HP and damage values?</summary>
              <p>
                Select a portrait to see the six species stats,
                calculated run baselines, move kits and evolution information.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
