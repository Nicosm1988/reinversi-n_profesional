"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { ArrowRight, Mail, MessageCircle, Clock, Send, CheckCircle2 } from "lucide-react";

const contactReasons = [
    "Quiero hacer mi diagnóstico de carrera",
    "Orientación vocacional",
    "Terapia online",
    "Inglés profesional",
    "Consulta general",
    "Otro",
];

export default function ContactoPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        reason: "",
        message: "",
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // For now, open mailto with the form data
        const subject = encodeURIComponent(`[Reinvención.Pro] ${formData.reason || "Consulta"}`);
        const body = encodeURIComponent(
            `Nombre: ${formData.name}\nEmail: ${formData.email}\nMotivo: ${formData.reason}\n\nMensaje:\n${formData.message}`
        );
        window.open(`mailto:contacto@reinvencion.pro?subject=${subject}&body=${body}`, "_blank");
        setSubmitted(true);
    }

    return (
        <div className="flex flex-col bg-background">

            {/* ═══ Hero ═══ */}
            <section className="relative bg-primary text-primary-foreground py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
                <Container>
                    <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
                        <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-6xl mb-6">
                            Hablemos de tu{" "}
                            <span className="italic text-secondary">próximo paso</span>
                        </Heading>
                        <Text variant="lead" className="text-primary-foreground/80 max-w-xl mx-auto">
                            Contanos en qué momento estás y cómo podemos ayudarte.
                            Te respondemos en menos de 24 horas.
                        </Text>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══ Contact Form + Info ═══ */}
            <Section spacing="lg">
                <Container>
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

                        {/* Left: Form (3 cols) */}
                        <FadeIn className="lg:col-span-3">
                            {!submitted ? (
                                <Card className="bg-background border shadow-soft p-8 md:p-10">
                                    <h2 className="text-2xl font-heading font-medium text-foreground mb-8">
                                        Envianos tu consulta
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                                                    Nombre completo
                                                </label>
                                                <input
                                                    id="contact-name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    id="contact-email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                                                    placeholder="tu@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="contact-reason" className="block text-sm font-medium text-foreground mb-2">
                                                ¿Sobre qué querés consultar?
                                            </label>
                                            <select
                                                id="contact-reason"
                                                required
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow appearance-none"
                                            >
                                                <option value="">Selecciona un motivo</option>
                                                {contactReasons.map((reason) => (
                                                    <option key={reason} value={reason}>{reason}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">
                                                Tu mensaje
                                            </label>
                                            <textarea
                                                id="contact-message"
                                                rows={5}
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow resize-none"
                                                placeholder="Contanos en qué momento estás y cómo podemos ayudarte..."
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="rounded-full px-10 h-14 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold w-full md:w-auto"
                                        >
                                            Enviar consulta <Send className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                </Card>
                            ) : (
                                <Card className="bg-background border shadow-soft p-8 md:p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-8 w-8 text-accent" />
                                    </div>
                                    <h2 className="text-2xl font-heading font-medium text-foreground mb-4">
                                        ¡Gracias por escribirnos!
                                    </h2>
                                    <Text variant="body-lg" className="mb-8 max-w-md mx-auto">
                                        Recibimos tu consulta. Te vamos a responder en menos de 24 horas
                                        a tu correo electrónico.
                                    </Text>
                                    <Button
                                        variant="outline"
                                        className="rounded-full px-8"
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: "", email: "", reason: "", message: "" });
                                        }}
                                    >
                                        Enviar otra consulta
                                    </Button>
                                </Card>
                            )}
                        </FadeIn>

                        {/* Right: Contact Info (2 cols) */}
                        <FadeIn className="lg:col-span-2">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-heading font-medium text-foreground text-lg mb-4">
                                        Otras formas de contactarnos
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                                                <Mail className="h-5 w-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Email</p>
                                                <a href="mailto:contacto@reinvencion.pro" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                                                    contacto@reinvencion.pro
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                                                <MessageCircle className="h-5 w-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                                                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                                                    +54 9 11 1234-5678
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                                                <Clock className="h-5 w-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Horario de atención</p>
                                                <p className="text-sm text-muted-foreground">Lunes a viernes, 9:00 a 19:00 (AR)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-8">
                                    <h3 className="font-heading font-medium text-foreground text-lg mb-4">
                                        ¿Preferís empezar ahora?
                                    </h3>
                                    <Text className="text-sm mb-6">
                                        Si ya sabés que querés hacer tu diagnóstico de carrera, no necesitás
                                        esperar. Es gratuito e inmediato.
                                    </Text>
                                    <Button
                                        variant="default"
                                        size="lg"
                                        className="rounded-full px-8 h-12 w-full font-semibold"
                                        asChild
                                    >
                                        <a href="/diagnostico/ancla-de-carrera">
                                            Hacer diagnóstico gratis <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </Container>
            </Section>
        </div>
    );
}
