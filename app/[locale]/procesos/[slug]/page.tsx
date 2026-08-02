import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProcessDetail } from "@/components/processes/process-detail";
import { getSendaProcess } from "@/lib/data/senda-processes";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const process = getSendaProcess(slug);
  if (!process) return {};

  const t = await getTranslations({ locale, namespace: "Processes" });
  return {
    title: `${t(`items.${process.key}.title`)} | Senda`,
    description: t(`items.${process.key}.metaDescription`),
  };
}

export default async function ProcessPage({ params }: PageProps) {
  const { slug } = await params;
  const process = getSendaProcess(slug);
  if (!process) notFound();

  return <ProcessDetail process={process} />;
}
