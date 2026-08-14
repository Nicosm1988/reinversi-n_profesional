import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { sendaProcesses } from "@/lib/data/senda-processes";
import { UniverseField } from "@/components/visual/universe-field";

const methodSteps = ["listen", "map", "define", "move"] as const;

function RouteMap() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[31rem]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 400" fill="none">
        <ellipse cx="250" cy="200" rx="212" ry="112" className="[stroke:var(--senda-atmosphere-line)]" />
        <ellipse cx="250" cy="200" rx="156" ry="176" className="opacity-60 [stroke:var(--senda-atmosphere-line)]" transform="rotate(38 250 200)" />
        <path d="M48 294C136 244 177 310 264 225c66-64 117-71 190-121" className="opacity-55 [stroke:var(--senda-atmosphere-gold)]" />
        <path d="M65 330C161 273 207 344 303 253c58-55 102-65 154-97" className="opacity-60 [stroke:var(--senda-atmosphere-line)]" strokeDasharray="4 9" />
        <circle cx="125" cy="276" r="6" className="[fill:var(--senda-atmosphere-accent)]" />
        <circle cx="264" cy="225" r="8" className="[fill:var(--senda-atmosphere-gold)]" />
        <circle cx="407" cy="135" r="5" className="[fill:var(--senda-atmosphere-sky)]" />
      </svg>
      <span className="absolute left-[18%] top-[64%] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">01 · 34°36&apos;S</span>
      <span className="absolute right-[8%] top-[26%] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">02 · 58°22&apos;W</span>
    </div>
  );
}

export function SendaHome() {
  const t = useTranslations("Home");

  return (
    <div className="senda-home overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <section className="senda-night border-b border-[var(--senda-atmosphere-border)] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-28 xl:px-20">
        <UniverseField className="left-[28%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <div className="relative mx-auto grid w-full max-w-[1240px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{t("hero.eyebrow")}</p>
            <h1 className="mt-7 max-w-[14ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[var(--senda-atmosphere-ink)]">
              {t("hero.title")}
            </h1>
            <div className="mt-7 max-w-2xl border-l border-[var(--senda-atmosphere-accent)] pl-5 sm:pl-7">
              <p className="whitespace-pre-line text-base leading-7 text-[var(--senda-atmosphere-ink)] sm:text-lg sm:leading-8">{t("hero.rhythm")}</p>
              <p className="mt-4 text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg">{t("hero.description")}</p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostico" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] shadow-[0_20px_50px_-28px_rgba(0,0,0,.55)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]">
                {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/recorridos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-ink)] backdrop-blur-sm transition-colors hover:bg-[var(--senda-atmosphere-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
                {t("hero.secondaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <RouteMap />
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1120px] gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <p className="senda-kicker">{t("introduction.eyebrow")}</p>
          <div>
            <h2 className="max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("introduction.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("introduction.description")}</p>
            <Link href="/como-trabajamos" className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
              {t("introduction.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--senda-border)] bg-[var(--senda-section)] px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("journeys.eyebrow")}</p>
              <h2 className="mt-4 max-w-[14ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("journeys.title")}</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg lg:justify-self-end">{t("journeys.intro")}</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {sendaProcesses.map((process) => (
              <article key={process.slug} data-cursor-glow className="senda-process-card senda-editorial-card group relative flex min-h-[19rem] flex-col overflow-hidden rounded-[1.35rem] p-7 sm:p-9">
                <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--senda-border)] pb-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
                  <span>{process.number}</span>
                  <span>{t(`journeys.items.${process.key}.label`)}</span>
                </div>
                <div className="relative z-10 mt-auto pt-9">
                  <h3 className="max-w-[16ch] text-pretty font-heading text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.03em]">{t(`journeys.items.${process.key}.title`)}</h3>
                  <p className="mt-4 max-w-[36rem] text-lg font-semibold leading-7">{t(`journeys.items.${process.key}.lead`)}</p>
                  <p className="mt-3 max-w-[38rem] text-base leading-7 text-[var(--senda-muted)]">{t(`journeys.items.${process.key}.description`)}</p>
                  <Link href={`/recorridos/${process.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 transition-colors hover:text-[var(--senda-accent)]">
                    {t("journeys.cta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link href="/recorridos" className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
            {t("journeys.viewAll")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("method.eyebrow")}</p>
              <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("method.title")}</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg lg:justify-self-end">{t("method.intro")}</p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.25rem] border border-[var(--senda-border)] bg-[var(--senda-border)] sm:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <li key={step} className="bg-[var(--senda-paper)] p-6 sm:p-7">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{t(`method.steps.${step}.number`)}</span>
                <h3 className="mt-7 font-heading text-2xl leading-tight">{t(`method.steps.${step}.title`)}</h3>
              </li>
            ))}
          </ol>
          <Link href="/como-trabajamos" className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
            {t("method.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--senda-border)] bg-[var(--senda-section-warm)] px-5 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="senda-kicker">{t("laboratory.eyebrow")}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">{t("laboratory.status")}</p>
          </div>
          <div>
            <h2 className="max-w-[20ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("laboratory.title")}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("laboratory.description")}</p>
            <Link href="/laboratorio-nuevas-narrativas" className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
              {t("laboratory.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="senda-night relative mx-auto max-w-[1180px] overflow-hidden rounded-[1.5rem] border border-[var(--senda-atmosphere-border)] px-7 py-14 text-[var(--senda-atmosphere-ink)] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <UniverseField compact className="left-[38%] text-[var(--senda-atmosphere-sky)] opacity-20" />
          <div className="relative max-w-3xl">
            <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{t("final.eyebrow")}</p>
            <h2 className="mt-6 max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("final.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg">{t("final.description")}</p>
            <Link href="/contacto" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
              {t("final.secondaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
