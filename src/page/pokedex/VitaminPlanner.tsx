"use client";
import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import vitamins from "@/data/wiki/vitamins.json";

const key = "pokebonk-wiki:vitamin-plans:v1";
const event = "pokebonk-wiki:vitamin-plans";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(event, callback); };
}
function snapshot() { try { return localStorage.getItem(key) || "{}"; } catch { return "{}"; } }
const serverSnapshot = () => "{}";
type Choice = { slug: string; name: string; image: string; label: string; why: string };

export default function VitaminPlanner({ partner, name, choices }: { partner: string; name: string; choices: Choice[] }) {
  const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [temporary, setTemporary] = useState<string | null>(null);
  const raw = temporary ?? stored;
  const [warning, setWarning] = useState(false);
  const plans: Record<string, string[]> = {};
  try {
    const value = JSON.parse(raw);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [slug, picks] of Object.entries(value)) {
        if (Array.isArray(picks)) plans[slug] = [...new Set(picks.filter((p): p is string => typeof p === "string" && vitamins.some(v => v.slug === p)))].slice(0, 3);
      }
    }
  } catch { /* Invalid local data is treated as an empty plan. */ }
  const chosen = plans[partner] || [];
  function save(next: string[]) {
    const nextRaw = JSON.stringify({ ...plans, [partner]: next });
    try { localStorage.setItem(key, nextRaw); setTemporary(null); setWarning(false); } catch { setTemporary(nextRaw); setWarning(true); }
    window.dispatchEvent(new Event(event));
  }
  return <div className="pokemon-vitamin-planner">
    <header><h3>{name} family vitamin plan</h3><span role="status">{chosen.length} / 3 base slots</span></header>
    <p>Your saved selections are shared with the Vitamins page and every form in this family. This does not change your game account.</p>
    <div className="pokemon-build-picks">{choices.map(v => {
      const included = chosen.includes(v.slug);
      return <article key={v.slug}><a href={`/wiki/vitamins?partner=${partner}#${v.slug}`}><Image src={v.image} width={36} height={36} alt="" unoptimized /><strong>{v.name} ↗</strong></a><small>{v.label}</small><p>{v.why}</p><button type="button" aria-pressed={included} disabled={!included && chosen.length >= 3} onClick={() => save(included ? chosen.filter(s => s !== v.slug) : [...chosen, v.slug])}>{included ? `Remove ${v.name}` : `Add ${v.name}`}</button></article>;
    })}</div>
    <div className="pokemon-plan-selected" aria-label="Saved vitamins">{chosen.length ? chosen.map(slug => <button type="button" key={slug} onClick={() => save(chosen.filter(s => s !== slug))} aria-label={`Remove ${vitamins.find(v => v.slug === slug)?.name} from plan`}>{vitamins.find(v => v.slug === slug)?.name} ×</button>) : <span>No vitamins selected yet.</span>}</div>
    <p role="status">{warning ? "Browser storage is unavailable. These selections will last until you leave this page." : "Saved in this browser. Remove a vitamin to free a slot."}</p>
    <a href={`/wiki/vitamins?partner=${partner}#${choices[0].slug}`}>Compare all 26 vitamins and edit this plan →</a>
  </div>;
}
