import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
  };
}

export default function ContactLayout({ children }: LayoutProps) {
  return children;
}
