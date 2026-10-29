import Image from "next/image";
import routes from "@/data/builds/routes.json";
import pageCopy from "@/data/content/pages.json";
import gameVersion from "@/data/site/game-version.json";
import Breadcrumb from "@/components/content/Breadcrumb";
import { pokemon } from "@/lib/data/pokedex";
import { attacks, catalogItems, vitamins } from "@/lib/data/wiki";
import { contentPath } from "@/lib/content-path";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/builds.css";

export const metadata = pageMetadata("/builds");

type Slot = {
  label: string;
  detail: string;
  attack?: string;
  attacks?: string[];
  result?: string;
};

function attackBy(slug: string) {
  const attack = attacks.find((entry) => entry.slug === slug);
  if (!attack) throw new Error("Missing attack: " + slug);
  return attack;
}

function AttackLink({ slug }: { slug: string }) {
  const attack = attackBy(slug);
  return (
    <a href={contentPath("/wiki/attacks", attack)}>
      <Image src={attack.image} alt="" width={28} height={28} unoptimized />
      {attack.name}
    </a>
  );
}

export default function BuildsPage() {
  const copy = pageCopy["/builds"];
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Builds" }]} />
          <span className="eyebrow">ATTACK ROUTES · VITAMINS · ITEM PRIORITIES</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
          <div className="page-meta">
            <span>{routes.length} routes</span>
            <span>Checked v{gameVersion.version} · {gameVersion.checkedLabel}</span>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container builds-layout">
          <p className="notice">
            We tested these in Survival and kept the combinations that made a run easier to stay alive. Each one uses that partner’s own kit: the attack worth keeping, the signature fusion at level 8, three vitamins and the items to take first. They are not a leaderboard and not a win-rate ranking.
          </p>
          {routes.map((route) => {
            const partner = pokemon.find((entry) => entry.slug === route.partner);
            if (!partner) throw new Error("Missing partner: " + route.partner);
            const shown = pokemon.find((entry) => entry.id === route.shownAs) || partner;
            return (
              <article className="build-route" id={route.id} key={route.id}>
                <header className="build-route-head">
                  <Image
                    src={`/images/pokemon/game/portraits/${shown.id}.png`}
                    alt={shown.name}
                    width={72}
                    height={72}
                    unoptimized
                  />
                  <div>
                    <span className="eyebrow">{route.kicker}</span>
                    <h2>{route.title}</h2>
                    <p>
                      Start as <a href={contentPath("/pokedex", partner)}>{partner.name}</a>{shown.id === partner.id ? "." : `, shown here after evolving into ${shown.name}.`}
                    </p>
                  </div>
                </header>
                <p className="build-record">{route.record}</p>
                <div className="build-columns">
                  <section>
                    <h3>Attacks</h3>
                    <ol className="build-slots">
                      {(route.slots as Slot[]).map((slot) => (
                        <li key={slot.label + (slot.attack || slot.result)}>
                          <span className="build-slot-label">{slot.label}</span>
                          <div className="build-slot-links">
                            {slot.attack ? <AttackLink slug={slot.attack} /> : null}
                            {slot.attacks?.map((slug, index) => (
                              <span key={slug}>
                                {index ? <i aria-hidden="true">＋</i> : null}
                                <AttackLink slug={slug} />
                              </span>
                            ))}
                            {slot.result ? (
                              <>
                                <i aria-hidden="true">→</i>
                                <AttackLink slug={slot.result} />
                              </>
                            ) : null}
                          </div>
                          <p>{slot.detail}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section>
                    <h3>Vitamins</h3>
                    <ul className="build-picks">
                      {route.vitamins.map((pick) => {
                        const vitamin = vitamins.find((entry) => entry.slug === pick.slug);
                        if (!vitamin) throw new Error("Missing vitamin: " + pick.slug);
                        return (
                          <li key={pick.slug}>
                            <a href={contentPath("/wiki/vitamins", vitamin)}>
                              <Image src={vitamin.image} alt="" width={28} height={28} unoptimized />
                              <b>{vitamin.name}</b>
                              <small>{vitamin.label}</small>
                            </a>
                            <p>{pick.why}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                  <section>
                    <h3>Items to prefer</h3>
                    <ul className="build-picks">
                      {route.items.map((pick) => {
                        const item = catalogItems.find((entry) => entry.slug === pick.slug);
                        if (!item) throw new Error("Missing item: " + pick.slug);
                        return (
                          <li key={pick.slug}>
                            <a href={contentPath("/wiki/items", item)}>
                              <Image src={item.image} alt="" width={28} height={28} unoptimized />
                              <b>{item.name}</b>
                              <small>{pick.priority}</small>
                            </a>
                            <p>{pick.why}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </div>
                <p className="build-tradeoff"><b>Tradeoff. </b>{route.tradeoff}</p>
              </article>
            );
          })}
          <p className="build-more">
            <a href="/guides/endless-mode-guide">Read the Survival guide</a>
            <a href="/wiki/attacks#fusions">Check every fusion pair</a>
          </p>
        </div>
      </section>
    </>
  );
}
