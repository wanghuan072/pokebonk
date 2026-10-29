import type { Metadata } from "next";
import tdk from "./tdk";
import { site } from "@/config/site";
import { getPageModified } from "./history";
type Seo = { title: string; description: string; keywords?: string[] };
// Three-argument form remains available to the currently disabled detail templates.
export function pageMetadata(
  pathOrTitle: string,
  seoOrDescription?: Seo | string,
  legacyPath?: string,
): Metadata {
  const path = legacyPath || pathOrTitle;
  const seo: Seo =
    typeof seoOrDescription === "string"
      ? { title: pathOrTitle, description: seoOrDescription }
      : seoOrDescription || tdk[path];
  if (!seo) throw new Error(`Missing page metadata: ${path}`);
  const url = new URL(path, site.url).href;
  const image = {
    url: site.url + "/images/og-image.png",
    width: 1200,
    height: 630,
    alt: "pokebonkdb.org — Pokémon, builds, move fusions and game guides",
  };
  const article = path.startsWith("/guides/");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    robots: { index: site.configured, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: site.name,
      locale: "en_US",
      images: [image],
      ...(article
        ? { type: "article" as const, modifiedTime: getPageModified(path) }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image.url],
    },
  };
}
