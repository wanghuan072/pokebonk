import EntryDetailPage, { entryMetadata } from "@/page/wiki/EntryDetailPage";
import { items } from "@/lib/data/wiki";
// Cache Components requires a non-empty parameter set; disabled records render 404.
export function generateStaticParams() {
  return items.map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return entryMetadata("items", (await params).slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <EntryDetailPage kind="items" slug={(await params).slug} />;
}
