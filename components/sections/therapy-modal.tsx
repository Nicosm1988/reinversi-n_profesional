"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import Link from "next/link";

interface TherapyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TherapyModal({ open, onOpenChange }: TherapyModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const canSubmit = name.trim() !== "" && email.trim() !== "" && accepted && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        // TODO: conectar con Supabase o API de contacto
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setSubmitted(true);
        setSubmitting(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset form after close animation
        setTimeout(() => {
            setName("");
            setEmail("");
            setAccepted(false);
            setSubmitted(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md border-none bg-gradient-to-b from-[hsl(270,60%,55%)] to-[hsl(270,50%,40%)] text-white p-0 overflow-hidden rounded-2xl">
                <div className="p-8 md:p-10">
                    {!submitted ? (
                        <FadeIn>
                            <DialogHeader className="mb-8">
                                <DialogTitle className="text-white text-2xl font-heading font-medium">
                                    Introduce tu nombre y email para continuar
                                </DialogTitle>
                                <DialogDescription className="text-white/70 text-base mt-2">
                                    Te conectaremos con un profesional especializado en procesos de cambio personal.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-14 px-5 rounded-xl bg-white text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 px-5 rounded-xl bg-white text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                                        required
                                    />
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                        className="mt-1 h-5 w-5 rounded border-white/30 bg-white/10 text-secondary accent-secondary cursor-pointer"
                                    />
                                    <span className="text-sm text-white/80 leading-relaxed">
                                        Al continuar acepto los{" "}
                                        <Link href="/terminos" className="underline text-white hover:text-secondary transition-colors">
                                            Términos y Condiciones
                                        </Link>{" "}
                                        y la{" "}
                                        <Link href="/privacidad" className="underline text-white hover:text-secondary transition-colors">
                                            Política de Privacidad
                                        </Link>{" "}
                                        de este sitio.
                                    </span>
                                </label>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="rounded-xl h-12 px-8 text-base font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {submitting ? "Enviando..." : "Continuar"}
                                    </Button>
                                </div>
                            </form>
                        </FadeIn>
                    ) : (
                        <FadeIn>
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-white text-2xl font-heading mb-3">
                                        ¡Gracias!
                                    </DialogTitle>
                                    <DialogDescription className="text-white/80 text-base">
                                        Recibimos tu consulta. Un profesional se pondrá en contacto contigo a la brevedad.
                                    </DialogDescription>
                                </DialogHeader>
                                <Button
                                    onClick={handleClose}
                                    className="mt-8 rounded-xl h-12 px-8 bg-white/20 text-white hover:bg-white/30 transition-colors"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
