import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { getSendaProcess } from "@/lib/data/senda-processes";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

type SendaProcess = NonNullable<ReturnType<typeof getSendaProcess>>;

export function ProcessDetail({ process }: { process: SendaProcess }) {
  const t = useTranslations("Processes");

  return (
    <article className={`senda-process-detail senda-process-detail--${process.accent} bg-[var(--senda-bg)] text-[var(--senda-ink)]`}>
      <header className="senda-night border-b border-[var(--senda-atmosphere-border)] px-5 pb-20 pt-32 text-[var(--senda-atmosphere-ink)] sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 xl:px-20">
        <UniverseField className="left-[28%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <div className="relative mx-auto max-w-[1120px]">
          {!process.secondary ? (
            <Link href="/transiciones-laborales" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--senda-atmosphere-muted)] transition-colors hover:text-[var(--senda-atmosphere-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("back")}
            </Link>
          ) : null}
          <div className="mt-12 grid gap-9 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{t("eyebrow", { number: process.number })}</p>
              <h1 className="mt-6 max-w-[14ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-[-0.045em]">
                {t(`items.${process.key}.title`)}
              </h1>
            </div>
            <div className="min-w-0 border-l border-[var(--senda-atmosphere-border)] pl-6 sm:pl-8">
              <p className="text-lg font-semibold leading-8 text-[var(--senda-atmosphere-ink)] sm:text-xl">{t(`items.${process.key}.lead`)}</p>
              {process.durationMeetings !== null ? (
                <p className="mt-5 flex items-center gap-2 text-sm text-[var(--senda-atmosphere-muted)]">
                  <Clock3 className="h-4 w-4" aria-hidden="true" /> {t(`items.${process.key}.duration`, { count: process.durationMeetings })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1080px] gap-6 lg:grid-cols-[0.52fr_1fr] lg:gap-14">
          <p className="senda-kicker">{t("introduction")}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="senda-editorial-card rounded-[1.2rem] p-7">
              <h2 className="font-heading text-2xl leading-tight sm:text-3xl">{t("objectiveLabel")}</h2>
              <p className="mt-5 text-base leading-7 text-[var(--senda-muted)]">{t(`items.${process.key}.objective`)}</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--senda-border)] bg-[var(--senda-section)] p-7">
              <h2 className="font-heading text-2xl leading-tight sm:text-3xl">{t("forWhomLabel")}</h2>
              <p className="mt-5 text-base leading-7 text-[var(--senda-muted)]">{t(`items.${process.key}.forWhom`)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--senda-border)] bg-[var(--senda-stone)] px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1080px]">
          <div className="flex flex-col justify-between gap-7 border-b border-[var(--senda-border)] pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="senda-kicker">{t("journey.eyebrow")}</p>
              <h2 className="mt-4 text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("journey.title")}</h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-[var(--senda-muted)]">{t("journey.note")}</p>
          </div>

          <ol>
            {process.stageKeys.map((stageKey, index) => (
              <li key={stageKey} className="grid gap-4 border-b border-[var(--senda-border)] py-7 sm:grid-cols-[4rem_0.8fr_1.2fr] sm:gap-6 sm:py-9">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="text-pretty font-heading text-2xl leading-tight sm:text-3xl">{t(`items.${process.key}.stages.${stageKey}.title`)}</h3>
                <p className="max-w-xl text-base leading-7 text-[var(--senda-muted)] sm:justify-self-end">{t(`items.${process.key}.stages.${stageKey}.description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-12 xl:px-20">
        <div data-cursor-glow className="senda-editorial-card mx-auto grid max-w-[1080px] gap-10 overflow-hidden rounded-[1.35rem] p-7 sm:p-10 lg:grid-cols-[0.7fr_1fr] lg:p-12">
          <div className="relative z-10">
            <p className="senda-kicker">{t("takeaways.eyebrow")}</p>
            <h2 className="mt-4 max-w-[14ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("takeaways.title")}</h2>
          </div>
          <ul className="relative z-10 divide-y divide-[var(--senda-border)] border-y border-[var(--senda-border)]">
            {process.takeawayKeys.map((takeawayKey) => (
              <li key={takeawayKey} className="flex items-start gap-4 py-4 text-base leading-7">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--senda-olive)] text-[var(--senda-on-olive)]"><Check className="h-3 w-3" aria-hidden="true" /></span>
                {t(`items.${process.key}.takeaways.${takeawayKey}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="senda-night relative mx-auto max-w-[1080px] overflow-hidden rounded-[1.4rem] border border-[var(--senda-atmosphere-border)] px-7 py-14 text-[var(--senda-atmosphere-ink)] sm:px-12 sm:py-16 lg:px-16">
          <UniverseField compact className="left-[35%] text-[var(--senda-atmosphere-sky)] opacity-20" />
          <div className="relative max-w-3xl">
            <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{t("cta.eyebrow")}</p>
            <h2 className="mt-5 max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("cta.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg">{t("cta.description")}</p>
            <Link href="/encontrar-mi-recorrido" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
              {t("cta.button")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
