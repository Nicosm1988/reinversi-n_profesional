import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

function RouteMap() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[31rem]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 400" fill="none">
        <ellipse cx="250" cy="200" rx="212" ry="112" className="senda-routemap__ring senda-routemap__ring--one [stroke:var(--senda-atmosphere-line)]" />
        <ellipse cx="250" cy="200" rx="156" ry="176" className="senda-routemap__ring senda-routemap__ring--two opacity-60 [stroke:var(--senda-atmosphere-line)]" transform="rotate(38 250 200)" />
        <g className="senda-routemap__path-group">
          <path d="M48 294C136 244 177 310 264 225c66-64 117-71 190-121" className="opacity-55 [stroke:var(--senda-atmosphere-gold)]" />
          <path d="M65 330C161 273 207 344 303 253c58-55 102-65 154-97" className="opacity-60 [stroke:var(--senda-atmosphere-line)]" strokeDasharray="4 9" />
          <circle cx="125" cy="276" r="6" className="[fill:var(--senda-atmosphere-accent)]" />
          <circle cx="264" cy="225" r="8" className="[fill:var(--senda-atmosphere-gold)]" />
          <circle cx="407" cy="135" r="5" className="[fill:var(--senda-atmosphere-sky)]" />
        </g>
      </svg>
      <span className="absolute left-[18%] top-[64%] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">01 · 34°36&apos;S</span>
      <span className="absolute right-[8%] top-[26%] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">02 · 58°22&apos;W</span>
    </div>
  );
}

export function SendaHome() {
  const t = useTranslations("Home");

  return (
    <div className="senda-home overflow-hidden bg-[var(--senda-bg)] text-[var(--senda-ink)]">
      <section className="senda-night border-b border-[var(--senda-atmosphere-border)] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-28 xl:px-20">
        <UniverseField className="left-[28%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <div className="relative mx-auto grid w-full max-w-[1240px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <h1 className="max-w-[17ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[var(--senda-atmosphere-ink)]">
              {t("hero.title")}{" "}
              <br />
              <span className="font-bold text-[clamp(2.75rem,5.8vw,4.5rem)]">{t("hero.titleAccent")}</span>
            </h1>
            <div className="mt-7 max-w-2xl border-l border-[var(--senda-atmosphere-accent)] pl-5 sm:pl-7">
              <p className="text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg sm:leading-8">
                {t.rich("hero.description", { strong: (chunks) => <strong className="font-bold text-[var(--senda-atmosphere-ink)]">{chunks}</strong> })}
              </p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/test-anclas-de-carrera" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] shadow-[0_20px_50px_-28px_rgba(0,0,0,.55)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]">
                {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/transiciones-laborales" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-ink)] backdrop-blur-sm transition-colors hover:bg-[var(--senda-atmosphere-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
                {t("hero.secondaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <RouteMap />
        </div>
      </section>

      {/* Finder (orientación inicial /encontrar-mi-recorrido), situations, method y laboratorio:
          retirados de la home a pedido del cliente. El botón "Reconocer en qué momento estoy" se
          saca de toda la web; el finder se revisa con preguntas nuevas antes de volver a mostrarse.
          Los componentes y las rutas siguen disponibles para reactivarlos más adelante. */}

      <section className="border-y border-[var(--senda-border)] bg-[var(--senda-section-warm)] px-5 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <p className="senda-kicker">{t("compass.eyebrow")}</p>
          <div>
            <h2 className="max-w-[20ch] text-pretty font-heading text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("compass.title")}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--senda-muted)] sm:text-lg">
              {t.rich("compass.description", { strong: (chunks) => <strong className="font-bold text-[var(--senda-ink)]">{chunks}</strong> })}
            </p>
            <Link href="/brujulas" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-action)] px-7 py-3 text-sm font-bold text-white hover:bg-[var(--senda-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-accent)]">
              {t("compass.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="senda-night relative mx-auto max-w-[1180px] overflow-hidden rounded-[1.5rem] border border-[var(--senda-atmosphere-border)] px-7 py-14 text-[var(--senda-atmosphere-ink)] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <UniverseField compact className="left-[38%] text-[var(--senda-atmosphere-sky)] opacity-20" />
          <div className="relative mx-auto max-w-3xl">
            <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{t("final.eyebrow")}</p>
            <h2 className="mt-6 max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{t("final.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg">
              {t.rich("final.description", { strong: (chunks) => <strong className="font-bold text-[var(--senda-atmosphere-ink)]">{chunks}</strong> })}
            </p>
            <Link href="/contacto" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
              {t("final.secondaryCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
