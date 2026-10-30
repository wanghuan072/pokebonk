"use client";
import gameVersion from "@/data/site/game-version.json";

import GameSprite from "@/components/content/GameSprite";
import { useState } from "react";
import { releases } from "@/lib/data/editorial";
function PatchText({text}:{text:string}) { return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>part.startsWith("**") ? <strong key={i}>{part.slice(2,-2)}</strong> : part)}</>; }
const tags = (notes: string[]) => {
  const s = notes.join(" ").toLowerCase();
  return [
    "Features",
    ...(/balanc|damage|cooldown|nerf|buff|scal|armor/.test(s)
      ? ["Balance"]
      : []),
    ...(/fix|bug|crash|correct/.test(s) ? ["Fixes"] : []),
    ...(/season|clan|rank|leaderboard/.test(s) ? ["Season & ranking"] : []),
  ];
};
export default function UpdatesExplorer() {
  const [q, setQ] = useState(""),
    [tag, setTag] = useState("All updates");
  const shown = releases.filter(
    (r) =>
      (r.version + " " + r.notes.join(" "))
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (tag === "All updates" || tags(r.notes).includes(tag)),
  );
  const latest = releases[0];
  return (
    <div className="release-desk">
      <article className="latest-release">
        <div>
          <span className="eyebrow">LATEST PUBLISHED NOTE</span>
          <h2>v{latest.version}</h2>
          <time dateTime={latest.date}>{latest.date}</time>
          <p><PatchText text={latest.title} /></p>
          <div className="release-summary"><span>{latest.notes.length} changes</span><span>{releases.length} published releases</span><span>Official patch notes</span></div>
          <a
            className="button button-gold"
            href="#release-history"
            onClick={() => {
              setQ("");
              setTag("All updates");
            }}
          >
            See the full changes ↓
          </a>
        </div>
        <div className="release-stamp"><div className="release-mascot"><GameSprite id={4} width={65} height={65} alt="Charmander"/><span>IN THIS RELEASE</span></div><div className="release-highlights">{latest.notes.slice(0,3).map((note)=><p key={note}><PatchText text={note}/></p>)}</div></div>
      </article>
      <div className="release-controls">
        <label className="field">
          Search version or change
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try clans, damage, v0.8…"
          />
        </label>
        <div
          className="catalog-category-tabs"
          role="group"
          aria-label="Update topic"
        >
          {["All updates", "Balance", "Fixes", "Season & ranking"].map((t) => (
            <button key={t} aria-pressed={t === tag} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count" role="status">
        {shown.length} published updates · topic labels are editorial filters
      </p>
      <div className="release-history" id="release-history">
        {shown.map((r, i) => (
          <article id={r.slug} key={r.slug} className="release-card">
            <div className="release-date">
              <time dateTime={r.date}>{r.date}</time>
              <span>v{r.version}</span>
            </div>
            <div className="release-body">
              <div className="release-labels">
                {tags(r.notes)
                  .filter((t) => t !== "Features")
                  .map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                {r.slug === latest.slug ? <b>Latest</b> : null}
              </div>
              <h3>PokeBonk v{r.version}</h3>
              <details open={i === 0}>
                <summary>
                  {r.notes.length} {r.notes.length === 1 ? "change" : "changes"}{" "}
                  in this release <span>＋</span>
                </summary>
                <ul>
                  {r.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </details>
            </div>
          </article>
        ))}
      </div>
      {!shown.length ? (
        <div className="empty-state">
          No release notes match. Try another topic.
        </div>
      ) : null}
      <p className="source-note">
        Published notes through v{gameVersion.version} · checked {gameVersion.checkedLabel}. Gameplay
        tables use version {gameVersion.version}.{" "}
        <a href="/about#independence">How data is checked →</a>
      </p>
    </div>
  );
}
