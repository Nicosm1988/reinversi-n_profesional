import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = [
  "",
  "/contacto",
  "/diagnostico",
  "/procesos/brujula",
  "/procesos/nueva-etapa-profesional",
  "/privacidad",
  "/terminos",
  "/quienes-somos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return routes.flatMap((route) =>
    (["es", "en"] as const).map((locale) => {
      const localePrefix = locale === "en" ? "/en" : "";
      const spanishUrl = `${baseUrl}${route}`;
      const englishUrl = `${baseUrl}/en${route}`;

      return {
        url: `${baseUrl}${localePrefix}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
        priority: route === "" ? 1 : 0.7,
        alternates: {
          languages: {
            es: spanishUrl,
            en: englishUrl,
          },
        },
      };
    }),
  );
}
