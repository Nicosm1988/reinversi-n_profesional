"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ───
export interface CookiePreferences {
    essential: boolean;   // Always true, cannot be toggled
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

const CookieContext = createContext<CookieContextType | undefined>(undefined);

// ─── Provider ───
export function CookieProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
    const [hasConsented, setHasConsented] = useState(true); // Default true to avoid flash
    const [showBanner, setShowBanner] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (consent === "true") {
            setHasConsented(true);
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as CookiePreferences;
                    setPreferences({ ...parsed, essential: true });
                } catch {
                    // Invalid JSON, use defaults
                }
            }
        } else {
            setHasConsented(false);
            setShowBanner(true);
        }
    }, []);

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

// ─── Hook ───
export function useCookies() {
    const context = useContext(CookieContext);
    if (context === undefined) {
        throw new Error("useCookies must be used within a CookieProvider");
    }
    return context;
}
