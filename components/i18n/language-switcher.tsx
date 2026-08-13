"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/navigation";
import { cn } from "@/lib/utils";

const languages = [
  { locale: "es", shortLabel: "ES", translationKey: "spanish" },
  { locale: "en", shortLabel: "EN", translationKey: "english" },
] as const;

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const t = useTranslations("LanguageSwitcher");
  const query = searchParams.toString();
  const currentHref = `${pathname}${query ? `?${query}` : ""}${hash}`;

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  return (
    <nav
      aria-label={t("label")}
      className="inline-flex items-center rounded-full border border-[#ccd2d5] bg-[#fbf9f4] p-1 shadow-[0_10px_24px_-20px_rgba(10,20,34,.65)] dark:border-white/15 dark:bg-white/10"
    >
      {languages.map((language) => {
        const isActive = locale === language.locale;

        return (
          <Link
            key={language.locale}
            href={currentHref}
            locale={language.locale}
            hrefLang={language.locale}
            aria-current={isActive ? "page" : undefined}
            aria-label={t(language.translationKey)}
            className={cn(
              "inline-flex min-h-8 items-center justify-center rounded-full px-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b86d54] focus-visible:ring-offset-2",
              isActive
                ? "bg-[#17263a] text-[#fbf9f4] dark:bg-[#f5f1e8] dark:text-[#17263a]"
                : "text-[#667281] hover:bg-[#e8eceb] hover:text-[#17263a] dark:text-[#d8e0e5] dark:hover:bg-white/10 dark:hover:text-white",
              compact ? "min-w-8 px-2" : "min-w-9",
            )}
          >
            {language.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
