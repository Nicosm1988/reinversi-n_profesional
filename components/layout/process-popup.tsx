"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link, usePathname } from "@/navigation";

const DELAY_MS = 30_000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const LAST_SHOWN_KEY = "reinvencion_career_anchor_popup_last_shown";
const COMPLETED_KEY = "reinvencion_career_anchor_completed";
const EXCLUDED_PATHS = ["/diagnostico/ancla-de-carrera", "/diagnostico/ancla-de-carrera/test"];

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

  useEffect(() => {
    if (visible && isExcludedPath) setVisible(false);
  }, [visible, isExcludedPath]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 sm:justify-end sm:p-5">
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t("title")}
        className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-[1.75rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-6 text-[var(--senda-ink)] shadow-[0_24px_70px_-28px_rgba(23,59,49,.5)] duration-300 motion-reduce:animate-none dark:border-white/15 dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,.85)]"
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
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-[var(--senda-muted)]">{t("description")}</p>
        <div className="mt-6">
          <Link
            href="/diagnostico/ancla-de-carrera"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--senda-ink)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--senda-olive)] dark:bg-[#f4efe4] dark:text-[#272b23] dark:hover:bg-white"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
