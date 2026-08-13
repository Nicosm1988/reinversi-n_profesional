import { permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegacyCompassPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/procesos/brujula" : "/procesos/brujula");
}
