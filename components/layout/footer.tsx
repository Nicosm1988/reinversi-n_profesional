import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { SendaLogo } from "@/components/brand/senda-logo";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";
import { CONTACT_EMAIL } from "@/lib/contact-config";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="senda-night border-t border-[var(--senda-atmosphere-border)] px-5 pb-8 pt-16 text-[var(--senda-atmosphere-ink)] sm:px-8 md:pt-24 lg:px-12 xl:px-20">
      <UniverseField compact className="left-[48%] text-[var(--senda-atmosphere-sky)] opacity-15" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="grid gap-14 border-b border-[var(--senda-atmosphere-border)] pb-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:pb-20">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={t("homeLabel")}>
              <SendaLogo className="senda-logo--footer text-[var(--senda-atmosphere-ink)]" />
            </Link>
            <p className="mt-8 max-w-lg font-heading text-3xl leading-[1.15] text-[var(--senda-atmosphere-ink)] sm:text-4xl">{t("statement")}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--senda-atmosphere-muted)] hover:text-[var(--senda-atmosphere-ink)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--senda-atmosphere-ring-offset)]">
              {CONTACT_EMAIL} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label={t("processNavigation")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">{t("colProcesses")}</h2>
            <ul className="mt-7 space-y-4 text-sm font-semibold text-[var(--senda-atmosphere-muted)]">
              <li><Link href="/recorridos" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkJourneys")}</Link></li>
              <li><Link href="/recorridos/brujula" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkCompass")}</Link></li>
              <li><Link href="/recorridos/nueva-etapa-profesional" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkNewStage")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("siteNavigation")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--senda-atmosphere-muted)]">{t("colExplore")}</h2>
            <ul className="mt-7 space-y-4 text-sm font-semibold text-[var(--senda-atmosphere-muted)]">
              <li><Link href="/sobre-mi" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkAbout")}</Link></li>
              <li><Link href="/como-trabajamos" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkHow")}</Link></li>
              <li><Link href="/equipo" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkTeam")}</Link></li>
              <li><Link href="/laboratorio-nuevas-narrativas" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkLaboratory")}</Link></li>
              <li><Link href="/preguntas-frecuentes" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkFaq")}</Link></li>
              <li><Link href="/contacto" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkContact")}</Link></li>
              <li><Link href="/privacidad" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkPrivacy")}</Link></li>
              <li><Link href="/terminos" className="hover:text-[var(--senda-atmosphere-ink)]">{t("linkTerms")}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="grid gap-7 py-8 text-xs leading-6 text-[var(--senda-atmosphere-muted)] md:grid-cols-[1fr_2fr] md:items-start">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="md:text-right"><strong className="font-semibold text-[var(--senda-atmosphere-ink)]">{t("disclaimerTitle")}</strong> {t("disclaimerText")}</p>
        </div>
      </div>
    </footer>
  );
}
