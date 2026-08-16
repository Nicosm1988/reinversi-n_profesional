"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

const THEME_COLORS = {
  light: "#f4f1ea",
  dark: "#0d1725",
} as const;

function ResolvedThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    const themeColor = THEME_COLORS[resolvedTheme];
    const elements = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    elements.forEach((element) => {
      element.content = themeColor;
      element.removeAttribute("media");
    });
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme
      disableTransitionOnChange
    >
      <ResolvedThemeColor />
      {children}
    </NextThemesProvider>
  );
}
