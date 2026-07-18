import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Compass, UserRound } from "lucide-react";
import { z } from "zod";
import { Container } from "@/components/layout/container";
import { ProfileForm, type PersonalProfile } from "@/components/profile/profile-form";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { canRepeatCareerAnchorTest } from "@/lib/diagnostics/access";

const savedResultSchema = z.object({
  dominant_result: z.object({ name: z.string(), score: z.number().optional() }),
  ai_feedback: z.object({
    title: z.string(),
    summary: z.string(),
    strategicQuestion: z.string().optional(),
  }),
  updated_at: z.string(),
});

export const metadata = { title: "Mi recorrido | Senda" };

export default async function PersonalPanelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    const panelPath = locale === "en" ? "/en/panel" : "/panel";
    redirect(`${locale === "en" ? "/en/login" : "/login"}?next=${encodeURIComponent(panelPath)}`);
  }

  const { data } = await auth.supabase
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, country_code, timezone, avatar_url")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { data: diagnosticData } = await auth.supabase
    .from("user_diagnostics")
    .select("dominant_result, ai_feedback, updated_at")
    .eq("diagnostic_type", "career_anchor")
    .eq("status", "completed")
    .maybeSingle();
  const parsedResult = savedResultSchema.safeParse(diagnosticData);
  const savedResult = parsedResult.success ? parsedResult.data : null;
  const canRepeat = canRepeatCareerAnchorTest(auth.user.email);

  const metadata = auth.user.user_metadata ?? {};
  const profile: PersonalProfile = {
    id: auth.user.id,
    email: data?.email ?? auth.user.email ?? "",
    fullName: data?.full_name ?? metadata.full_name ?? metadata.name ?? "",
    firstName: data?.first_name ?? metadata.first_name ?? "",
    lastName: data?.last_name ?? metadata.last_name ?? "",
    countryCode: data?.country_code ?? "",
    timezone: data?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    avatarUrl: data?.avatar_url ?? metadata.avatar_url ?? null,
  };

  return (
    <div className="wati-page-shell min-h-screen pb-20 pt-28 md:pt-32">
      <Container className="relative z-10 max-w-5xl">
        <div id="resumen" className="mb-10 max-w-3xl scroll-mt-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-secondary"><UserRound className="h-4 w-4" />Tu espacio personal</div>
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">Mi recorrido</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Administrá tus datos y volvé a las herramientas que ya forman parte de tu camino.</p>
        </div>

        <div className="space-y-8">
          <section id="resultado" className="scroll-mt-28 rounded-[28px] border bg-card p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary"><Compass className="h-5 w-5" />Tu último resultado</div>
                {savedResult ? (
                  <>
                    <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">{savedResult.ai_feedback.title}</h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">{savedResult.ai_feedback.summary}</p>
                    <div className="mt-6 rounded-2xl border bg-background p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Ancla principal</p>
                      <p className="mt-2 font-heading text-xl font-semibold text-foreground">{savedResult.dominant_result.name}</p>
                      {savedResult.ai_feedback.strategicQuestion && <p className="mt-3 italic text-muted-foreground">“{savedResult.ai_feedback.strategicQuestion}”</p>}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Actualizado el {new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(savedResult.updated_at))}.</p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">Todavía no hay un resultado guardado</h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Cuando completes el test de Anclas de Carrera, vas a encontrar acá tu última lectura.</p>
                  </>
                )}
              </div>
              <Link href="/diagnostico/ancla-de-carrera" className="inline-flex flex-none items-center gap-2 rounded-full bg-[#e47c56] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d86f49]">
                {savedResult && canRepeat ? "Repetir test" : savedResult ? "Ver resultado completo" : "Comenzar test"}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section id="perfil" className="scroll-mt-28 rounded-[28px] border bg-card p-6 shadow-sm md:p-10">
            <ProfileForm initialProfile={profile} />
          </section>
        </div>
      </Container>
    </div>
  );
}
