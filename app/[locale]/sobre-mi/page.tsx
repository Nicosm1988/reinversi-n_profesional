import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutMePage } from "@/components/pages/about-me-page";

type PageProps = { params: Promise<{ locale: string }> };

const ABOUT_ME_PATH = "/sobre-mi";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "AboutMe" });
  const title = `${t("meta.title")} | Senda`;
  const description = t("meta.description");
  const localizedPath = isEnglish ? `/en${ABOUT_ME_PATH}` : ABOUT_ME_PATH;

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: localizedPath,
      languages: {
        es: ABOUT_ME_PATH,
        en: `/en${ABOUT_ME_PATH}`,
        "x-default": ABOUT_ME_PATH,
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

export default function SobreMiPage() {
  return <AboutMePage />;
}
