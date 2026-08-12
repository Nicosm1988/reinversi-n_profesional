import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Asterisk, Compass, MoveDown } from "lucide-react";
import { Link } from "@/navigation";
import { getSendaProcess, sendaProcesses, type ProcessSlug } from "@/lib/data/senda-processes";
import { UniverseField } from "@/components/visual/universe-field";

const howSteps = ["name", "find", "experience", "return"] as const;
const territories = ["work", "identity", "learning", "purpose", "technology"] as const;
const faqs = ["which", "switch", "format", "duration", "single", "diagnostic", "receive"] as const;
const processIllustrations = ["/illustrations/problem.png", "/illustrations/method.png", "/illustrations/paths.png"] as const;

const situationKeys = ["experience", "change", "project", "leadership", "vocation"] as const;
const situationSlugs: Record<(typeof situationKeys)[number], ProcessSlug> = {
  experience: "reinvencion-profesional",
  change: "transicion-laboral",
  project: "reinvencion-profesional",
  leadership: "reinvencion-profesional",
  vocation: "orientacion-vocacional",
};

function TopographicLines({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 620 360" fill="none" aria-hidden="true">
      <path d="M-40 289C74 222 142 335 261 269c111-62 199 10 307-71 51-38 81-91 112-139" />
      <path d="M-62 323C68 247 144 365 278 294c117-62 214 5 329-83 49-37 75-80 100-127" />
      <path d="M-18 255c104-61 165 46 271-18 107-65 191 1 295-70 55-37 91-94 124-151" />
      <path d="M16 216c88-48 144 44 236-12 100-61 183-4 281-67 60-39 101-102 137-164" />
      <path d="M51 180c72-35 121 37 198-9 92-56 171-9 262-64 62-38 109-103 148-169" />
    </svg>
  );
}

export function SendaHome() {
  const t = useTranslations("Home");
  const processT = useTranslations("Processes");

  return (
    <div className="senda-home overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <section className="senda-night flex min-h-[min(940px,100svh)] items-center border-b border-white/10 px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-20 lg:pt-28 xl:px-20">
        <UniverseField className="-right-[12%] left-auto w-[82%] text-[#89a9bd] opacity-30" />
        <div className="relative mx-auto grid w-full max-w-[1320px] gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="senda-coordinate-label text-[#d2b879]">{t("hero.eyebrow")}</p>
            <h1 className="mt-8 max-w-[12ch] text-pretty font-heading text-[clamp(3.35rem,6.7vw,7rem)] font-medium leading-[0.91] tracking-[-0.055em] text-[#f7f3eb]">
              {t("hero.title")}
            </h1>
            <div className="mt-9 max-w-xl border-l border-[#b86d54]/75 pl-5 sm:pl-7">
              <p className="whitespace-pre-line text-lg leading-8 text-[#f7f3eb]/86 sm:text-xl">{t("hero.rhythm")}</p>
              <p className="mt-5 text-[15px] leading-7 text-[#c7d0d7] sm:text-base">{t("hero.description")}</p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostico" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#f5f1e8] px-7 py-3.5 text-sm font-bold text-[#17263a] shadow-[0_20px_50px_-28px_rgba(0,0,0,.85)] hover:bg-white">
                {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="#procesos" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 text-sm font-bold text-[#f5f1e8] backdrop-blur-sm hover:border-white/55 hover:bg-white/[0.09]">
                {t("hero.secondaryCta")} <MoveDown className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] lg:justify-self-end">
            <div className="senda-image-frame aspect-square overflow-hidden rounded-[1.5rem] p-2 sm:rounded-[2rem] sm:p-3">
              <div className="relative h-full overflow-hidden rounded-[1.05rem] bg-[#f7f0e7] sm:rounded-[1.5rem]">
                <Image src="/illustrations/hero.png" alt={t("hero.imageAlt")} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
              </div>
            </div>
            <p className="mt-5 flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c1ccd3]">
              <span>{t("hero.caption")}</span>
              <span className="flex items-center gap-2" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-[#c2a366]" /> 34°36&apos;S · 58°22&apos;W</span>
            </p>
          </div>
        </div>
      </section>

      <section id="procesos" className="scroll-mt-24 px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="senda-reveal grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="senda-kicker">{t("processes.eyebrow")}</p>
              <h2 className="mt-5 max-w-[13ch] font-heading text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{t("processes.title")}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[var(--senda-muted)] lg:justify-self-end lg:text-xl">{t("processes.intro")}</p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[1.4rem] border border-[var(--senda-border)] bg-[var(--senda-border)] shadow-[0_32px_80px_-64px_rgba(10,20,34,.72)] lg:grid-cols-3">
            {sendaProcesses.map((process, index) => (
              <article key={process.slug} className="senda-process-card group relative flex min-h-[490px] flex-col overflow-hidden bg-[var(--senda-paper)] p-7 sm:p-9">
                <div className="absolute inset-x-5 top-14 h-44 overflow-hidden rounded-[0.95rem] bg-[#f4f1ea]">
                  <Image src={processIllustrations[index]} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="relative flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-muted)]">
                  <span>{process.number}</span>
                  <span>{processT(`items.${process.key}.duration`, { count: process.durationMeetings })}</span>
                </div>
                <div className="relative mt-auto pt-52">
                  <h3 className="max-w-[12ch] font-heading text-4xl leading-none tracking-[-0.035em] sm:text-[2.7rem]">{processT(`items.${process.key}.title`)}</h3>
                  <p className="mt-6 text-lg font-semibold leading-7 text-[var(--senda-ink)]">{processT(`items.${process.key}.lead`)}</p>
                  <p className="mt-4 text-[15px] leading-7 text-[var(--senda-muted)]">{processT(`items.${process.key}.cardDescription`)}</p>
                  <Link href={`/procesos/${process.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--senda-ink)] underline decoration-[var(--senda-terracotta)]/45 decoration-1 underline-offset-8 group-hover:decoration-[var(--senda-terracotta)]">
                    {t("processes.cta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="situaciones" className="scroll-mt-24 px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="senda-reveal max-w-3xl">
            <p className="senda-kicker">{t("situations.eyebrow")}</p>
            <h2 className="mt-5 max-w-[16ch] font-heading text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">{t("situations.title")}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--senda-muted)]">{t("situations.intro")}</p>
          </div>

          <div className="mt-16 border-t border-[var(--senda-border)]">
            {situationKeys.map((key, index) => {
              const process = getSendaProcess(situationSlugs[key]);

              return (
                <article
                  key={key}
                  className="senda-reveal grid gap-5 border-b border-[var(--senda-border)] py-9 sm:grid-cols-[3.5rem_1fr] sm:py-10"
                >
                  <span className="text-xs font-bold tracking-[0.18em] text-[var(--senda-terracotta)]">0{index + 1}</span>
                  <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
                    <div>
                      <h3 className="max-w-[28ch] font-heading text-2xl leading-[1.15] sm:text-3xl">{t(`situations.items.${key}.title`)}</h3>
                      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--senda-muted)]">{t(`situations.items.${key}.description`)}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <div className="text-sm text-[var(--senda-muted)] lg:text-right">
                        <p className="font-bold text-[var(--senda-ink)]">{t(`situations.items.${key}.serviceLabel`)}</p>
                        {process ? (
                          <p>{processT(`items.${process.key}.duration`, { count: process.durationMeetings })}</p>
                        ) : null}
                      </div>
                      {process ? (
                        <Link
                          href={`/procesos/${process.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--senda-ink)] underline decoration-[var(--senda-terracotta)]/45 decoration-1 underline-offset-8 hover:decoration-[var(--senda-terracotta)]"
                        >
                          {t("situations.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 md:pb-36 lg:px-12 xl:px-20">
        <div className="senda-night senda-reveal relative mx-auto grid max-w-[1280px] overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_36px_90px_-54px_rgba(6,14,25,.9)] lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <UniverseField compact className="left-[30%] text-[#89a9bd] opacity-20" />
          <div className="relative min-h-72 lg:min-h-full">
            <Image src="/illustrations/trust.png" alt="" fill loading="eager" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="relative px-7 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div className="relative max-w-3xl">
            <p className="senda-coordinate-label text-[#d2b879]">{t("bridge.eyebrow")}</p>
            <h2 className="mt-5 text-pretty font-heading text-4xl leading-[1.02] tracking-[-0.035em] text-[#f5f1e8] sm:text-6xl">{t("bridge.title")}</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#c8d1d7] sm:text-lg">{t("bridge.description")}</p>
          </div>
          <Link href="/diagnostico" className="relative mt-9 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#f5f1e8] px-7 py-3.5 text-sm font-bold text-[#17263a] hover:bg-white">
            {t("bridge.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 md:pb-36 lg:px-12 xl:px-20">
        <div className="senda-editorial-card senda-reveal mx-auto flex max-w-[1280px] flex-col items-start gap-8 rounded-[1.25rem] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div className="max-w-2xl">
            <p className="senda-kicker">{t("anchorTool.eyebrow")}</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">{t("anchorTool.title")}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--senda-muted)] sm:text-lg">{t("anchorTool.description")}</p>
          </div>
          <div className="flex w-full flex-col items-start gap-3 lg:w-auto lg:shrink-0 lg:items-end">
            <Link href="/diagnostico/ancla-de-carrera" className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-[var(--senda-ink)] px-7 py-3.5 text-sm font-bold text-[var(--senda-ink)] hover:bg-[var(--senda-ink)] hover:text-[var(--senda-paper)] sm:w-auto">
              {t("anchorTool.cta")} <Compass className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="text-xs text-[var(--senda-muted)]">{t("anchorTool.note")}</p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 border-y border-[var(--senda-border)] bg-[var(--senda-stone)] px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="senda-reveal max-w-3xl">
            <p className="senda-kicker">{t("method.eyebrow")}</p>
            <h2 className="mt-5 font-heading text-5xl leading-none tracking-[-0.04em] sm:text-7xl">{t("method.title")}</h2>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-3 shadow-[0_24px_60px_-42px_rgba(10,20,34,.55)]">
            <Image src="/illustrations/method.png" alt="" fill loading="eager" sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover p-3" />
          </div>
          <ol className="grid gap-0 border-t border-[var(--senda-ink)]/15 md:grid-cols-2">
            {howSteps.map((key, index) => (
              <li key={key} className="senda-reveal relative border-b border-[var(--senda-ink)]/15 py-9 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                <span className="text-xs font-bold tracking-[0.16em] text-[var(--senda-terracotta)]">0{index + 1}</span>
                <h3 className="mt-10 max-w-[13ch] font-heading text-3xl leading-[1.05]">{t(`method.steps.${key}.title`)}</h3>
                <p className="mt-5 text-[15px] leading-7 text-[var(--senda-muted)]">{t(`method.steps.${key}.description`)}</p>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="senda-reveal grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="senda-kicker">{t("territories.eyebrow")}</p>
              <h2 className="mt-5 font-heading text-5xl leading-none tracking-[-0.04em] sm:text-7xl">{t("territories.title")}</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[var(--senda-muted)] lg:justify-self-end">{t("territories.intro")}</p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] shadow-[0_24px_60px_-42px_rgba(10,20,34,.55)] lg:sticky lg:top-28">
            <Image src="/illustrations/paths.png" alt="" fill loading="eager" sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
          </div>
          <div className="border-t border-[var(--senda-border)]">
            {territories.map((key, index) => (
              <article key={key} className="senda-territory grid gap-4 border-b border-[var(--senda-border)] py-7 sm:grid-cols-[5rem_0.7fr_1.3fr] sm:items-center sm:py-9">
                <span className="text-xs font-bold tracking-[0.16em] text-[var(--senda-terracotta)]">0{index + 1}</span>
                <h3 className="font-heading text-3xl sm:text-4xl">{t(`territories.items.${key}.title`)}</h3>
                <p className="max-w-xl leading-7 text-[var(--senda-muted)] sm:justify-self-end">{t(`territories.items.${key}.description`)}</p>
              </article>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="senda-night px-5 py-28 text-[#f4efe4] sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <UniverseField compact className="left-[45%] text-[#89a9bd] opacity-20" />
        <div className="senda-reveal relative mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
          <Asterisk className="h-10 w-10 text-[var(--senda-terracotta)]" aria-hidden="true" />
          <blockquote className="mt-10 font-heading text-[clamp(2.5rem,5.5vw,5.6rem)] leading-[1.02] tracking-[-0.04em]">
            <p>{t("manifesto.first")}</p>
            <p className="mt-8 text-[#f4efe4]/62">{t("manifesto.second")}</p>
          </blockquote>
          </div>
          <div className="senda-image-frame relative aspect-square overflow-hidden rounded-[1.25rem] bg-[#f4f1ea] p-3">
            <Image src="/illustrations/services.png" alt="" fill loading="eager" sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover p-3" />
          </div>
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-24 px-5 py-24 sm:px-8 md:py-36 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="senda-reveal lg:sticky lg:top-32 lg:self-start">
            <p className="senda-kicker">{t("faq.eyebrow")}</p>
            <h2 className="mt-5 font-heading text-5xl leading-none tracking-[-0.04em] sm:text-6xl">{t("faq.title")}</h2>
            <p className="mt-6 max-w-md leading-7 text-[var(--senda-muted)]">{t("faq.intro")}</p>
          </div>
          <div className="border-t border-[var(--senda-border)]">
            {faqs.map((key, index) => (
              <details key={key} className="senda-faq group border-b border-[var(--senda-border)]">
                <summary className="flex cursor-pointer list-none items-center gap-5 py-7 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-xs font-bold text-[var(--senda-terracotta)]">0{index + 1}</span>
                  <span className="flex-1 font-heading text-2xl leading-tight sm:text-3xl">{t(`faq.items.${key}.question`)}</span>
                  <span className="relative h-5 w-5 shrink-0" aria-hidden="true"><span className="absolute left-0 top-1/2 h-px w-5 bg-current" /><span className="absolute left-1/2 top-0 h-5 w-px bg-current transition-transform group-open:rotate-90 group-open:opacity-0" /></span>
                </summary>
                <p className="max-w-2xl pb-8 pl-10 text-base leading-8 text-[var(--senda-muted)] sm:pl-12">{t(`faq.items.${key}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="senda-night relative mx-auto flex min-h-[580px] max-w-[1380px] items-end overflow-hidden rounded-[1.5rem] border border-white/10 px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-20">
          <TopographicLines className="absolute -right-24 -top-12 h-[42rem] w-[70rem] stroke-[#89a9bd] opacity-[0.2] [&_path]:stroke-[1]" />
          <UniverseField compact className="left-[38%] text-[#c2a366] opacity-15" />
          <div className="senda-reveal relative min-w-0 w-full max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t("final.eyebrow")}</p>
            <h2 className="mt-6 max-w-[15ch] font-heading text-[clamp(3rem,6.8vw,6.8rem)] leading-[0.92] tracking-[-0.05em]">{t("final.title")}</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/78">{t("final.description")}</p>
            <Link href="/diagnostico" className="mt-9 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--senda-action)] px-7 py-3.5 text-sm font-bold text-white hover:bg-[var(--senda-action-hover)]">
              {t("final.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
