import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NarrativesLabPage } from "@/components/pages/narratives-lab-page";

type PageProps = { params: Promise<{ locale: string }> };

const LAB_PATH = "/laboratorio-nuevas-narrativas";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "NarrativesLab" });
  const title = `${t("meta.title")} | Senda`;
  const description = t("meta.description");
  const localizedPath = isEnglish ? `/en${LAB_PATH}` : LAB_PATH;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        es: LAB_PATH,
        en: `/en${LAB_PATH}`,
        "x-default": LAB_PATH,
      },
    },
    openGraph: {
      type: "website",
      locale: isEnglish ? "en_US" : "es_AR",
      alternateLocale: isEnglish ? ["es_AR"] : ["en_US"],
      siteName: "Senda",
      title,
      description,
      url: localizedPath,
    },
  };
}

export default function LaboratorioNuevasNarrativasPage() {
  return <NarrativesLabPage />;
}
