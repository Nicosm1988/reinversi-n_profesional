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
      data-state={mounted ? (isDark ? "dark" : "light") : "loading"}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--senda-border)] bg-[var(--senda-paper)] text-[var(--senda-ink)] shadow-[0_10px_24px_-20px_rgba(10,20,34,.65)] transition-[color,background-color,border-color,box-shadow] hover:bg-[var(--senda-stone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-bg)] disabled:cursor-wait disabled:opacity-70"
    >
      <Moon aria-hidden="true" className="h-[18px] w-[18px] dark:hidden" />
      <Sun aria-hidden="true" className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}
