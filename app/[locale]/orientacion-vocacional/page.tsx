import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProcessDetail } from "@/components/processes/process-detail";
import { getSendaProcess } from "@/lib/data/senda-processes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Processes");
  return {
    title: `${t("items.orientation.title")} | Senda`,
    description: t("items.orientation.metaDescription"),
  };
}

export default function OrientacionVocacionalPage() {
  const process = getSendaProcess("orientacion-vocacional");
  if (!process) return null;
  return <ProcessDetail process={process} />;
}
