import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JourneysPage } from "@/components/pages/journeys-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Journeys" });

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
  };
}

export default function RecorridosPage() {
  return <JourneysPage />;
}
