import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

const CONTACT_PATH = "/contacto";

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const localizedPath = locale === "en" ? `/en${CONTACT_PATH}` : CONTACT_PATH;

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
    alternates: {
      canonical: localizedPath,
      languages: {
        es: CONTACT_PATH,
        en: `/en${CONTACT_PATH}`,
        "x-default": CONTACT_PATH,
      },
    },
  };
}

export default function ContactLayout({ children }: LayoutProps) {
  return children;
}
