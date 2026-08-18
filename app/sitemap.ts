import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = [
  "",
  "/transiciones-laborales",
  "/transiciones-laborales/explorar-direccion",
  "/transiciones-laborales/cambiar-empleo",
  "/transiciones-laborales/proyecto-propio",
  "/transiciones-laborales/liderazgo-empresa",
  "/transiciones-laborales/desafio-puntual",
  "/transiciones-laborales/elegir-formacion",
  "/brujulas",
  "/como-trabajamos",
  "/sobre-mi",
  "/test-anclas-de-carrera",
  "/encontrar-mi-recorrido",
  "/laboratorio-narrativas-laborales-alternativas",
  "/preguntas-frecuentes",
  "/contacto",
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
            "x-default": spanishUrl,
          },
        },
      };
    }),
  );
}
