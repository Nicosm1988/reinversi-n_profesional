import { useTranslations } from "next-intl";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

const principles = ["multidisciplinary", "human", "rigor"] as const;

export function TeamPage() {
  const t = useTranslations("Team");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />

      <PageSection>
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <p className="senda-kicker">{t("introduction.eyebrow")}</p>
          <div>
            <h2 className="max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("introduction.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("introduction.description")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <article key={principle} className="senda-editorial-card rounded-[1.2rem] p-7 sm:p-8">
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{t(`principles.${principle}.number`)}</span>
              <h2 className="mt-8 font-heading text-2xl leading-tight">{t(`principles.${principle}.title`)}</h2>
              <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">{t(`principles.${principle}.description`)}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <ClosingCta title={t("closing.title")} description={t("closing.description")} label={t("closing.cta")} />
    </div>
  );
}
