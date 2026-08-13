import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeamPage } from "@/components/pages/team-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Team" });

  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
  };
}

export default function EquipoPage() {
  return <TeamPage />;
}
