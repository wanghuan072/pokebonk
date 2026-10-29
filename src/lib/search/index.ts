import events from "@/data/events/events.json";
import buildRoutes from "@/data/builds/routes.json";
import { pokemon } from "@/lib/data/pokedex";
import { attacks, catalogItems, vitamins, achievements, lab } from "@/lib/data/wiki";
import { guides, releases } from "@/lib/data/editorial";
import type { SearchEntry } from "@/types/wiki";
import { contentPath } from "@/lib/content-path";
export const searchIndex: SearchEntry[] = [
  ...events.map(e=>({name:e.name,href:`/events#${e.slug}`,category:"Seasonal event"})),
  {name:"Season 2 Leaderboard",href:"/wiki/leaderboard",category:"Wiki"},
  ...pokemon.map((p) => ({
    name: p.name,
    href: contentPath("/pokedex", p),
    category: "Pokédex",
  })),
  ...attacks.map((m) => ({
    name: m.name,
    href: contentPath("/wiki/attacks", m),
    category: "Attack",
  })),
  ...[...catalogItems, ...vitamins].map((i) => ({
    name: i.name,
    href: contentPath(i.kind==='vitamin'?'/wiki/vitamins':'/wiki/items', i),
    category: i.kind==='vitamin'?'Vitamin':'Item',
  })),
  ...buildRoutes.map((route) => ({
    name: route.title,
    href: `/builds#${route.id}`,
    category: "Build",
  })),
  ...guides.map((g) => ({
    name: g.title,
    href: `/guides/${g.slug}`,
    category: "Guide",
  })),
  ...achievements.map((a) => ({
    name: a.name,
    href: `/wiki/achievements#achievement-${a.id}`,
    category: "Achievement",
  })),
  ...lab.map((u) => ({
    name: u.name,
    href: `/wiki/lab#lab-${u.id}`,
    category: "Lab upgrade",
  })),
  ...releases.map((r) => ({
    name: `PokeBonk v${r.version} Patch Notes`,
    href: contentPath("/updates", r),
    category: "Update",
  })),
];
