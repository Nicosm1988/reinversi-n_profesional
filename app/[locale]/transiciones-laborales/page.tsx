import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TransitionsPage } from "@/components/pages/journeys-page";

type PageProps = { params: Promise<{ locale: string }> };

const TRANSITIONS_PATH = "/transiciones-laborales";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "Journeys" });
  const localizedPath = isEnglish ? `/en${TRANSITIONS_PATH}` : TRANSITIONS_PATH;

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
    alternates: {
      canonical: localizedPath,
      languages: {
        es: TRANSITIONS_PATH,
        en: `/en${TRANSITIONS_PATH}`,
        "x-default": TRANSITIONS_PATH,
      },
    },
  };
}

export default function TransicionesLaboralesPage() {
  return <TransitionsPage />;
}
