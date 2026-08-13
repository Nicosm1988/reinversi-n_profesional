import { useTranslations } from "next-intl";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

const questions = ["choose", "compass", "newStage", "format", "duration", "diagnostic", "results"] as const;

export function FaqPage() {
  const t = useTranslations("Faq");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />

      <PageSection>
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="max-w-md text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("intro")}</p>
          </div>
          <div className="border-t border-[var(--senda-border)]">
            {questions.map((question) => (
              <details key={question} className="group border-b border-[var(--senda-border)]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-xl font-semibold leading-7 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-4">
                  {t(`items.${question}.question`)}
                  <span className="text-xl font-normal text-[var(--senda-terracotta)] transition-transform group-open:rotate-45 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-base leading-7 text-[var(--senda-muted)]">{t(`items.${question}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </PageSection>

      <ClosingCta title={t("closing.title")} description={t("closing.description")} label={t("closing.cta")} />
    </div>
  );
}
