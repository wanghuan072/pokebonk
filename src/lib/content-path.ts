export function contentPath(
  collection: string,
  entry: { slug: string; isDetails?: boolean },
) {
  return entry.isDetails
    ? `${collection}/${entry.slug}`
    : `${collection}#${entry.slug}`;
}
