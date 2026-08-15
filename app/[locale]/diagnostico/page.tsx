import { permanentRedirect } from "next/navigation";

type PageProps = Readonly<{ params: Promise<{ locale: string }> }>;

export default async function LegacyInitialDiagnosticPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/encontrar-mi-recorrido" : "/encontrar-mi-recorrido");
}
