import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MethodologyPage } from "@/components/pages/methodology-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Methodology" });
  const path = "/como-trabajamos";
  const localizedPath = locale === "en" ? `/en${path}` : path;

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
    alternates: {
      canonical: localizedPath,
      languages: { es: path, en: `/en${path}`, "x-default": path },
    },
  };
}

export default function ComoTrabajamosPage() {
  return <MethodologyPage />;
}
