import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InitialDiagnosticForm } from "@/components/diagnostic/initial-diagnostic-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("InitialDiagnostic");
  return {
    title: `${t("meta.title")} | Senda`,
    description: t("meta.description"),
  };
}

export default async function DiagnosticoPage() {
  const t = await getTranslations("InitialDiagnostic");

  return (
    <div className="initial-diagnostic-page relative overflow-hidden bg-[var(--senda-bg)] px-5 pb-24 pt-36 text-[var(--senda-ink)] sm:px-8 md:pb-36 md:pt-44 lg:px-12 xl:px-20">
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_88%_8%,rgba(155,118,91,.18),transparent_31%),radial-gradient(circle_at_7%_40%,rgba(73,84,61,.12),transparent_27%)]" />
      <svg className="pointer-events-none absolute -right-64 top-5 h-[35rem] w-[58rem] stroke-[var(--senda-olive)] opacity-[0.12]" viewBox="0 0 700 420" fill="none" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <path key={line} d={`M-20 ${355 - line * 38}c114-77 207 42 324-34 108-70 197 14 303-67 57-43 91-103 126-163`} />
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <p className="senda-kicker">{t("eyebrow")}</p>
          <h1 className="mt-6 max-w-[10ch] font-heading text-[clamp(3.7rem,6.6vw,6.8rem)] leading-[0.9] tracking-[-0.05em]">{t("title")}</h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[var(--senda-muted)]">{t("description")}</p>
          <div className="mt-9 max-w-md border-l border-[var(--senda-terracotta)]/55 pl-5 text-sm leading-7 text-[var(--senda-muted)]">
            <p>{t("disclaimer")}</p>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[var(--senda-border)] bg-[#faf7ef]/92 p-6 shadow-[0_38px_90px_-68px_rgba(37,42,32,.72)] backdrop-blur-sm sm:p-9 lg:p-12">
          <InitialDiagnosticForm />
        </div>
      </div>
    </div>
  );
}
