"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? t("light") : t("dark");

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d3c0ad] bg-[#fffaf4] text-[#2f3647] transition-colors hover:bg-[#f0e3d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e47c56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf4] dark:border-white/15 dark:bg-white/10 dark:text-[#f6efe7] dark:hover:bg-white/15 dark:focus-visible:ring-[#f0a27f] dark:focus-visible:ring-offset-[#242a38]"
    >
      {isDark ? <Sun aria-hidden="true" className="h-[18px] w-[18px]" /> : <Moon aria-hidden="true" className="h-[18px] w-[18px]" />}
    </button>
  );
}
