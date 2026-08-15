import { permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegacyLaboratorioNuevasNarrativasPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(
    locale === "en"
      ? "/en/laboratorio-narrativas-laborales-alternativas"
      : "/laboratorio-narrativas-laborales-alternativas",
  );
}
