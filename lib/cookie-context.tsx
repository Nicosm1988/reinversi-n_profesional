"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CookiePreferences {
  essential: boolean;
  marketing: boolean;
  personalization: boolean;
  analytics: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<CookiePreferences>) => void;
  hasConsent: (category: keyof CookiePreferences) => boolean;
}

const STORAGE_KEY = "reinvencion_cookie_prefs";
const CONSENT_KEY = "reinvencion_cookie_consent";

const defaultPreferences: CookiePreferences = {
  essential: true,
  marketing: true,
  personalization: true,
  analytics: false,
};

function getInitialCookieState() {
  if (typeof window === "undefined") {
    return {
      preferences: defaultPreferences,
      hasConsented: true,
      showBanner: false,
    };
  }

  const consent = localStorage.getItem(CONSENT_KEY) === "true";
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!consent) {
    return {
      preferences: defaultPreferences,
      hasConsented: false,
      showBanner: true,
    };
  }

  if (!saved) {
    return {
      preferences: defaultPreferences,
      hasConsented: true,
      showBanner: false,
    };
  }

  try {
    const parsed = JSON.parse(saved) as CookiePreferences;
    return {
      preferences: { ...parsed, essential: true },
      hasConsented: true,
      showBanner: false,
    };
  } catch {
    return {
      preferences: defaultPreferences,
      hasConsented: true,
      showBanner: false,
    };
  }
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }) {
  const initial = getInitialCookieState();

  const [preferences, setPreferences] = useState<CookiePreferences>(initial.preferences);
  const [hasConsented, setHasConsented] = useState(initial.hasConsented);
  const [showBanner, setShowBanner] = useState(initial.showBanner);

  const persist = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(CONSENT_KEY, "true");
    setPreferences(prefs);
    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAll = () => {
    persist({
      essential: true,
      marketing: true,
      personalization: true,
      analytics: true,
    });
  };

  const rejectAll = () => {
    persist({
      essential: true,
      marketing: false,
      personalization: false,
      analytics: false,
    });
  };

  const savePreferences = (prefs: Partial<CookiePreferences>) => {
    const merged = { ...preferences, ...prefs, essential: true };
    persist(merged);
  };

  const hasConsent = (category: keyof CookiePreferences) => {
    if (category === "essential") return true;
    return preferences[category];
  };

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented,
        showBanner,
        setShowBanner,
        acceptAll,
        rejectAll,
        savePreferences,
        hasConsent,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookies must be used within a CookieProvider");
  }
  return context;
}