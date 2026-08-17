"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link, usePathname } from "@/navigation";

const DELAY_MS = 30_000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const LAST_SHOWN_KEY = "reinvencion_career_anchor_popup_last_shown";
const COMPLETED_KEY = "reinvencion_career_anchor_completed";
const EXCLUDED_PATHS = [
  "/encontrar-mi-recorrido",
  "/test-anclas-de-carrera",
  "/diagnostico/ancla-de-carrera",
  "/diagnostico/ancla-de-carrera/test",
  "/laboratorio-narrativas-laborales-alternativas",
  "/laboratorio-nuevas-narrativas",
];

export function ProcessPopup() {
  const t = useTranslations("ProcessPopup");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isExcludedPath = EXCLUDED_PATHS.includes(pathname);

  useEffect(() => {
    if (visible || isExcludedPath) return;

    const lastShown = window.localStorage.getItem(LAST_SHOWN_KEY);
    if (lastShown && Date.now() - Number(lastShown) < SEVEN_DAYS_MS) return;
    if (window.localStorage.getItem(COMPLETED_KEY)) return;

    const timer = setTimeout(() => {
      window.localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname, isExcludedPath, visible]);

  const shouldRender = visible && !isExcludedPath;

  useEffect(() => {
    if (shouldRender) closeButtonRef.current?.focus();
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center p-3 sm:justify-end sm:p-5">
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t("title")}
        className="senda-editorial-card pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-[1.2rem] p-5 text-[var(--senda-ink)] shadow-[0_28px_74px_-32px_rgba(20,14,30,.72)] duration-300 motion-reduce:animate-none sm:p-6 dark:border-white/15 dark:shadow-[0_28px_74px_-32px_rgba(10,6,16,.9)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-2xl leading-tight tracking-[-0.02em]">{t("title")}</h3>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setVisible(false)}
            aria-label={t("closeLabel")}
            className="shrink-0 rounded-md text-[var(--senda-muted)] transition-colors hover:text-[var(--senda-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-[var(--senda-muted)]">{t("description")}</p>
        <div className="mt-6">
          <Link
            href="/test-anclas-de-carrera"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--senda-ink)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--senda-olive)] dark:bg-[#f5f2f7] dark:text-[#1d172c] dark:hover:bg-white"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
