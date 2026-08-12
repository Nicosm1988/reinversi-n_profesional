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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ccd2d5] bg-[#fbf9f4] text-[#17263a] shadow-[0_10px_24px_-20px_rgba(10,20,34,.65)] transition-colors hover:bg-[#e8eceb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b86d54] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf9f4] dark:border-white/15 dark:bg-white/10 dark:text-[#f5f1e8] dark:hover:bg-white/15 dark:focus-visible:ring-[#cf8a70] dark:focus-visible:ring-offset-[#0d1725]"
    >
      {isDark ? <Sun aria-hidden="true" className="h-[18px] w-[18px]" /> : <Moon aria-hidden="true" className="h-[18px] w-[18px]" />}
    </button>
  );
}
