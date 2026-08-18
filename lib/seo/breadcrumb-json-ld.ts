import { getSiteUrl } from "@/lib/site-url";

type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[], locale: string) {
  const siteUrl = getSiteUrl();
  const prefix = locale === "en" ? "/en" : "";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${prefix}${item.path}`,
    })),
  };
}
