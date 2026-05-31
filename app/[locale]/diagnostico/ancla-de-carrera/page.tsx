import { CareerQuiz } from "@/components/sections/career-quiz";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Test de Anclas de Carrera | Reinvención Profesional",
    description: "Descubrí tu ancla de carrera con el modelo de Edgar Schein. Un diagnóstico gratuito para orientar tu reinvención profesional con claridad estratégica.",
};

export default async function AnclaDeCarreraPage(
  props: Readonly<{
    params: Promise<{ locale: string }>;
  }>,
) {
  const { locale } = await props.params;
  const nextPath = locale === "en" ? "/en/diagnostico/ancla-de-carrera" : "/diagnostico/ancla-de-carrera";
  const loginPath = locale === "en" ? "/en/login" : "/login";
  const auth = await getAuthenticatedUser();

  if (!auth.ok) {
    redirect(`${loginPath}?next=${encodeURIComponent(nextPath)}&reason=${auth.reason}`);
  }

  return <CareerQuiz userEmail={auth.user.email ?? null} />;
}
