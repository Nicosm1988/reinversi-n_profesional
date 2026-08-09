import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(
  props: Readonly<{ params: Promise<{ locale: string }> }>,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "CareerAnchorIntro" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: { index: true, follow: true },
  };
}

export default function CareerAnchorIntroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
