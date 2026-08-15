import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { compassProcess, transitionServices } from "@/lib/data/senda-processes";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

export function TransitionsPage() {
  const t = useTranslations("Journeys");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />

      <PageSection>
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <h2 className="max-w-[16ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("intro.title")}</h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("intro.description")}</p>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {transitionServices.map((process) => (
            <article key={process.slug} data-cursor-glow className="senda-editorial-card group flex min-h-[23rem] flex-col rounded-[1.35rem] p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--senda-border)] pb-5">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{process.number}</span>
                <span className="senda-kicker">{t(`items.${process.key}.eyebrow`)}</span>
              </div>
              <div className="mt-auto pt-10">
                <h2 className="max-w-[15ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t(`items.${process.key}.title`)}</h2>
                <p className="mt-5 text-lg font-semibold leading-8">{t(`items.${process.key}.lead`)}</p>
                <p className="mt-4 max-w-xl text-base leading-7 text-[var(--senda-muted)]">{t(`items.${process.key}.description`)}</p>
                <Link href={`/transiciones-laborales/${process.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--senda-terracotta)]/55 underline-offset-8 transition-colors hover:text-[var(--senda-accent)]">
                  {t(`items.${process.key}.cta`)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-8 border-t border-[var(--senda-border)] pt-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="senda-kicker">{t(`items.${compassProcess.key}.eyebrow`)}</p>
            <h2 className="mt-4 max-w-[16ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t(`items.${compassProcess.key}.title`)}
            </h2>
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

      <ClosingCta title={t("closing.title")} description={t("closing.description")} label={t("closing.cta")} href="/encontrar-mi-recorrido" />
    </div>
  );
}

export const JourneysPage = TransitionsPage;
