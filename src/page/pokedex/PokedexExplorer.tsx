"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GameSprite from "@/components/content/GameSprite";
import type { Pokemon } from "@/types/pokemon";
import { moves } from "@/lib/data/wiki";

const statNames = { hp: "HP", atk: "Attack", def: "Defense", spa: "Sp. Atk", spd: "Sp. Def", spe: "Speed" };
export default function PokedexExplorer({ pokemon }: { pokemon: Pokemon[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("number");
  const [unlock, setUnlock] = useState("all");
  const [activeId, setActiveId] = useState(6);
  const [open, setOpen] = useState(false);
  const preview = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (open && window.matchMedia("(max-width: 768px)").matches) preview.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    function selectHash() {
      const entry = pokemon.find((p) => `#${p.slug}` === window.location.hash);
      if (entry) { setActiveId(entry.id); setOpen(window.matchMedia("(max-width: 768px)").matches); }
    }
    selectHash();
    window.addEventListener("hashchange", selectHash);
    return () => window.removeEventListener("hashchange", selectHash);
  }, [pokemon]);
  const types = [...new Set(pokemon.flatMap((p) => p.types))].sort();
  const filtered = pokemon.filter((p) =>
    (p.name.toLowerCase().includes(query.trim().toLowerCase()) || String(p.id).padStart(3, "0").includes(query.trim())) &&
    (type === "all" || p.types.includes(type)) &&
    (status === "all" || p.isPlayable) && (unlock === "all" || p.isStarter)
  ).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "reverse" ? b.id - a.id : a.id - b.id);
  const active = filtered.find((p) => p.id === activeId) || filtered[0];
  const passive = moves.find((m) => m.slug === active?.passive);
  const family = active ? pokemon.filter((p) => p.family === active.family) : [];
  function reset() { setQuery(""); setType("all"); setStatus("all"); setSort("number"); setUnlock("all"); }
  function close() { setOpen(false); trigger.current?.focus({ preventScroll: true }); }
  return <div className="pokedex-workspace">
    <div className="pokedex-browser">
      <div className="pokedex-controls">
        <label className="pokedex-search">Find your Pokémon<input type="search" placeholder="Search name or number…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <div className="pokedex-tabs" role="group" aria-label="Pokédex view">
          <button className={status === "all" ? "selected" : ""} aria-pressed={status === "all"} onClick={() => setStatus("all")}>All <span>151</span></button>
          <button className={status === "playable" ? "selected" : ""} aria-label="Playable League Partners 79" aria-pressed={status === "playable"} onClick={() => setStatus("playable")}>League <span>79</span></button>
        </div>
      </div>
      <div className="pokedex-filter-row">
        <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{types.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
        <label>Availability<select value={unlock} onChange={(e) => setUnlock(e.target.value)}><option value="all">All partners</option><option value="starter">Starter choices</option></select></label>
        <label>Sort by<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="number">Number ↑</option><option value="reverse">Number ↓</option><option value="name">Name A–Z</option></select></label>
        <button onClick={reset}>Reset Filters</button>
      </div>
      <div className="pokedex-type-filter" role="group" aria-label="Filter by Pokémon type">
        <button aria-label="All types" aria-pressed={type === "all"} onClick={() => setType("all")}>All</button>
        {types.map((t) => <button key={t} title={t} aria-label={`${t} type`} aria-pressed={type === t} onClick={() => setType(type === t ? "all" : t)}><Image src={`/images/types/game/${t}.png`} alt="" width={24} height={24} unoptimized /></button>)}
      </div>
      <div className="pokedex-browser-meta"><p className="result-count" role="status">Showing <b>{filtered.length}</b> of {pokemon.length} Pokédex entries</p><span>Hover to inspect · click to select</span></div>
      <div className="pokedex-grid">
        {filtered.map((p) => <button className={`pokemon-tile tone-${p.types[0]}${active?.id === p.id ? " selected" : ""}`} id={p.slug} key={p.id} aria-label={`Inspect ${p.name}, number ${p.id}`} aria-pressed={active?.id === p.id} aria-controls="pokemon-preview" onPointerEnter={(e) => { if (e.pointerType === "mouse") setActiveId(p.id); }} onFocus={() => setActiveId(p.id)} onClick={(e) => { setActiveId(p.id); setOpen(true); trigger.current = e.currentTarget; }}>
          <span className="pokemon-tile-portrait"><Image src={p.image} alt="" width={64} height={64} unoptimized /></span>
          <span className="pokemon-tile-number">{String(p.id).padStart(3, "0")}</span>
          {p.isPlayable ? <span className="pokemon-tile-league" title="League partner" /> : null}
          <span className="pokemon-tile-name">{p.name}</span>
        </button>)}
      </div>
      {!filtered.length ? <div className="empty-state"><h3>No Pokémon found</h3><p>Try another name or a broader filter.</p><button className="button" onClick={reset}>Clear filters</button></div> : null}
      <p className="pokedex-browser-foot"><span>● League partner</span> Original game portraits · Kanto #001–151</p>
    </div>
    {active ? <aside ref={preview} className={`pokemon-preview${open ? " is-open" : ""}`} id="pokemon-preview" aria-label={`${active.name} preview`} tabIndex={-1} onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
      <button className="pokemon-preview-close" onClick={close} aria-label="Close Pokémon preview">×</button>
      <div className={`pokemon-preview-art tone-${active.types[0]}`}>
        <span className="pokemon-preview-number">#{String(active.id).padStart(3, "0")}</span>
        <div className="pokemon-preview-stage"><GameSprite id={active.id} alt={active.name} width={240} height={180} /></div>
        <div className="pokemon-preview-name"><span>KANTO · GENERATION I</span><h3>{active.name}</h3><div className="type-tags">{active.types.map((t) => <span key={t} className={`type-tag type-${t}`}>{t}</span>)}</div></div>
      </div>
      <div className="pokemon-preview-info">
        <p className="pokemon-preview-description">{active.isPlayable ? active.description : `${active.name} is a ${active.types.join(" / ")} Pokémon in the Kanto Pokédex.`}</p>
        <div className="pokemon-preview-tags"><span>{active.isPlayable ? "League partner" : "Discovery / evolution"}</span>{active.isStarter ? <span>Starter choice</span> : null}{active.isPlayable ? <span>{active.role}</span> : null}</div>
        <h4>Species base stats</h4>
        <dl className="pokemon-preview-stats">{Object.entries(active.baseStats || {}).map(([key, value]) => <div key={key}><dt>{statNames[key as keyof typeof statNames]}</dt><dd><span className="pokemon-stat-track"><span style={{ width: `${value / 255 * 100}%` }} /></span><b>{value}</b></dd></div>)}</dl>
        {active.baseRunStats ? <p className="pokemon-preview-baseline">Before passives & upgrades: <b>{active.baseRunStats.hp} HP</b> · {active.baseRunStats.armor} armor · {active.baseRunStats.regen} regen</p> : null}
        {passive ? <div className="pokemon-preview-passive"><h4>{passive.name}</h4><p>{passive.description}</p></div> : null}
        {active.moves.length ? <div className="pokemon-preview-kit"><h4>Move kit</h4><div>{active.moves.map((slug) => <a key={slug} href={`/wiki/attacks#${slug}`}>{moves.find((m) => m.slug === slug)?.name}</a>)}</div></div> : null}
        {family.length > 1 ? <div className="pokemon-preview-family"><h4>Evolution family</h4><div>{family.map((p) => <button key={p.id} className={active.id === p.id ? "selected" : ""} onClick={() => { reset(); setActiveId(p.id); }} aria-label={`Preview ${p.name}`}><Image src={p.image} alt="" width={48} height={48} unoptimized /><span>{p.name}</span></button>)}</div></div> : null}
        {active.evolution?.length ? <p className="pokemon-preview-evolution">Next: {active.evolution.map((e) => `${e.name}${e.level ? ` · Lv. ${e.level}` : ""}`).join(" / ")}</p> : null}
        {active.isPlayable ? <details className="pokemon-preview-unlock"><summary>League availability</summary><p>{active.isStarter ? "Choose this Pokémon as your first partner, or complete 2 runs to add it later." : active.unlockCondition}</p></details> : null}
      </div>
    </aside> : null}
  </div>;
}
