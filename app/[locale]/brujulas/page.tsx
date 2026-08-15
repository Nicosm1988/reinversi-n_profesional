import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProcessDetail } from "@/components/processes/process-detail";
import { compassProcess } from "@/lib/data/senda-processes";

type PageProps = { params: Promise<{ locale: string }> };

const COMPASS_PATH = "/brujulas";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "Processes" });
  const localizedPath = isEnglish ? `/en${COMPASS_PATH}` : COMPASS_PATH;

  return {
    title: `${t("items.compass.title")} | Senda`,
    description: t("items.compass.metaDescription"),
    alternates: {
      canonical: localizedPath,
      languages: {
        es: COMPASS_PATH,
        en: `/en${COMPASS_PATH}`,
        "x-default": COMPASS_PATH,
      },
    },
  };
}

export default function BrujulasPage() {
  return <ProcessDetail process={compassProcess} />;
}
