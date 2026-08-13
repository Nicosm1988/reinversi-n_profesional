import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="senda-night border-t border-white/10 px-5 pb-8 pt-16 text-[#f4efe4] sm:px-8 md:pt-24 lg:px-12 xl:px-20">
      <UniverseField compact className="left-[48%] text-[#89a9bd] opacity-15" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="grid gap-14 border-b border-white/12 pb-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:pb-20">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={t("homeLabel")}>
              <span className="senda-orbit-mark h-10 w-10 text-white/60" aria-hidden="true" />
              <span className="font-heading text-3xl">Senda</span>
            </Link>
            <p className="mt-8 max-w-lg font-heading text-3xl leading-[1.15] text-[#f4efe4]/90 sm:text-4xl">{t("statement")}</p>
            <a href="mailto:contacto@senda.com" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#f4efe4]/80 hover:text-white">
              contacto@senda.com <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label={t("processNavigation")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]/80">{t("colProcesses")}</h2>
            <ul className="mt-7 space-y-4 text-sm font-semibold text-[#f4efe4]/85">
              <li><Link href="/procesos/brujula" className="hover:text-white">{t("linkCompass")}</Link></li>
              <li><Link href="/procesos/nueva-etapa-profesional" className="hover:text-white">{t("linkNewStage")}</Link></li>
              <li><Link href="/diagnostico" className="text-[#e4a285] hover:text-white">{t("linkInitialDiagnostic")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("siteNavigation")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]/80">{t("colExplore")}</h2>
            <ul className="mt-7 space-y-4 text-sm font-semibold text-[#f4efe4]/85">
              <li><Link href="/#como-funciona" className="hover:text-white">{t("linkHow")}</Link></li>
              <li><Link href="/#preguntas" className="hover:text-white">{t("linkFaq")}</Link></li>
              <li><Link href="/diagnostico/ancla-de-carrera" className="hover:text-white">{t("linkCareerAnchor")}</Link></li>
              <li><Link href="/privacidad" className="hover:text-white">{t("linkPrivacy")}</Link></li>
              <li><Link href="/terminos" className="hover:text-white">{t("linkTerms")}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="grid gap-7 py-8 text-xs leading-6 text-[#f4efe4]/80 md:grid-cols-[1fr_2fr] md:items-start">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="md:text-right"><strong className="font-semibold text-[#f4efe4]/95">{t("disclaimerTitle")}</strong> {t("disclaimerText")}</p>
        </div>
      </div>
    </footer>
  );
}
