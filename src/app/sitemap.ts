import type { MetadataRoute } from "next";
import tdk from "@/seo/tdk";
import { getPageModified } from "@/seo/history";
import { site } from "@/config/site";
import { pokemon } from "@/lib/data/pokedex";
import { attacks, catalogItems, vitamins } from "@/lib/data/wiki";
import { guides, releases } from "@/lib/data/editorial";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...Object.keys(tdk),
    ...pokemon.filter((p) => p.isDetails).map((p) => "/pokedex/" + p.slug),
    ...attacks.filter((m) => m.isDetails).map((m) => "/wiki/attacks/" + m.slug),
    ...catalogItems.filter((i) => i.isDetails).map((i) => "/wiki/items/" + i.slug),
    ...vitamins.filter((i) => i.isDetails).map((i) => "/wiki/vitamins/" + i.slug),
    ...guides.filter((g) => g.isDetails).map((g) => "/guides/" + g.slug),
    ...releases.filter((r) => r.isDetails).map((r) => "/updates/" + r.slug),
  ];
  return [...new Set(paths)].map((path) => ({
    url: new URL(path, site.url).href,
    lastModified: getPageModified(path),
  }));
}
