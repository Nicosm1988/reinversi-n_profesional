import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Compass, UserRound } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ProfileForm, type PersonalProfile } from "@/components/profile/profile-form";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

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
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-secondary"><UserRound className="h-4 w-4" />Tu espacio personal</div>
          <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">Mi recorrido</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Administrá tus datos y volvé a las herramientas que ya forman parte de tu camino.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <section className="rounded-[28px] border bg-card p-6 shadow-sm md:p-10">
            <ProfileForm initialProfile={profile} />
          </section>
          <aside className="space-y-4">
            <Link href="/diagnostico/ancla-de-carrera" className="group block rounded-2xl border bg-card p-6 shadow-sm hover:border-secondary/50">
              <Compass className="h-6 w-6 text-secondary" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">Ancla de carrera</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Empezá el test o volvé a consultar el resultado que guardaste.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">Abrir diagnóstico <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </aside>
        </div>
      </Container>
    </div>
  );
}
