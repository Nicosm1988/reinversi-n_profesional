import type { MetadataRoute } from "next";

const routes = [
  "",
  "/contacto",
  "/diagnostico",
  "/orientacion-vocacional",
  "/terapia",
  "/servicios/ingles-profesional",
  "/privacidad",
  "/terminos",
  "/quienes-somos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://reinvension-profesional.vercel.app";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7,
  }));
}
