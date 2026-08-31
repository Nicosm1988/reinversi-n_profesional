import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SendaLogo } from "@/components/brand/senda-logo";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";
import { CONTACT_EMAIL } from "@/lib/contact-config";

const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`;

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="senda-night border-t border-[var(--senda-atmosphere-border)] px-5 pb-8 pt-16 text-[var(--senda-atmosphere-ink)] sm:px-8 md:pt-24 lg:px-12 xl:px-20">
      <UniverseField compact className="left-[48%] text-[var(--senda-atmosphere-sky)] opacity-15" />
      <div className="relative mx-auto max-w-[1470px]">
        <div className="grid gap-14 border-b border-[var(--senda-atmosphere-border)] pb-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:pb-20">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={t("homeLabel")}>
              <SendaLogo className="senda-logo--footer text-[var(--senda-atmosphere-ink)]" />
            </Link>
            <p className="mt-8 max-w-lg font-heading text-3xl leading-[1.15] text-[var(--senda-atmosphere-ink)] sm:text-4xl">{t("statement")}</p>
            <a href={GMAIL_COMPOSE_URL} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--senda-atmosphere-muted)] hover:text-[var(--senda-atmosphere-ink)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]">
              {CONTACT_EMAIL} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label={t("processNavigation")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">{t("colProcesses")}</h2>
            <ul className="mt-7 space-y-4 text-sm font-semibold text-[var(--senda-atmosphere-muted)]">
              <li><Link href="/transiciones-laborales/explorar-direccion" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceDirection")}</Link></li>
              <li><Link href="/transiciones-laborales/cambiar-empleo" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceJobChange")}</Link></li>
              <li><Link href="/transiciones-laborales/proyecto-propio" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceProject")}</Link></li>
              <li><Link href="/transiciones-laborales/transicion-a-otro-rol" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceRoleTransition")}</Link></li>
              <li><Link href="/transiciones-laborales/desafio-puntual" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceFocused")}</Link></li>
              <li><Link href="/transiciones-laborales/elegir-formacion" className="hover:text-[var(--senda-atmosphere-ink)]">{t("serviceEducation")}</Link></li>
              <li className="border-t border-[var(--senda-atmosphere-border)] pt-4"><Link href="/brujulas" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkCompass")}</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">{t("colExplore")}</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--senda-atmosphere-muted)]">{t("exploreDescription")}</p>
            <div className="mt-7 flex flex-col gap-3">
              <Link
                href="/test-anclas-de-carrera"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-6 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]"
              >
                {t("linkCareerAnchor")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/encontrar-mi-recorrido"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] px-6 py-3 text-sm font-bold text-[var(--senda-atmosphere-ink)] backdrop-blur-sm transition-colors hover:bg-[var(--senda-atmosphere-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]"
              >
                {t("linkInitialDiagnostic")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-8 text-xs leading-6 text-[var(--senda-atmosphere-muted)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <nav aria-label={t("siteNavigation")}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link href="/sobre-mi" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkAbout")}</Link></li>
              <li><Link href="/como-trabajamos" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkHow")}</Link></li>
              <li><Link href="/preguntas-frecuentes" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkFaq")}</Link></li>
              <li><Link href="/contacto" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkContact")}</Link></li>
              <li><Link href="/privacidad" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkPrivacy")}</Link></li>
              <li><Link href="/terminos" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkTerms")}</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
