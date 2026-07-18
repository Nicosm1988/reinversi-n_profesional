"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCookies } from "@/lib/cookie-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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
          <Toggle checked={checked} onChange={onChange} />
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
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 pointer-events-none sm:justify-end sm:p-5">
          <div className="pointer-events-auto w-full max-w-md max-h-[72vh] overflow-y-auto rounded-2xl border border-border bg-white shadow-[0_24px_70px_-28px_rgba(23,59,49,.5)]">
            {!showPreferences ? (
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-heading font-bold text-foreground">{t("title")}</h3>
                  <button
                    onClick={rejectAll}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("closeLabel")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{t("description")}</p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Button
                    variant="outline"
                    onClick={rejectAll}
                    className="rounded-full px-6 h-11 font-semibold"
                  >
                    {t("rejectCookies")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={acceptAll}
                    className="rounded-full px-6 h-11 font-semibold"
                  >
                    {t("acceptCookies")}
                  </Button>
                </div>

                <button onClick={handleOpenPreferences} className="text-sm text-primary font-medium hover:underline">
                  {t("managePreferences")}
                </button>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-bold text-foreground">{t("preferencesTitle")}</h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("closeLabel")}
                  >
                    <X className="h-5 w-5" />
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
