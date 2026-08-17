import { useTranslations } from "next-intl";
import { LaboratoryInterestForm } from "@/components/forms/laboratory-interest-form";
import { PageSection } from "@/components/pages/page-primitives";
import { UniverseField } from "@/components/visual/universe-field";

const explorationKeys = [
  "path",
  "interest",
  "coherence",
  "narrative",
  "decision",
  "change",
  "meaning",
  "context",
  "future",
] as const;

function NarrativeRouteMap() {
  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-[34rem] overflow-hidden rounded-[1.5rem] border border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] p-5 shadow-[0_30px_80px_-55px_rgba(10,20,34,0.75)] backdrop-blur-sm sm:p-8"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 520 410"
        fill="none"
        focusable="false"
      >
        <path
          d="M42 337C104 306 131 321 174 282C213 247 194 208 242 177C295 143 334 173 374 124C401 91 431 74 478 69"
          stroke="var(--senda-atmosphere-line)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M43 337C94 316 139 352 190 315C241 279 231 238 278 211C323 185 366 210 407 174C436 149 452 123 478 69"
          stroke="var(--senda-atmosphere-gold)"
          strokeWidth="1.2"
          strokeDasharray="5 10"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M242 177C284 140 291 91 269 41M278 211C324 243 369 265 428 253"
          stroke="var(--senda-atmosphere-line)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="273"
          cy="198"
          rx="130"
          ry="72"
          stroke="var(--senda-atmosphere-line)"
          strokeWidth="1"
          opacity="0.68"
          transform="rotate(-18 273 198)"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="43" cy="337" r="7" fill="var(--senda-atmosphere-accent)" />
        <circle cx="242" cy="177" r="8" fill="var(--senda-atmosphere-gold)" />
        <circle cx="278" cy="211" r="5" fill="var(--senda-atmosphere-sky)" />
        <circle cx="478" cy="69" r="7" fill="var(--senda-atmosphere-ink)" />
        <circle cx="269" cy="41" r="3" fill="var(--senda-atmosphere-muted)" />
        <circle cx="428" cy="253" r="3" fill="var(--senda-atmosphere-muted)" />
      </svg>
      <span className="absolute bottom-5 left-6 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[var(--senda-atmosphere-muted)] sm:bottom-7 sm:left-9">
        34°36&apos;S · 58°22&apos;W
      </span>
      <span className="absolute right-6 top-5 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[var(--senda-atmosphere-muted)] sm:right-9 sm:top-7">
        08 · SENDA
      </span>
    </div>
  );
}

export function NarrativesLabPage() {
  const t = useTranslations("NarrativesLab");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <header className="senda-night border-b border-[var(--senda-atmosphere-border)] px-5 pb-20 pt-32 text-[var(--senda-atmosphere-ink)] sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-28 xl:px-20">
        <UniverseField className="left-[28%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <div className="relative mx-auto grid w-full max-w-[1430px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-7 max-w-[13ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
              {t("hero.title")}
            </h1>
            <p className="mt-7 max-w-2xl border-l border-[var(--senda-atmosphere-accent)] pl-5 text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:pl-7 sm:text-lg sm:leading-8">
              {t("hero.description")}
            </p>
            <a
              href="#interes-laboratorio"
              className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]"
            >
              {t("hero.cta")}
              <svg className="ml-2 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <NarrativeRouteMap />
        </div>
      </header>

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="senda-kicker">{t("development.eyebrow")}</p>
            <h2 className="mt-4 max-w-[15ch] text-pretty font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] tracking-[-0.04em]">
              {t("development.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("development.paragraph1")}</p>
            <p>{t("development.paragraph2")}</p>
            <p>{t("development.paragraph3")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
          <div>
            <p className="senda-kicker">{t("explorations.eyebrow")}</p>
            <h2 className="mt-4 max-w-[16ch] text-pretty font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] tracking-[-0.04em]">
              {t("explorations.title")}
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
              {t("explorations.description")}
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-terracotta)]">
              01—09 · SENDA / LAB
            </p>
          </div>
        </div>
        <ol className="mt-10 grid overflow-hidden rounded-[1.4rem] border border-[var(--senda-border)] bg-[var(--senda-border)] sm:grid-cols-2 lg:grid-cols-3">
          {explorationKeys.map((key, index) => (
            <li
              key={key}
              className="min-h-36 bg-[var(--senda-paper)] p-5 sm:min-h-52 sm:p-7"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-8 text-pretty font-heading text-xl font-medium leading-7 sm:text-2xl">
                {t(`explorations.items.${key}`)}
              </p>
            </li>
          ))}
        </ol>
      </PageSection>

      <section
        id="interes-laboratorio"
        className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20"
      >
        <div className="mx-auto grid max-w-[1290px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-16">
          <div className="lg:pt-8">
            <p className="senda-coordinate-label text-[var(--senda-accent-dark)]">{t("closing.eyebrow")}</p>
            <h2 className="mt-6 max-w-[15ch] text-pretty font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] tracking-[-0.04em]">
              {t("closing.title")}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
              {t("closing.description")}
            </p>
          </div>
          <LaboratoryInterestForm />
        </div>
      </section>
    </div>
  );
}
