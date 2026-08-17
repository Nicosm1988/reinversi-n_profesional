import { useTranslations } from "next-intl";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

const dimensions = ["experience", "practice", "senda"] as const;

export function AboutMePage() {
  const t = useTranslations("AboutMe");

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.6fr] lg:items-start lg:gap-14">
          <div className="mx-auto w-full max-w-[16rem] lg:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tania-marquez.jpg"
              alt={t("story.photoAlt")}
              className="w-full rounded-[1.5rem] object-cover grayscale [aspect-ratio:4/5]"
            />
          </div>
          <div>
            <p className="senda-kicker">{t("story.eyebrow")}</p>
            <h2 className="mt-4 max-w-[22ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("story.title")}
            </h2>
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
              <p>{t("story.paragraph1")}</p>
              <p>{t("story.paragraph2")}</p>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="max-w-3xl">
          <p className="senda-kicker">{t("structure.eyebrow")}</p>
          <h2 className="mt-5 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
            {t("structure.title")}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">
            {t("structure.description")}
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {dimensions.map((dimension) => (
            <li key={dimension} className="senda-editorial-card rounded-[1.2rem] p-7 sm:p-8">
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">
                {t(`structure.items.${dimension}.number`)}
              </span>
              <h3 className="mt-8 font-heading text-2xl leading-tight">
                {t(`structure.items.${dimension}.title`)}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--senda-muted)]">
                {t(`structure.items.${dimension}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </PageSection>

      <ClosingCta
        title={t("closing.title")}
        description={t("closing.description")}
        label={t("closing.cta")}
      />
    </div>
  );
}
