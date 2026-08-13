import { ArrowRight, MoveDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { sendaProcesses } from "@/lib/data/senda-processes";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

const situationJourneys = ["compass", "newStage"] as const;
const situationPoints = ["point1", "point2", "point3", "point4"] as const;
const methodSteps = ["listen", "map", "define", "move"] as const;
const teamItems = ["multidisciplinary", "human", "rigor"] as const;
const faqs = ["choose", "compass", "newStage", "format", "duration", "diagnostic", "results"] as const;

function RouteMap() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[31rem]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 400" fill="none">
        <ellipse cx="250" cy="200" rx="212" ry="112" className="stroke-white/20" />
        <ellipse cx="250" cy="200" rx="156" ry="176" className="stroke-white/12" transform="rotate(38 250 200)" />
        <path d="M48 294C136 244 177 310 264 225c66-64 117-71 190-121" className="stroke-[#d2b879]/45" />
        <path d="M65 330C161 273 207 344 303 253c58-55 102-65 154-97" className="stroke-white/12" strokeDasharray="4 9" />
        <circle cx="125" cy="276" r="6" className="fill-[#cf8a70]" />
        <circle cx="264" cy="225" r="8" className="fill-[#d2b879]" />
        <circle cx="407" cy="135" r="5" className="fill-[#89a9bd]" />
      </svg>
      <span className="absolute left-[18%] top-[64%] text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">01 · 34°36&apos;S</span>
      <span className="absolute right-[8%] top-[26%] text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">02 · 58°22&apos;W</span>
    </div>
  );
}

export function SendaHome() {
  const t = useTranslations("Home");
  const processT = useTranslations("Processes");

  return (
    <div className="senda-home overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <section className="senda-night border-b border-white/10 px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-28 xl:px-20">
        <UniverseField className="left-[28%] text-[#89a9bd] opacity-20" />
        <div className="relative mx-auto grid w-full max-w-[1240px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="senda-coordinate-label text-[#d2b879]">{t("hero.eyebrow")}</p>
            <h1 className="mt-7 max-w-[14ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#f7f3eb]">
              {t("hero.title")}
            </h1>
            <div className="mt-7 max-w-2xl border-l border-[#cf8a70]/70 pl-5 sm:pl-7">
              <p className="whitespace-pre-line text-base leading-7 text-[#f7f3eb]/90 sm:text-lg sm:leading-8">{t("hero.rhythm")}</p>
              <p className="mt-4 text-base leading-7 text-[#cbd4da] sm:text-lg">{t("hero.description")}</p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5f1e8] px-7 py-3 text-sm font-bold text-[#17263a] shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101c2c]">
                {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/#procesos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/[0.04] px-7 py-3 text-sm font-bold text-[#f5f1e8] backdrop-blur-sm transition-colors hover:border-white/55 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t("hero.secondaryCta")} <MoveDown className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <RouteMap />
        </div>
      </section>

      <section id="procesos" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("journeys.eyebrow")}</p>
              <h2 className="mt-4 max-w-[14ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("journeys.title")}</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg lg:justify-self-end">{t("journeys.intro")}</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {sendaProcesses.map((process) => (
              <article key={process.slug} data-cursor-glow className="senda-process-card senda-editorial-card group relative flex min-h-[23rem] flex-col overflow-hidden rounded-[1.35rem] p-7 sm:p-9">
                <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--senda-border)] pb-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
                  <span>{process.number}</span>
                  <span>{processT(`items.${process.key}.duration`, { count: process.durationMeetings })}</span>
                </div>
                <div className="relative z-10 mt-auto pt-12">
                  <p className="senda-kicker">{t(`journeys.items.${process.key}.label`)}</p>
                  <h3 className="mt-3 max-w-[16ch] text-pretty font-heading text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.03em]">{t(`journeys.items.${process.key}.title`)}</h3>
                  <p className="mt-5 max-w-[36rem] text-lg font-semibold leading-7">{t(`journeys.items.${process.key}.lead`)}</p>
                  <p className="mt-3 max-w-[38rem] text-base leading-7 text-[var(--senda-muted)]">{t(`journeys.items.${process.key}.description`)}</p>
                  <Link href={`/procesos/${process.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 transition-colors hover:text-[var(--senda-accent)]">
                    {t("journeys.cta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="situaciones" className="scroll-mt-24 border-y border-[var(--senda-border)] bg-[var(--senda-section)] px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="senda-kicker">{t("situations.eyebrow")}</p>
            <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("situations.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("situations.intro")}</p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.35rem] border border-[var(--senda-border)] bg-[var(--senda-border)] lg:grid-cols-2">
            {situationJourneys.map((key, index) => {
              const process = sendaProcesses[index];
              return (
                <article key={key} className="bg-[var(--senda-paper)] p-7 sm:p-9">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">0{index + 1}</span>
                    <span className="h-px flex-1 bg-[var(--senda-border)]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-7 text-pretty font-heading text-2xl leading-tight tracking-[-0.025em] sm:text-3xl">{t(`situations.items.${key}.title`)}</h3>
                  <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`situations.items.${key}.description`)}</p>
                  <ul className="mt-7 space-y-3 border-t border-[var(--senda-border)] pt-6">
                    {situationPoints.map((point) => (
                      <li key={point} className="flex gap-3 text-base leading-6">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--senda-terracotta)]" aria-hidden="true" />
                        {t(`situations.items.${key}.${point}`)}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/procesos/${process.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
                    {t("journeys.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("method.eyebrow")}</p>
              <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("method.title")}</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg lg:justify-self-end">{t("method.intro")}</p>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-[var(--senda-border)] bg-[var(--senda-border)] sm:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <li key={step} className="bg-[var(--senda-paper)] p-6 sm:p-7">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{t(`method.steps.${step}.number`)}</span>
                <h3 className="mt-8 font-heading text-2xl leading-tight">{t(`method.steps.${step}.title`)}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`method.steps.${step}.description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fases" className="scroll-mt-24 border-y border-[var(--senda-border)] bg-[var(--senda-section-warm)] px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="senda-kicker">{t("phases.eyebrow")}</p>
            <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("phases.title")}</h2>
            <p className="mt-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("phases.intro")}</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {sendaProcesses.map((process) => (
              <article key={process.slug} className="rounded-[1.3rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-7 sm:p-9">
                <div className="flex items-start justify-between gap-5 border-b border-[var(--senda-border)] pb-6">
                  <div>
                    <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{process.number}</span>
                    <h3 className="mt-3 font-heading text-3xl leading-tight">{processT(`items.${process.key}.title`)}</h3>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--senda-muted)]">{processT(`items.${process.key}.duration`, { count: process.durationMeetings })}</span>
                </div>
                <ol className="mt-2 divide-y divide-[var(--senda-border)]">
                  {process.stageKeys.map((stageKey, index) => (
                    <li key={stageKey} className="grid grid-cols-[2rem_1fr] gap-3 py-4 text-base leading-6">
                      <span className="text-xs font-bold tracking-[0.12em] text-[var(--senda-muted)]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-semibold">{processT(`items.${process.key}.stages.${stageKey}.title`)}</span>
                    </li>
                  ))}
                </ol>
                <Link href={`/procesos/${process.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
                  {t("phases.view")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="equipo" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("team.eyebrow")}</p>
              <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("team.title")}</h2>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("team.intro")}</p>
              <Link href="/quienes-somos" className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
                {t("team.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {teamItems.map((item, index) => (
              <article key={item} className="senda-editorial-card rounded-[1.2rem] p-7">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">0{index + 1}</span>
                <h3 className="mt-8 font-heading text-2xl leading-tight">{t(`team.items.${item}.title`)}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`team.items.${item}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-24 border-y border-[var(--senda-border)] bg-[var(--senda-section)] px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="senda-kicker">{t("faq.eyebrow")}</p>
            <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("faq.title")}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--senda-muted)]">{t("faq.intro")}</p>
          </div>
          <div className="border-t border-[var(--senda-border)]">
            {faqs.map((faq) => (
              <details key={faq} className="group border-b border-[var(--senda-border)]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-xl font-semibold leading-7 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-4">
                  {t(`faq.items.${faq}.question`)}
                  <span className="text-xl font-normal text-[var(--senda-terracotta)] transition-transform group-open:rotate-45 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-base leading-7 text-[var(--senda-muted)]">{t(`faq.items.${faq}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-20">
        <div className="senda-night relative mx-auto max-w-[1180px] overflow-hidden rounded-[1.5rem] border border-white/10 px-7 py-14 text-[#f5f1e8] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <UniverseField compact className="left-[38%] text-[#89a9bd] opacity-20" />
          <div className="relative max-w-3xl">
            <p className="senda-coordinate-label text-[#d2b879]">{t("final.eyebrow")}</p>
            <h2 className="mt-6 max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("final.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#d1d9de] sm:text-lg">{t("final.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f4efe4] px-7 py-3 text-sm font-bold text-[#17263a] transition-colors hover:bg-white">
                {t("final.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-bold text-white transition-colors hover:border-white/60 hover:bg-white/[0.08]">
                {t("final.secondaryCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
