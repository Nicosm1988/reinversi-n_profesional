import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = [
  "",
  "/recorridos",
  "/recorridos/brujula",
  "/recorridos/nueva-etapa-profesional",
  "/como-trabajamos",
  "/equipo",
  "/laboratorio-nuevas-narrativas",
  "/preguntas-frecuentes",
  "/contacto",
  "/diagnostico",
  "/privacidad",
  "/terminos",
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
