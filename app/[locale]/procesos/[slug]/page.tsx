import { getSendaProcess } from "@/lib/data/senda-processes";
import { notFound, permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export default async function LegacyProcessPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!getSendaProcess(slug)) notFound();

  permanentRedirect(locale === "en" ? `/en/recorridos/${slug}` : `/recorridos/${slug}`);
}
