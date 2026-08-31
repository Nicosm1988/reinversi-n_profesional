import Image from "next/image";
import { useTranslations } from "next-intl";
import { ClosingCta, PageHero, PageSection } from "@/components/pages/page-primitives";

export function AboutMePage() {
  const t = useTranslations("AboutMe");
  const principles = t.raw("outlook.principles") as string[];
  const highlights = t.raw("story.highlights") as { headline: string; description: string }[];
  const members = t.raw("story.members") as { name: string; role: string; description: string; photo: string }[];

  return (
    <div className="overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />

      <PageSection>
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("origin.eyebrow")}</p>
            <h2 className="mt-4 max-w-[16ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("origin.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("origin.paragraph1")}</p>
            <p>{t("origin.paragraph2")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("outlook.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("outlook.title")}
            </h2>
          </div>
          <div className="max-w-2xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("outlook.paragraph1")}</p>
            <ul className="mt-5 space-y-2 border-l border-[var(--senda-accent)] pl-5">
              {principles.map((principle) => (
                <li key={principle} className="font-semibold text-[var(--senda-ink)]">{principle}</li>
              ))}
            </ul>
            <p className="mt-5">{t("outlook.paragraph2")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-start lg:gap-14">
          <div className="relative mx-auto w-full max-w-[24rem] [aspect-ratio:4/5] lg:col-start-1 lg:row-start-1 lg:mx-0">
            <Image
              src="/tania-marquez.jpg"
              alt={t("story.photoAlt")}
              fill
              sizes="(min-width: 1024px) 24rem, 90vw"
              priority
              className="rounded-[1.5rem] object-cover grayscale"
            />
          </div>
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <p className="senda-kicker">{t("story.eyebrow")}</p>
            <h2 className="mt-4 max-w-[28ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("story.title")}
            </h2>
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
              <p>{t("story.paragraph1")}</p>
              <p>{t("story.paragraph2")}</p>
              <p>{t("story.paragraph3")}</p>
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <li key={highlight.headline} className="rounded-xl border border-[var(--senda-border)] bg-[var(--senda-section)] px-4 py-3">
                  <span className="block text-sm font-bold text-[var(--senda-ink)]">{highlight.headline}</span>
                  <span className="block text-sm leading-6 text-[var(--senda-muted)]">{highlight.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-2 lg:mx-0 lg:max-w-[24rem] lg:grid-cols-1">
            {members.map((member) => (
              <div
                key={member.name}
                className="flex items-start gap-5 rounded-xl border border-[var(--senda-border)] bg-[var(--senda-section)] p-5"
              >
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-[1rem]">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="6rem"
                    className="object-cover grayscale"
                  />
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--senda-ink)]">{member.name}</span>
                  <span className="block text-sm font-semibold text-[var(--senda-muted)]">{member.role}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--senda-muted)]">{member.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("team.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("team.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("team.paragraph1")}</p>
            <p>{t("team.paragraph2")}</p>
            <p className="font-semibold text-[var(--senda-ink)]">{t("team.premise")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("practice.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("practice.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("practice.paragraph1")}</p>
            <p>{t("practice.paragraph2")}</p>
          </div>
        </div>
      </PageSection>

      <PageSection tone="muted">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="senda-kicker">{t("senda.eyebrow")}</p>
            <h2 className="mt-4 max-w-[18ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">
              {t("senda.title")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-base leading-7 text-[var(--senda-muted)] sm:text-lg sm:leading-8">
            <p>{t("senda.paragraph1")}</p>
            <p>{t("senda.paragraph2")}</p>
          </div>
        </div>
      </PageSection>

      <ClosingCta
        title={t("closing.title")}
        description={t("closing.description")}
        label={t("closing.cta")}
      />
    </div>
  );
}
