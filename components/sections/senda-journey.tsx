import { Link } from "@/navigation";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  HeartHandshake,
  Route,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DoorsIllustration,
  JourneyIllustration,
  PuzzleIllustration,
  StairIllustration,
  SupportIllustration,
} from "@/components/illustrations";

const moments = [
  { number: "01", key: "pause" },
  { number: "02", key: "change" },
  { number: "03", key: "direction" },
] as const;

const paths = [
  { icon: BriefcaseBusiness, key: "work", tone: "bg-[#e8a17f]" },
  { icon: Brain, key: "identity", tone: "bg-[#a8bd9e]" },
  { icon: GraduationCap, key: "learning", tone: "bg-[#e6c675]" },
  { icon: Compass, key: "purpose", tone: "bg-[#9eb8c2]" },
  { icon: Sparkles, key: "technology", tone: "bg-[#c7a8c9]" },
] as const;

export function SendaJourney() {
  const t = useTranslations("Journey");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[var(--senda-dark)] px-5 pb-16 pt-32 text-[var(--senda-light)] md:px-8 md:pt-40">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_15%,rgba(203,226,190,.22),transparent_25%),radial-gradient(circle_at_82%_72%,rgba(226,164,118,.18),transparent_28%)]" />
        <div className="absolute -bottom-24 left-1/2 h-[540px] w-[180px] -translate-x-1/2 rotate-[9deg] rounded-[50%] border-x border-[#d9c68d]/30 bg-[#d9c68d]/10 blur-[1px]" />
        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-[#f1e8dd]/85">
              <Route aria-hidden="true" className="h-4 w-4" /> {t("hero.eyebrow")}
            </p>
            <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[5.5rem]">
              {t("hero.title")} <span className="text-[var(--senda-accent)]">{t("hero.titleAccent")}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#e7e2d5]/80 md:text-xl">
              {t("hero.description")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#donde-estoy" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-accent)] px-7 font-semibold text-[#242a38] hover:bg-[var(--senda-accent-soft)]">
                {t("hero.primaryCta")} <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/diagnostico/ancla-de-carrera" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-semibold text-white hover:bg-white/10">
                {t("hero.secondaryCta")}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute inset-6 rounded-[38px] border border-white/10 bg-white/6" />
            <div className="relative overflow-hidden rounded-[36px] border border-[#d7c3ae] bg-[#f6efe7] p-4 shadow-[0_30px_80px_-40px_rgba(16,21,33,.9)]">
              <JourneyIllustration className="rounded-[28px]" />
            </div>
          </div>
        </div>
      </section>

      <section id="donde-estoy" className="relative px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-[var(--senda-accent-dark)]">{t("moments.eyebrow")}</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-[-.035em] md:text-6xl">{t("moments.title")}</h2>
            <p className="max-w-xl text-lg leading-8 text-[var(--senda-muted)]">{t("moments.description")}</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div data-cursor-glow className="overflow-hidden rounded-[2rem] border border-[var(--senda-border)] bg-[var(--senda-card)] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
              <PuzzleIllustration className="rounded-[1.5rem]" />
            </div>
            {moments.map((moment) => (
              <article data-cursor-glow key={moment.number} className="group rounded-[2rem] border border-[#2f3647]/12 bg-[var(--senda-card)] p-7 transition-transform hover:-translate-y-1">
                <span className="text-sm font-bold text-[var(--senda-accent-dark)]">{moment.number}</span>
                <h3 className="mt-10 font-heading text-2xl font-semibold">{t(`moments.items.${moment.key}.title`)}</h3>
                <p className="mt-3 leading-7 text-[var(--senda-muted)]">{t(`moments.items.${moment.key}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cruce-de-caminos" className="relative bg-[var(--senda-section)] px-5 py-24 md:px-8 md:py-32">
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#2f3647]/12" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[var(--senda-accent-dark)]">{t("paths.eyebrow")}</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">{t("paths.title")}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--senda-muted)]">{t("paths.description")}</p>
          </div>
          <div data-cursor-glow className="mx-auto mt-12 max-w-[460px] overflow-hidden rounded-[2rem] border border-[var(--senda-border)] bg-[var(--senda-card)] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
            <DoorsIllustration className="rounded-[1.5rem]" />
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {paths.map(({ icon: Icon, key, tone }) => (
              <article data-cursor-glow key={key} className="rounded-[1.75rem] border border-[#2f3647]/10 bg-[var(--senda-card)] p-5 shadow-[0_18px_45px_-34px_rgba(32,55,47,.45)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon aria-hidden="true" className="h-6 w-6" /></div>
                <h3 className="mt-7 font-heading text-xl font-semibold">{t(`paths.items.${key}.title`)}</h3>
                <p className="mt-3 text-[13.5px] leading-5 text-[var(--senda-muted)]">{t(`paths.items.${key}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div data-cursor-glow className="overflow-hidden rounded-[2.5rem] border border-[var(--senda-border)] bg-[var(--senda-card)] p-4 shadow-[0_24px_55px_-38px_rgba(47,54,71,.6)]">
            <StairIllustration className="rounded-[2rem]" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[.22em] text-[var(--senda-accent-dark)]">{t("tool.eyebrow")}</p>
            <h2 className="mt-5 font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">{t("tool.title")}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--senda-muted)]">{t("tool.description")}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--senda-muted)]">
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">{t("tool.duration")}</span>
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">{t("tool.result")}</span>
              <span className="rounded-full border border-[#2f3647]/15 px-4 py-2">{t("tool.disclaimer")}</span>
            </div>
            <Link href="/diagnostico/ancla-de-carrera" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2f3647] px-7 font-semibold text-white hover:bg-[var(--senda-dark-hover)]">
              {t("tool.cta")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--senda-section-warm)] px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.7fr_1fr_1fr] lg:items-center">
          <div data-cursor-glow className="overflow-hidden rounded-[2rem] border border-[#d7c3ae] bg-[var(--senda-card)] p-3 shadow-[0_20px_45px_-35px_rgba(47,54,71,.55)]">
            <SupportIllustration className="rounded-[1.5rem]" />
          </div>
          <div>
            <HeartHandshake aria-hidden="true" className="h-10 w-10 text-[#7b452e] dark:text-[#e8a17f]" />
            <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-[-.035em] md:text-6xl">{t("support.title")}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[var(--senda-muted)]">{t("support.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f3647] px-7 font-semibold text-white hover:bg-[var(--senda-dark-hover)]">{t("support.contactCta")}</Link>
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#2f3647]/25 px-7 font-semibold text-[var(--senda-ink)] hover:bg-white/20"><BookOpen aria-hidden="true" className="h-4 w-4" /> {t("support.resourcesCta")}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
