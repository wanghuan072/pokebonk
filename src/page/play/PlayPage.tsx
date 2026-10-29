import pageCopy from "@/data/content/pages.json";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import Icon from "@/components/common/Icon";
import { site } from "@/config/site";
import { pageMetadata } from "@/seo/metadata";
import "@/style/content/article.css";
import "@/style/page/play.css";
export const metadata = pageMetadata("/play");
const copy = pageCopy["/play"];
export default function PlayPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <Breadcrumb items={[{ label: "Play" }]} />
          <span className="eyebrow">PLAY ONLINE · CONTROLS · BROWSER REQUIREMENTS</span>
          <h1>{copy.h1}</h1>
          <p>{copy.description}</p>
        </div>
      </section>
      <section className="page-section play-portal-section">
        <div className="container">
          <div className="play-portal-content">
            <div className="play-portal">
              <Image
                src="/images/source/pokebonk-social.jpg"
                alt="Original PokeBonk promotional artwork"
                fill
                sizes="(max-width:768px) 100vw,90vw"
                priority
              />
              <div className="play-portal-overlay" />
              <div className="play-portal-copy">
                <Icon name="controller" />
                <span className="eyebrow">THE ORIGINAL BROWSER GAME</span>
                <h2>
                  Open PokeBonk.
                  <br />
                  <span>Choose your first partner.</span>
                </h2>
                <p>Play in your browser, learn the controls and evolve your partner during a run.</p>
                <a
                  className="button button-gold"
                  href={site.gameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Play on the Original Site ↗
                </a>
                <small>Free browser game · JavaScript & WebGL required</small>
              </div>
            </div>
            <div className="play-portal-note">
              <span className="live-dot" />
              <p>
                The game opens at <strong>pokebonk.com</strong>. Game accounts
                and saves stay with the original service. This wiki does not
                host the game.
              </p>
              <a href="/guides/beginners-guide">First time here? Read this →</a>
            </div>
          </div>
        </div>
      </section>
      <section className="page-section play-basics-section">
        <div className="container">
          <div className="play-basics-content">
            <div>
              <h2>Controls at a Glance</h2>
              <dl className="play-controls">
                {[
                  ["W A S D", "Move"],
                  ["Mouse", "Look around"],
                  ["Space", "Jump"],
                  ["Shift", "Slide"],
                  ["R", "Ultimate"],
                  ["Esc", "Pause"],
                ].map(([key, desc]) => (
                  <div key={key}>
                    <dt>
                      <kbd>{key}</kbd>
                    </dt>
                    <dd>{desc}</dd>
                  </div>
                ))}
              </dl>
              <a className="content-link" href="/guides/beginners-guide">
                Full controls & rebinding guide →
              </a>
            </div>
            <div>
              <h2>How to Play</h2>
              <ol className="play-steps">
                <li>
                  <strong>Choose your starting partner.</strong>
                  <p>
                    Bulbasaur, Charmander and Squirtle offer three different
                    starting kits.
                  </p>
                </li>
                <li>
                  <strong>Select your run.</strong>
                  <p>
                    Choose an available region, mode and difficulty in the
                    game’s Play menu.
                  </p>
                </li>
                <li>
                  <strong>Move, learn and grow.</strong>
                  <p>
                    Keep an escape route open, read your upgrade cards and
                    review the run before spending Stardust.
                  </p>
                </li>
              </ol>
              <div className="related-links">
                <a href="/guides/beginners-guide">Beginner guide</a>
                <a href="/guides/beginners-guide">Compare starters</a>
                <a href="/">Back to Wiki</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <div className="page-faq">
            <h2>Before You Play</h2>
            <details>
              <summary>Can I play without registering?</summary>
              <p>
                The original game provides a Guest option. Read its current
                retention and save policies if you plan to keep your progress
                long-term.
              </p>
            </details>
            <details>
              <summary>Why does the game open in a new tab?</summary>
              <p>
                We link directly to the original service so its controls,
                browser storage and account flow work in its own page. Keep your
                run in that tab and return here when you need a move recipe or
                upgrade cost.
              </p>
            </details>
            <details>
              <summary>What if the game does not load?</summary>
              <p>
                Check JavaScript, WebGL, the network and browser graphics
                support. Read the troubleshooting guide before clearing any game
                storage.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
