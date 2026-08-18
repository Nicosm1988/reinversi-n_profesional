import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqPage } from "@/components/pages/faq-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  const path = "/preguntas-frecuentes";
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

const FAQ_QUESTION_KEYS = ["choose", "compass", "newStage", "format", "duration", "diagnostic", "results"] as const;

export default async function PreguntasFrecuentesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_QUESTION_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqPage />
    </>
  );
}
