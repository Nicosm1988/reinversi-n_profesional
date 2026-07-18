"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, X, ArrowRight } from "lucide-react";

export function TherapyFloat() {
  const t = useTranslations("TherapyFloat");

  const [visible, setVisible] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        setBubbleOpen(false);
      }
    }

    if (bubbleOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bubbleOpen]);

  if (!visible) return null;

  return (
        <div className="fixed bottom-6 left-6 z-50" ref={bubbleRef}>
            {bubbleOpen && (
              <div className="absolute bottom-16 left-0 w-72 sm:w-80 bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
                <div className="bg-muted px-5 py-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 fill-[#e47c56] text-[#e47c56]" />
                    <span className="text-sm font-semibold text-primary">{t("header")}</span>
                  </div>
                  <button
                    onClick={() => setBubbleOpen(false)}
                    className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                    aria-label={t("closeLabel")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-sm text-foreground font-medium leading-relaxed">{t("title")}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("description")}</p>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {t("featureDuration")}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {t("featurePrice")}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {t("featureConfidentiality")}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link
                    href="/terapia"
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#a84729] bg-[#bd5734] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a84729]"
                    onClick={() => setBubbleOpen(false)}
                  >
                    {t("cta")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
              </div>
            )}

          <div>
            <button
              onClick={() => setBubbleOpen(!bubbleOpen)}
              className="group flex items-center gap-2.5 rounded-full border-2 border-[#a84729] bg-[#bd5734] py-2.5 pl-4 pr-5 text-white shadow-[4px_4px_0_0_rgba(47,54,71,0.9)] transition-all duration-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#a84729] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84729]/50 focus-visible:ring-offset-2"
              aria-label={bubbleOpen ? t("floatClose") : t("floatOpen")}
            >
              <span className="flex items-center justify-center">
                <Heart className="w-[18px] h-[18px] fill-current" />
              </span>

              <span className="text-sm font-semibold whitespace-nowrap">
                {bubbleOpen ? t("floatClose") : t("floatOpen")}
              </span>
            </button>
          </div>
        </div>
  );
}
