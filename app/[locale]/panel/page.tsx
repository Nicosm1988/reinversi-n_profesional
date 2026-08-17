import { Link } from "@/navigation";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Compass, UserRound } from "lucide-react";
import { z } from "zod";
import { Container } from "@/components/layout/container";
import { ProfileForm, type PersonalProfile } from "@/components/profile/profile-form";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { UniverseField } from "@/components/visual/universe-field";

const savedResultSchema = z.object({
  dominant_result: z.object({ name: z.string(), score: z.number().optional() }),
  ai_feedback: z.object({
    title: z.string(),
    summary: z.string(),
    strategicQuestion: z.string().optional(),
  }),
  updated_at: z.string(),
});

type PanelPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PanelPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Panel" });

  return { title: t("metadataTitle"), robots: { index: false, follow: false } };
}

export default async function PersonalPanelPage({ params }: PanelPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Panel" });
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
      <UniverseField compact className="left-[42%] text-[#6b3fa0] opacity-[0.08] dark:text-[#9b7fd1] dark:opacity-10" />
      <Container className="relative z-10 max-w-5xl">
        <div id="resumen" className="mb-10 max-w-3xl scroll-mt-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-secondary">
            <UserRound aria-hidden="true" className="h-4 w-4" />
            {t("eyebrow")}
          </div>
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("description")}</p>
        </div>

        <div className="space-y-8">
          <section id="resultado" className="scroll-mt-28 rounded-[28px] border bg-card p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <Compass aria-hidden="true" className="h-5 w-5" />
                  {t("latestResult")}
                </div>
                {savedResult ? (
                  <>
                    <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">{savedResult.ai_feedback.title}</h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">{savedResult.ai_feedback.summary}</p>
                    <div className="mt-6 rounded-2xl border bg-background p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{t("primaryAnchor")}</p>
                      <p className="mt-2 font-heading text-xl font-semibold text-foreground">{savedResult.dominant_result.name}</p>
                      {savedResult.ai_feedback.strategicQuestion && <p className="mt-3 italic text-muted-foreground">“{savedResult.ai_feedback.strategicQuestion}”</p>}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {t("updatedAt", {
                        date: new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
                          dateStyle: "long",
                        }).format(new Date(savedResult.updated_at)),
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">{t("emptyTitle")}</h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{t("emptyDescription")}</p>
                  </>
                )}
              </div>
              <Link href="/test-anclas-de-carrera" className="inline-flex flex-none items-center gap-2 rounded-full bg-[#cc148c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#a80e70]">
                {savedResult ? t("viewFullResult") : t("startTest")}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
