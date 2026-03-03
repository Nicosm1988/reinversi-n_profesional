"use client";

import { useState } from "react";
import { useCookies } from "@/lib/cookie-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Toggle Switch ───
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
                relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200
                ${disabled ? "bg-primary/30 cursor-default" : checked ? "bg-primary" : "bg-muted-foreground/30"}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200
                    ${checked ? "translate-x-5" : "translate-x-0"}
                `}
            />
        </button>
    );
}

// ─── Category Item ───
function CategoryItem({ title, description, checked, onChange, alwaysActive }: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    alwaysActive?: boolean;
}) {
    return (
        <div className="py-5 border-t border-border">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-heading font-semibold text-foreground">{title}</h4>
                {alwaysActive ? (
                    <span className="text-sm font-semibold text-foreground">Siempre activo</span>
                ) : (
                    <Toggle checked={checked} onChange={onChange} />
                )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

// ─── Cookie Banner ───
export function CookieBanner() {
    const { showBanner, setShowBanner, acceptAll, rejectAll, savePreferences, preferences } = useCookies();
    const [showPreferences, setShowPreferences] = useState(false);
    const [localPrefs, setLocalPrefs] = useState(preferences);

    // Sync local prefs when banner opens
    const handleOpenPreferences = () => {
        setLocalPrefs(preferences);
        setShowPreferences(true);
    };

    const handleConfirmPreferences = () => {
        savePreferences(localPrefs);
        setShowPreferences(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-0 z-[60] flex items-end justify-center p-4 pointer-events-none"
                >
                    <div className="pointer-events-auto bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        {!showPreferences ? (
                            /* ─── Initial Banner ─── */
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-heading font-bold text-foreground">Preferencia de Privacidad</h3>
                                    <button
                                        onClick={() => setShowBanner(false)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    Cuando visitas sitios web, pueden almacenar o recuperar datos en tu navegador.
                                    Este almacenamiento es a menudo necesario para la funcionalidad básica del sitio web.
                                    El almacenamiento puede utilizarse para marketing, análisis y personalización del sitio,
                                    como almacenar tus preferencias. La privacidad es importante para nosotros, por lo que
                                    tienes la opción de desactivar ciertos tipos de almacenamiento que pueden no ser
                                    necesarios para el funcionamiento básico del sitio web. Bloquear categorías puede
                                    afectar tu experiencia en el sitio web.
                                </p>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <Button
                                        variant="outline"
                                        onClick={rejectAll}
                                        className="rounded-full px-6 h-11 font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                    >
                                        Rechazar cookies
                                    </Button>
                                    <Button
                                        onClick={acceptAll}
                                        className="rounded-full px-6 h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Permitir cookies
                                    </Button>
                                </div>

                                <button
                                    onClick={handleOpenPreferences}
                                    className="text-sm text-primary font-medium hover:underline"
                                >
                                    Gestionar preferencias de consentimiento →
                                </button>
                            </div>
                        ) : (
                            /* ─── Preferences Panel ─── */
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-heading font-bold text-foreground">
                                        Gestionar Preferencias de Consentimiento por Categoría
                                    </h3>
                                    <button
                                        onClick={() => setShowPreferences(false)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <CategoryItem
                                    title="Esencial"
                                    description="Estos elementos son necesarios para habilitar la funcionalidad básica del sitio web."
                                    checked={true}
                                    onChange={() => {}}
                                    alwaysActive
                                />

                                <CategoryItem
                                    title="Marketing"
                                    description="Estos elementos se utilizan para ofrecer publicidad que es más relevante para ti y tus intereses. También pueden utilizarse para limitar el número de veces que ves un anuncio y medir la efectividad de las campañas publicitarias. Las redes de publicidad generalmente los colocan con el permiso del operador del sitio web."
                                    checked={localPrefs.marketing}
                                    onChange={(v) => setLocalPrefs({ ...localPrefs, marketing: v })}
                                />

                                <CategoryItem
                                    title="Personalización"
                                    description="Estos elementos permiten que el sitio web recuerde las elecciones que haces (como tu nombre de usuario, idioma o la región en la que te encuentras) y proporcionen funciones mejoradas y más personales. Por ejemplo, un sitio web puede ofrecerte informes del clima local o noticias de tráfico almacenando datos sobre tu ubicación actual."
                                    checked={localPrefs.personalization}
                                    onChange={(v) => setLocalPrefs({ ...localPrefs, personalization: v })}
                                />

                                <CategoryItem
                                    title="Analytics"
                                    description="Estos elementos ayudan al operador del sitio web a entender cómo funciona su sitio web, cómo los visitantes interactúan con el sitio y si puede haber problemas técnicos. Este tipo de almacenamiento generalmente no recopila información que identifica a un visitante."
                                    checked={localPrefs.analytics}
                                    onChange={(v) => setLocalPrefs({ ...localPrefs, analytics: v })}
                                />

                                <div className="pt-4 border-t border-border">
                                    <Button
                                        onClick={handleConfirmPreferences}
                                        className="rounded-full px-6 h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                                    >
                                        Confirmar preferencias y cerrar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
