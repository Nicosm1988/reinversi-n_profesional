"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCookies } from "@/lib/cookie-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        disabled ? "bg-primary/30 cursor-default" : checked ? "bg-secondary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function CategoryItem({
  title,
  description,
  checked,
  onChange,
  alwaysActive,
  alwaysActiveLabel,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  alwaysActive?: boolean;
  alwaysActiveLabel: string;
}) {
  return (
    <div className="py-5 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-heading font-semibold text-foreground">{title}</h4>
        {alwaysActive ? (
          <span className="text-sm font-semibold text-foreground">{alwaysActiveLabel}</span>
        ) : (
          <Toggle checked={checked} onChange={onChange} label={title} />
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const { showBanner, acceptAll, rejectAll, savePreferences, preferences } = useCookies();

  const [showPreferences, setShowPreferences] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleOpenPreferences = () => {
    setLocalPrefs(preferences);
    setShowPreferences(true);
  };

  const handleConfirmPreferences = () => {
    savePreferences(localPrefs);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
        <div
          className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center p-3 sm:justify-end sm:p-5"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          <div role="region" aria-label={t("title")} className="senda-editorial-card senda-cookie-card pointer-events-auto max-h-[68svh] w-full max-w-md overscroll-contain overflow-y-auto rounded-[1.2rem] text-card-foreground shadow-[0_28px_74px_-30px_rgba(10,20,34,.72)] sm:max-h-[72vh] dark:border-white/15 dark:shadow-[0_28px_74px_-30px_rgba(0,0,0,.88)]">
            {!showPreferences ? (
              <div className="p-4 sm:p-5 md:p-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">{t("title")}</h3>
                  <button
                    onClick={rejectAll}
                    className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label={t("closeLabel")}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <p className="mb-4 text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-relaxed">{t("description")}</p>

                <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={rejectAll}
                    className="h-10 rounded-full px-3 text-xs font-semibold sm:h-11 sm:px-6 sm:text-sm dark:border-white/20 dark:bg-white/5 dark:text-[#f6efe7] dark:hover:bg-white/10"
                  >
                    {t("rejectCookies")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={acceptAll}
                    className="h-10 rounded-full px-3 text-xs font-semibold sm:h-11 sm:px-6 sm:text-sm"
                  >
                    {t("acceptCookies")}
                  </Button>
                </div>

                <button onClick={handleOpenPreferences} className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-sm dark:text-[#cf8a70]">
                  {t("managePreferences")}
                </button>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-bold text-foreground">{t("preferencesTitle")}</h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    aria-label={t("closeLabel")}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <CategoryItem
                  title={t("essentialTitle")}
                  description={t("essentialDesc")}
                  checked
                  onChange={() => {}}
                  alwaysActive
                  alwaysActiveLabel={t("alwaysActive")}
                />

                <CategoryItem
                  title={t("marketingTitle")}
                  description={t("marketingDesc")}
                  checked={localPrefs.marketing}
                  onChange={(v) => setLocalPrefs({ ...localPrefs, marketing: v })}
                  alwaysActiveLabel={t("alwaysActive")}
                />

                <CategoryItem
                  title={t("personalizationTitle")}
                  description={t("personalizationDesc")}
                  checked={localPrefs.personalization}
                  onChange={(v) => setLocalPrefs({ ...localPrefs, personalization: v })}
                  alwaysActiveLabel={t("alwaysActive")}
                />

                <CategoryItem
                  title={t("analyticsTitle")}
                  description={t("analyticsDesc")}
                  checked={localPrefs.analytics}
                  onChange={(v) => setLocalPrefs({ ...localPrefs, analytics: v })}
                  alwaysActiveLabel={t("alwaysActive")}
                />

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="secondary"
                    onClick={handleConfirmPreferences}
                    className="rounded-full px-6 h-11 font-semibold w-full"
                  >
                    {t("confirmPreferences")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
  );
}
