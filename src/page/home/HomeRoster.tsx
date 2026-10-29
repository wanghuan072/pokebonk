"use client";
import { useState } from "react";
import Image from "next/image";
type Partner = { id: number; slug: string; name: string; image: string; isPlayable: boolean; isStarter: boolean };
export default function HomeRoster({ pokemon, featuredIds }: { pokemon: Partner[]; featuredIds: number[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const term = query.trim().replace(/^#/, "").toLowerCase();
  const pool = term ? pokemon : featuredIds.map((id) => pokemon.find((p) => p.id === id)!);
  const shown = pool.filter((p) => (!term || p.name.toLowerCase().includes(term) || String(p.id).padStart(3, "0").includes(term)) && (view !== "league" || p.isPlayable) && (view !== "starters" || p.isStarter)).slice(0, 32);
  return <>
    <div className="home-roster-controls"><label><span className="home-roster-label">Find a Pokémon</span><input type="search" placeholder="Search Pokémon or number…" value={query} onChange={(e) => setQuery(e.target.value)} /></label><div role="group" aria-label="Home roster filter">{[["all", "All"], ["league", "League"], ["starters", "Starters"]].map(([value, label]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>{label}</button>)}</div></div>
    <div className="home-pokemon-grid">{shown.map((p) => <a key={p.id} href={`/pokedex#${p.slug}`} title={`Inspect ${p.name}`}><Image src={p.image} width={40} height={40} alt={p.name} unoptimized /><span><small>{String(p.id).padStart(3, "0")}</small>{p.name}</span></a>)}</div>
    {!shown.length ? <div className="home-roster-empty"><p>No Pokémon match these filters.</p><button onClick={() => { setQuery(""); setView("all"); }}>Clear filters</button></div> : null}
    <div className="home-panel-foot"><span role="status">{term ? `${shown.length} results` : `${shown.length} featured Pokémon`}</span><a href="/pokedex">Types, kits & evolutions →</a></div>
  </>;
}
