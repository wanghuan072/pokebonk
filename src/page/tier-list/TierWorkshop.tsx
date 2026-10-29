"use client";
import GameSprite from "@/components/content/GameSprite";
import { useState, useSyncExternalStore } from "react";
import { pokemon } from "@/lib/data/pokedex";
import { rankings } from "@/lib/data/editorial";
const rows = ["S", "A", "B", "C", "D", "Unranked"] as const;
type Row = (typeof rows)[number];
type Board = Record<Row, number[]>;
const empty = (): Board => ({
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  Unranked: pokemon.map((p) => p.id),
});
const key = "pokebonk-tier-board-v1";
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("pokebonk-tier", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("pokebonk-tier", cb);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};
function parse(raw: string): Board {
  try {
    const b = JSON.parse(raw),
      ids = rows.flatMap((r) => b[r]);
    if (
      rows.every((r) => Array.isArray(b[r])) &&
      ids.length === 151 &&
      new Set(ids).size === 151 &&
      ids.every((id) => pokemon.some((p) => p.id === id))
    )
      return b;
  } catch {}
  return empty();
}
const byId = new Map(pokemon.map((p) => [p.id, p]));
export default function TierWorkshop() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => ""),
    [draft, setDraft] = useState<Board | null>(null),
    [tab, setTab] = useState("board"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<number | null>(null),
    [message, setMessage] = useState(""),
    [goal, setGoal] = useState("score");
  const board = draft || parse(raw);
  function save(b: Board) {
    try {
      localStorage.setItem(key, JSON.stringify(b));
      setDraft(null);
      window.dispatchEvent(new Event("pokebonk-tier"));
      setMessage("Board saved in this browser.");
    } catch {
      setDraft(b);
      setMessage(
        "Storage unavailable. Your board is kept for this page session.",
      );
    }
  }
  function move(id: number, to: Row, before?: number) {
    if (!byId.has(id) || id === before) return;
    const b = Object.fromEntries(
      rows.map((r) => [r, board[r].filter((x) => x !== id)]),
    ) as Board;
    const i = before === undefined ? -1 : b[to].indexOf(before);
    if (i < 0) b[to].push(id);
    else b[to].splice(i, 0, id);
    save(b);
    setSelected(null);
    setMessage(`${byId.get(id)!.name} moved to ${to}.`);
  }
  const ordered = [...rankings.entries].sort(
    (a, b) =>
      b[goal as "score" | "comfort" | "pressure" | "utility"] -
        a[goal as "score" | "comfort" | "pressure" | "utility"] || a.id - b.id,
  );
  return (
    <div className="tier-workshop" id="your-tier-board">
      <div className="workshop-tabs" role="group" aria-label="Tier list view">
        <button aria-pressed={tab === "board"} onClick={() => setTab("board")}>
          01 <b>Your tier board</b>
          <span>Drag all 151</span>
        </button>
        <button aria-pressed={tab === "picks"} onClick={() => setTab("picks")}>
          02 <b>Our recommendations</b>
          <span>Compare the evidence</span>
        </button>
      </div>
      {tab === "board" ? (
        <>
          <div className="workshop-heading">
            <div>
              <h2>Create your Pokémon tier list</h2>
              <p>
                Drag a Pokémon into a row, or select it and choose a
                destination. Drop on a Pokémon to insert before it.
              </p>
            </div>
            <button
              className="button"
              onClick={() => {
                save(empty());
                setSelected(null);
              }}
            >
              Reset board
            </button>
          </div>
          <div className="board-tools">
            <label className="field">
              Find a Pokémon
              <input
                value={query}
                type="search"
                placeholder="Name or number…"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div>
              <strong>{151 - board.Unranked.length} / 151 ranked</strong>
              <p>All species included; 79 can start a League run.</p>
            </div>
            <button
              className="button"
              onClick={() => {
                const blob = new Blob(
                    [JSON.stringify({ version: 1, board }, null, 2)],
                    { type: "application/json" },
                  ),
                  url = URL.createObjectURL(blob),
                  a = document.createElement("a");
                a.href = url;
                a.download = "pokebonk-my-tier-list.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON ↓
            </button>
          </div>
          <div className="tier-selection" role="status">
            {selected
              ? `Selected: ${byId.get(selected)?.name}. Choose a row below.`
              : "Select any Pokémon for touch or keyboard placement."}
            <span>{message}</span>
          </div>
          <div className="interactive-board">
            {rows.map((row) => (
              <section
                className={`board-row board-${row}`}
                key={row}
                aria-label={`${row} tier`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  move(Number(e.dataTransfer.getData("text/plain")), row);
                }}
              >
                <div className="board-row-label">
                  <b>{row === "Unranked" ? "?" : row}</b>
                  <small>
                    {row === "Unranked"
                      ? "Pokémon pool"
                      : `${board[row].length} Pokémon`}
                  </small>
                  <button
                    disabled={!selected}
                    onClick={() => selected && move(selected, row)}
                    aria-label={`Move selected Pokémon to ${row}`}
                  >
                    Place here
                  </button>
                </div>
                <div className="board-row-members">
                  {board[row]
                    .filter((id) => {
                      const p = byId.get(id)!;
                      return (
                        p.name.toLowerCase().includes(query.toLowerCase()) ||
                        String(id) === query
                      );
                    })
                    .map((id) => {
                      const p = byId.get(id)!;
                      return (
                        <button
                          className={`board-mon ${selected === id ? "chosen" : ""}`}
                          key={id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", String(id))
                          }
                          onClick={() =>
                            setSelected(selected === id ? null : id)
                          }
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            move(
                              Number(e.dataTransfer.getData("text/plain")),
                              row,
                              id,
                            );
                          }}
                          aria-label={`Select ${p.name}`}
                          aria-pressed={selected === id}
                        >
                          <GameSprite
                            id={p.id}
                            alt=""
                            width={70}
                            height={62}
                            
                          />
                          <span>{p.name}</span>
                          <small>
                            #{String(id).padStart(3, "0")}
                            {p.isPlayable ? " · League" : ""}
                          </small>
                        </button>
                      );
                    })}
                  {board[row].length === 0 ? (
                    <span className="row-hint">Drop Pokémon here</span>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="workshop-heading">
            <div>
              <span className="eyebrow">CLASSIC · OPENING COMFORT</span>
              <h2>Compare Classic starting kits</h2>
              <p>
                Compare recovery, protection and the attacks available early in
                a Classic run. Choose a kit for the part of the opening you want
                to improve.
              </p>
            </div>
            <label className="field">
              Compare by
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="score">Overall opening</option>
                <option value="comfort">Comfort</option>
                <option value="pressure">Offensive potential</option>
                <option value="utility">Utility</option>
              </select>
            </label>
          </div>
          <div className="recommended-leaders">
            {ordered.slice(0, 3).map((p, i) => (
              <article key={p.slug}>
                <span className="pick-number">0{i + 1}</span>
                <GameSprite
                  id={p.id}
                  alt={p.name}
                  width={150}
                  height={150}
                />
                <span className="eyebrow">{p.focus}</span>
                <h3>{p.name}</h3>
                <p>{p.passive}</p>
                <span className={`recommend-tier tier-${p.tier}`}>
                  {p.tier} · {p.score} model score
                </span>
              </article>
            ))}
          </div>
          <div className="ranking-method">
            <p>
              These opening scores are editorial comparisons, not measured win
              rates. Lab levels, enemy types and upgrade choices can change the
              result.
            </p>
            <p>
              Game version {rankings.gameVersion} ·{" "}
              <a href="/about#limits">How the kits are compared →</a>
            </p>
            <p>{rankings.versionReview.summary}</p>
          </div>
          <h2>Compare all 79 League starting kits</h2>
          <p className="section-lede">
            An evolved form is part of its starting partner’s run, not a
            separate starting kit. Use the 151-species board to rate forms
            independently.
          </p>
          <div className="recommendation-list">
            {ordered.map((p, i) => (
              <details key={p.slug} className="recommendation-row">
                <summary>
                  <span className="rec-position">{i + 1}</span>
                  <GameSprite
                    id={p.id}
                    alt=""
                    width={60}
                    height={60}
                  />
                  <span className="rec-name">
                    <b>{p.name}</b>
                    <small>{p.focus}</small>
                  </span>
                  <span className="rec-meters">
                    <span>
                      Comfort <b>{p.comfort}</b>
                      <meter min="0" max="100" value={p.comfort} />
                    </span>
                    <span>
                      Pressure <b>{p.pressure}</b>
                      <meter min="0" max="100" value={p.pressure} />
                    </span>
                    <span>
                      Utility <b>{p.utility}</b>
                      <meter min="0" max="100" value={p.utility} />
                    </span>
                  </span>
                  <strong className={`recommend-tier tier-${p.tier}`}>
                    {p.tier}
                  </strong>
                  <span>＋</span>
                </summary>
                <div className="rec-evidence">
                  <p>
                    <b>Why consider it:</b> {p.passive}
                  </p>
                  <p>
                    <b>Watch for:</b> {p.caution}
                  </p>
                  <p>
                    Unmodified baseline: {p.baseline.hp} HP · {p.baseline.armor}{" "}
                    armor · {p.baseline.regen} regen · ×{p.baseline.physical}{" "}
                    physical · ×{p.baseline.special} special.
                  </p>
                  <div className="rec-kit">
                    {p.kit.map((m) => (
                      <a key={m.slug} href={`/wiki/attacks#${m.slug}`}>
                        {m.name}
                        <small>
                          {m.type} · {m.shape}
                        </small>
                      </a>
                    ))}
                  </div>
                  <a href={`/pokedex#${p.slug}`} className="content-link">
                    Check the full kit in the Pokédex →
                  </a>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
