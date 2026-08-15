import { getTransitionService } from "@/lib/data/senda-processes";
import { notFound, permanentRedirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export default async function LegacyProcessPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const prefix = locale === "en" ? "/en" : "";

  if (["orientacion-vocacional", "brujula", "brujulas"].includes(slug)) {
    permanentRedirect(`${prefix}/brujulas`);
  }
  if (["reinvencion-profesional", "transicion-laboral", "nueva-etapa-profesional"].includes(slug)) {
    permanentRedirect(`${prefix}/transiciones-laborales`);
  }
  if (getTransitionService(slug)) {
    permanentRedirect(`${prefix}/transiciones-laborales/${slug}`);
  }
  notFound();
}
