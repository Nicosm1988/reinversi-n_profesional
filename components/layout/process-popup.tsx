"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link, usePathname } from "@/navigation";

const POPUP_DELAY_MS = 30_000;

export function ProcessPopup() {
  const t = useTranslations("ProcessPopup");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const isContactPage = pathname === "/contacto";

  useEffect(() => {
    setVisible(false);
    if (isContactPage) return;
    const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, isContactPage]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 sm:justify-end sm:p-5">
      <div
        role="dialog"
        aria-label={t("title")}
        className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-[1.75rem] border border-[var(--senda-border)] bg-[var(--senda-paper)] p-6 text-[var(--senda-ink)] shadow-[0_24px_70px_-28px_rgba(23,59,49,.5)] duration-300 motion-reduce:animate-none dark:border-white/15 dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,.85)]"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="senda-kicker">{t("eyebrow")}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label={t("closeLabel")}
            className="rounded-md text-[var(--senda-muted)] transition-colors hover:text-[var(--senda-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h3 className="mt-3 font-heading text-2xl leading-tight tracking-[-0.02em]">{t("title")}</h3>
        <p className="mt-3 text-[15px] leading-7 text-[var(--senda-muted)]">{t("description")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contacto"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--senda-ink)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--senda-olive)] dark:bg-[#f4efe4] dark:text-[#272b23] dark:hover:bg-white"
          >
            {t("cta")}
          </Link>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--senda-ink)]/25 px-6 py-2.5 text-sm font-semibold text-[var(--senda-ink)] hover:border-[var(--senda-ink)]/60 dark:border-white/25 dark:text-[#f6efe7]"
          >
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
