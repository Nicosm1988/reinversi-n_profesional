import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { compassProcess, transitionServices } from "@/lib/data/senda-processes";
import { PageHero, PageSection } from "@/components/pages/page-primitives";
import { ServiceInterestForm } from "@/components/forms/service-interest-form";

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
        <div className="divide-y divide-[var(--senda-border)] overflow-hidden rounded-[1.35rem] border border-[var(--senda-border)] bg-[var(--senda-paper)]">
          {transitionServices.map((process) => (
            <article key={process.slug} data-cursor-glow className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-7">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)] sm:w-8 sm:shrink-0">{process.number}</span>
                <div className="sm:w-[15rem] sm:shrink-0">
                  <h2 className="text-pretty font-heading text-2xl leading-[1.1] tracking-[-0.03em] lg:text-3xl">{t(`items.${process.key}.title`)}</h2>
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

      {/* Cierre "Reconocer en qué momento estoy" retirado de toda la web; el finder se revisa
          con preguntas nuevas antes de volver a mostrarse. El componente sigue disponible. */}
    </div>
  );
}

export const JourneysPage = TransitionsPage;
