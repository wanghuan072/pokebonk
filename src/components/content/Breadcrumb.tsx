import { site } from "@/config/site";
export default function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const list = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          {list.map((item, i) => (
            <li key={item.label}>
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: list.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.label,
              ...(item.href ? { item: site.url + item.href } : {}),
            })),
          }).replace(/</g, "\u003c"),
        }}
      />
    </>
  );
}
