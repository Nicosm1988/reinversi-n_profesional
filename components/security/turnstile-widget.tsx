"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          language?: string;
          theme?: "auto" | "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | undefined) => void;
  onErrorChange?: (hasError: boolean) => void;
  className?: string;
  action?: string;
  language?: string;
  theme?: "auto" | "light" | "dark";
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileWidget({
  onTokenChange,
  onErrorChange,
  className,
  action,
  language = "auto",
  theme = "auto",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    onTokenChange(undefined);
    onErrorChange?.(false);
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      language,
      theme,
      callback: (token) => {
        onErrorChange?.(false);
        onTokenChange(token);
      },
      "expired-callback": () => onTokenChange(undefined),
      "error-callback": () => {
        onTokenChange(undefined);
        onErrorChange?.(true);
      },
    });

    return () => {
      if (!widgetIdRef.current || !window.turnstile) {
        return;
      }
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [action, language, onErrorChange, onTokenChange, scriptReady, theme]);

  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div id={`turnstile-${id}`} ref={containerRef} className={className} />
    </>
  );
}
