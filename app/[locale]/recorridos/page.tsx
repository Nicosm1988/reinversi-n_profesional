import { permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegacyRecorridosPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/transiciones-laborales" : "/transiciones-laborales");
}
