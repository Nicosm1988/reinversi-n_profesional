import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { compassProcess, transitionServices } from "@/lib/data/senda-processes";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";
import { ServiceInterestForm } from "@/components/forms/service-interest-form";

export function TransitionsPage() {
  const t = useTranslations("Journeys");
  const statements = t.raw("recognition.statements") as string[];
  const dimensionKeys = ["path", "present", "motivations", "relationship", "possibilities", "decisions", "movement"] as const;
  const stepKeys = ["understand", "retrace", "explore", "contrast", "build", "move"] as const;
  const stageItems = t.raw("stages.items") as string[];
  const outcomeItems = t.raw("outcomes.items") as string[];

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")}>
        <a
          href="#servicio"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] shadow-[0_20px_50px_-28px_rgba(0,0,0,.55)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]"
        >
          {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <Link
          href="/contacto"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-ink)] backdrop-blur-sm transition-colors hover:bg-[var(--senda-atmosphere-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]"
        >
          {t("hero.secondaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </PageHero>

      <PageSection>
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("recognition.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("recognition.title")}
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {statements.map((statement) => (
              <li
                key={statement}
                className="rounded-xl border border-[var(--senda-border)] bg-[var(--senda-section)] px-5 py-4 text-base leading-7 text-[var(--senda-ink)]"
              >
                {statement}
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("core.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("core.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-6 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("core.paragraph")}</p>
            <p className="border-l border-[var(--senda-accent)] pl-5 font-semibold text-[var(--senda-ink)]">{t("core.quote")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <p className="senda-kicker">{t("dimensions.eyebrow")}</p>
        <h2 className="mt-4 max-w-[24ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
          {t("dimensions.title")}
        </h2>
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dimensionKeys.map((key) => (
            <li key={key} className="rounded-xl border border-[var(--senda-border)] bg-[var(--senda-section)] px-5 py-5">
              <span className="block font-heading text-xl leading-tight">{t(`dimensions.items.${key}.title`)}</span>
              <span className="mt-2 block text-sm leading-6 text-[var(--senda-muted)]">{t(`dimensions.items.${key}.description`)}</span>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("context.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("context.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("context.paragraph1")}</p>
            <p className="font-semibold text-[var(--senda-ink)]">{t("context.paragraph2")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="flex flex-col justify-between gap-7 border-b border-[var(--senda-border)] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="senda-kicker">{t("process.eyebrow")}</p>
            <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("process.title")}</h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-[var(--senda-muted)]">{t("process.note")}</p>
        </div>
        <ol>
          {stepKeys.map((key) => (
            <li key={key} className="grid gap-4 border-b border-[var(--senda-border)] py-7 sm:grid-cols-[4rem_0.8fr_1.2fr] sm:gap-6 sm:py-9">
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{t(`process.steps.${key}.number`)}</span>
              <h3 className="text-pretty font-heading text-2xl leading-tight sm:text-3xl">{t(`process.steps.${key}.title`)}</h3>
              <p className="max-w-xl text-base leading-7 text-[var(--senda-muted)] sm:justify-self-end">{t(`process.steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("tools.eyebrow")}</p>
            <h2 className="mt-4 max-w-[20ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("tools.title")}
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("tools.paragraph")}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--senda-border)] bg-[var(--senda-paper)] p-5">
                <h3 className="font-heading text-xl leading-tight">{t("tools.items.careerAnchor.title")}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--senda-muted)]">{t("tools.items.careerAnchor.description")}</p>
                <Link
                  href="/test-anclas-de-carrera"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]"
                >
                  {t("tools.items.careerAnchor.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="rounded-xl border border-[var(--senda-border)] bg-[var(--senda-paper)] p-5">
                <h3 className="font-heading text-xl leading-tight">{t("tools.items.diagnostic.title")}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--senda-muted)]">{t("tools.items.diagnostic.description")}</p>
                <Link
                  href="/encontrar-mi-recorrido"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]"
                >
                  {t("tools.items.diagnostic.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("stages.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("stages.title")}
            </h2>
          </div>
          <div>
            <ul className="grid gap-x-8 gap-y-2 text-base leading-8 text-[var(--senda-muted)] sm:grid-cols-2">
              {stageItems.map((item) => (
                <li key={item} className="border-b border-[var(--senda-border)] py-2">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-[var(--senda-border)] pt-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("stages.compassIntro")}</p>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-lg font-semibold leading-8">{t(`items.${compassProcess.key}.lead`)}</p>
            <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`items.${compassProcess.key}.description`)}</p>
            <Link href="/brujulas" className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 hover:text-[var(--senda-accent)]">
              {t(`items.${compassProcess.key}.cta`)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("outcomes.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("outcomes.title")}
            </h2>
          </div>
          <div className="max-w-2xl">
            <ul className="grid gap-2 sm:grid-cols-2">
              {outcomeItems.map((item) => (
                <li key={item} className="text-base leading-7 text-[var(--senda-muted)]">{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-base font-semibold leading-7 text-[var(--senda-ink)] sm:text-lg">{t("outcomes.closingLine")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection id="servicio">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("service.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("service.title")}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("service.description")}</p>
        </div>

        <div className="mt-10 divide-y divide-[var(--senda-border)] overflow-hidden rounded-[1.35rem] border border-[var(--senda-border)] bg-[var(--senda-paper)]">
          {transitionServices.map((process) => (
            <article key={process.slug} data-cursor-glow className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-7">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)] sm:w-8 sm:shrink-0">{process.number}</span>
                <div className="sm:w-[15rem] sm:shrink-0">
                  <h3 className="text-pretty font-heading text-2xl leading-[1.1] tracking-[-0.03em] lg:text-3xl">{t(`items.${process.key}.title`)}</h3>
                </div>
                <p className="max-w-xl text-base leading-7 text-[var(--senda-muted)]">{t(`items.${process.key}.lead`)}</p>
              </div>
              <div className="sm:w-72 sm:shrink-0">
                <ServiceInterestForm service={process.slug} />
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <ClosingCta
        title={t("closing.title")}
        description={t("closing.description")}
        label={t("closing.cta")}
        href="/contacto"
      />
    </div>
  );
}

export const JourneysPage = TransitionsPage;
