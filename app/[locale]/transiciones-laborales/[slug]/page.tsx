import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProcessDetail } from "@/components/processes/process-detail";
import { getTransitionService } from "@/lib/data/senda-processes";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumb-json-ld";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const process = getTransitionService(slug);
  if (!process) return {};

  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "Processes" });
  const path = `/transiciones-laborales/${process.slug}`;
  const localizedPath = isEnglish ? `/en${path}` : path;

  return {
    title: `${t(`items.${process.key}.title`)} | Senda`,
    description: t(`items.${process.key}.metaDescription`),
    alternates: {
      canonical: localizedPath,
      languages: {
        es: path,
        en: `/en${path}`,
        "x-default": path,
      },
    },
  };
}

export default async function TransitionServicePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const process = getTransitionService(slug);
  if (!process) notFound();

  const [header, processes] = await Promise.all([
    getTranslations({ locale, namespace: "Header" }),
    getTranslations({ locale, namespace: "Processes" }),
  ]);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: header("navHome"), path: "" },
      { name: header("navTransitions"), path: "/transiciones-laborales" },
      { name: processes(`items.${process.key}.title`), path: `/transiciones-laborales/${process.slug}` },
    ],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProcessDetail process={process} />
    </>
  );
}
