import type { MetadataRoute } from "next";
import manifest from "../../public/seo-manifest.json";
export default function sitemap(): MetadataRoute.Sitemap {
 const entries=manifest.entries as {indexable:boolean;canonicalUrl:string;lastModified:string}[];
 return entries.filter(entry=>entry.indexable).map(entry=>({url:entry.canonicalUrl,lastModified:entry.lastModified.slice(0,10)}));
}
