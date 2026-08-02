import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { Link } from "@/navigation";
import type { getSendaProcess } from "@/lib/data/senda-processes";

type SendaProcess = NonNullable<ReturnType<typeof getSendaProcess>>;

export function ProcessDetail({ process }: { process: SendaProcess }) {
  const t = useTranslations("Processes");

  return (
    <article className={`senda-process-detail senda-process-detail--${process.accent} bg-[var(--senda-bg)] text-[var(--senda-ink)]`}>
      <header className="relative overflow-hidden border-b border-white/10 bg-[var(--senda-ink)] px-5 pb-24 pt-36 text-[#f4efe4] sm:px-8 md:pb-32 md:pt-44 lg:px-12 xl:px-20">
        <svg className="absolute -right-44 -top-28 h-[42rem] w-[70rem] stroke-[#d2ba8a] opacity-[0.15]" viewBox="0 0 800 500" fill="none" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <path key={line} d={`M-60 ${430 - line * 42}C90 ${320 - line * 29} 212 ${480 - line * 46} 364 ${345 - line * 25}c130-116 223 8 354-122 54-54 99-126 135-204`} />
          ))}
        </svg>
        <div className="relative mx-auto max-w-[1180px]">
          <Link href="/#procesos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f4efe4]/65 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("back")}
          </Link>
          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--senda-terracotta)]">{t("eyebrow", { number: process.number })}</p>
              <h1 className="mt-6 max-w-[10ch] font-heading text-[clamp(4rem,8vw,8rem)] leading-[0.86] tracking-[-0.055em]">{t(`items.${process.key}.title`)}</h1>
            </div>
            <div className="border-l border-white/20 pl-6 sm:pl-8">
              <p className="text-xl font-semibold leading-8 text-white">{t(`items.${process.key}.lead`)}</p>
              <p className="mt-5 flex items-center gap-2 text-sm text-[#f4efe4]/65">
                <Clock3 className="h-4 w-4" aria-hidden="true" /> {t(`items.${process.key}.duration`, { count: process.durationMeetings })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="senda-reveal mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[0.55fr_1fr]">
          <p className="senda-kicker">{t("introduction")}</p>
          <div className="max-w-3xl">
            <p className="font-heading text-4xl leading-[1.1] tracking-[-0.025em] sm:text-5xl">{t(`items.${process.key}.intro`)}</p>
            <p className="mt-7 text-lg leading-8 text-[var(--senda-muted)]">{t(`items.${process.key}.clarification`)}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--senda-border)] bg-[var(--senda-stone)] px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="senda-reveal flex flex-col justify-between gap-8 border-b border-[var(--senda-ink)]/15 pb-10 sm:flex-row sm:items-end">
            <div>
              <p className="senda-kicker">{t("journey.eyebrow")}</p>
              <h2 className="mt-5 font-heading text-5xl leading-none tracking-[-0.04em] sm:text-7xl">{t("journey.title")}</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[var(--senda-muted)]">{t("journey.note")}</p>
          </div>

          <ol>
            {process.stageKeys.map((stageKey, index) => (
              <li key={stageKey} className="senda-reveal grid gap-5 border-b border-[var(--senda-ink)]/15 py-9 sm:grid-cols-[5rem_0.75fr_1.25fr] sm:py-12">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-heading text-3xl leading-[1.05] sm:text-4xl">{t(`items.${process.key}.stages.${stageKey}.title`)}</h3>
                <p className="max-w-xl text-base leading-8 text-[var(--senda-muted)] sm:justify-self-end">{t(`items.${process.key}.stages.${stageKey}.description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="senda-reveal mx-auto grid max-w-[1100px] gap-12 rounded-[2.2rem] bg-[var(--senda-paper)] p-7 shadow-[0_30px_80px_-62px_rgba(36,40,31,.55)] sm:p-12 lg:grid-cols-[0.7fr_1fr] lg:p-16">
          <div>
            <p className="senda-kicker">{t("takeaways.eyebrow")}</p>
            <h2 className="mt-5 max-w-[10ch] font-heading text-5xl leading-none tracking-[-0.04em] sm:text-6xl">{t("takeaways.title")}</h2>
          </div>
          <ul className="divide-y divide-[var(--senda-border)] border-y border-[var(--senda-border)]">
            {process.takeawayKeys.map((takeawayKey) => (
              <li key={takeawayKey} className="flex items-start gap-4 py-5 text-base leading-7 text-[var(--senda-ink)]">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--senda-olive)] text-white"><Check className="h-3 w-3" aria-hidden="true" /></span>
                {t(`items.${process.key}.takeaways.${takeawayKey}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="relative mx-auto overflow-hidden rounded-[2.4rem] bg-[var(--senda-olive)] px-7 py-16 text-[#f4efe4] sm:px-12 md:py-24 lg:px-20">
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9cfad]">{t("cta.eyebrow")}</p>
            <h2 className="mt-6 font-heading text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl">{t("cta.title")}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#f4efe4]/75">{t("cta.description")}</p>
            <Link href="/diagnostico" className="mt-9 inline-flex min-h-13 items-center gap-2 rounded-full bg-[#f4efe4] px-7 py-3.5 text-sm font-bold text-[var(--senda-ink)] hover:bg-white">
              {t("cta.button")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

