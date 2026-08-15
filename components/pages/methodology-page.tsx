import { useTranslations } from "next-intl";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

const principles = ["personal", "rigorous", "practical"] as const;
const methodSteps = ["listen", "map", "define", "move"] as const;

export function MethodologyPage() {
  const t = useTranslations("Methodology");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="senda-kicker">{t("principles.eyebrow")}</p>
            <h2 className="mt-4 max-w-[15ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("principles.title")}</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("principles.intro")}</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-[var(--senda-border)] bg-[var(--senda-border)] sm:grid-cols-3">
            {principles.map((principle, index) => (
              <article key={principle} className="bg-[var(--senda-paper)] p-6 sm:p-7">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-7 font-heading text-2xl leading-tight">{t(`principles.items.${principle}.title`)}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`principles.items.${principle}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="max-w-3xl">
          <p className="senda-kicker">{t("steps.eyebrow")}</p>
          <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("steps.title")}</h2>
          <p className="mt-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("steps.intro")}</p>
        </div>
        <ol className="mt-10 border-t border-[var(--senda-border)]">
          {methodSteps.map((step) => (
            <li key={step} className="grid gap-4 border-b border-[var(--senda-border)] py-7 sm:grid-cols-[4rem_0.75fr_1.25fr] sm:gap-6 sm:py-9">
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{t(`steps.items.${step}.number`)}</span>
              <h3 className="text-pretty font-heading text-2xl leading-tight sm:text-3xl">{t(`steps.items.${step}.title`)}</h3>
              <p className="max-w-xl text-base leading-7 text-[var(--senda-muted)] sm:justify-self-end">{t(`steps.items.${step}.description`)}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection>
        <div data-cursor-glow className="senda-editorial-card grid gap-7 rounded-[1.35rem] p-7 sm:p-10 lg:grid-cols-[0.65fr_1.35fr] lg:p-12">
          <p className="senda-kicker">{t("tools.eyebrow")}</p>
          <div>
            <h2 className="max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("tools.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("tools.description")}</p>
          </div>
        </div>
      </PageSection>

      <ClosingCta title={t("closing.title")} description={t("closing.description")} label={t("closing.cta")} href="/transiciones-laborales" />
    </div>
  );
}
