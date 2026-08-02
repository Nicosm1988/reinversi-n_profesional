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
      className="inline-flex items-center rounded-full border border-[#d3c0ad] bg-[#fffaf4] p-1 dark:border-white/15 dark:bg-white/10"
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
              "inline-flex min-h-8 items-center justify-center rounded-full px-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e47c56] focus-visible:ring-offset-2",
              isActive
                ? "bg-[#2f3647] text-[#fffaf4] dark:bg-[#f6efe7] dark:text-[#2f3647]"
                : "text-[#6a7080] hover:bg-[#f0e3d5] hover:text-[#2f3647] dark:text-[#ddd5cc] dark:hover:bg-white/10 dark:hover:text-white",
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
