import { notFound, permanentRedirect } from "next/navigation";
import { getTransitionService } from "@/lib/data/senda-processes";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export default async function LegacyJourneyDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const prefix = locale === "en" ? "/en" : "";

  if (slug === "brujula" || slug === "brujulas") {
    permanentRedirect(`${prefix}/brujulas`);
  }
  if (slug === "nueva-etapa-profesional") {
    permanentRedirect(`${prefix}/transiciones-laborales`);
  }
  if (getTransitionService(slug)) {
    permanentRedirect(`${prefix}/transiciones-laborales/${slug}`);
  }
  notFound();
}
