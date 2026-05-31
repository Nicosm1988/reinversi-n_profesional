"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Container } from "@/components/layout/container";
import { FadeIn, StaggerContainer, SlideUp } from "@/components/motion";
import { ArrowRight, Compass, Brain, Layers, Rocket, Clock, Sparkles, Users, Calendar } from "lucide-react";
import Link from "next/link";

const tools = [
    {
        title: "Tu Ancla de Carrera",
        description: "Antes de cambiar, entendé qué es lo que realmente valorás en tu trabajo.",
        detail: "Descubrí qué te motiva, qué te frustra y qué tipo de entornos potencian tu desempeño.",
        duration: "10–12 minutos",
        result: "Resultado inmediato con insight personalizado.",
        badge: "Gratis",
        badgeColor: "bg-green-100 text-green-700 border-green-200",
        icon: Compass,
        iconColor: "text-green-600 bg-green-50",
        href: "/diagnostico/ancla-de-carrera",
        cta: "Hacer este diagnóstico",
        available: true,
    },
    {
        title: "Inteligencias Múltiples",
        description: "Explorá qué tipo de inteligencia predomina en vos y cómo desarrollarla estratégicamente en tu camino profesional.",
        detail: "Identificá fortalezas ocultas y entornos donde pueden crecer.",
        duration: "12–15 minutos",
        result: "Incluye guía de interpretación.",
        badge: "Disponible como herramienta adicional",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
        icon: Brain,
        iconColor: "text-blue-600 bg-blue-50",
        href: "#",
        cta: "Explorar esta herramienta",
        available: false,
    },
    {
        title: "Nivel de Cambio Profesional",
        description: "No todos los cambios implican lo mismo.",
        detail: "Entendé si estás queriendo cambiar de ambiente, de rol, de industria o de identidad profesional.",
        duration: "10–15 minutos",
        result: "Incluye mapa de nivel de transformación.",
        badge: "Disponible como herramienta adicional",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
        icon: Layers,
        iconColor: "text-blue-600 bg-blue-50",
        href: "#",
        cta: "Descubrir mi nivel de cambio",
        available: false,
    },
    {
        title: "Perfil Emprendedor",
        description: "Tener ideas no siempre significa tener perfil emprendedor.",
        detail: "Evaluá tu tolerancia al riesgo, autonomía y estilo de decisión antes de dar un salto.",
        duration: "12–15 minutos",
        result: "Resultado con recomendaciones prácticas.",
        badge: "Disponible como herramienta adicional",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
        icon: Rocket,
        iconColor: "text-blue-600 bg-blue-50",
        href: "#",
        cta: "Evaluar mi perfil",
        available: false,
    },
];

export default function DiagnosticoPage() {
    return (
        <div className="wati-page-shell flex flex-col">

            {/* ─── HEADER ─── */}
            <section className="pt-32 pb-16 md:pt-44 md:pb-24 relative">
                <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>
                <Container className="relative z-10 text-center">
                    <StaggerContainer>
                        <SlideUp>
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Herramientas de diagnóstico profesional
                            </div>
                        </SlideUp>

                        <SlideUp delay={0.1}>
                            <Heading level="h1" className="mb-6 max-w-3xl mx-auto">
                                Descubrí qué tipo de cambio profesional estás listo para hacer.
                            </Heading>
                        </SlideUp>

                        <SlideUp delay={0.2}>
                            <Text variant="lead" className="max-w-2xl mx-auto mb-6">
                                Tenés una herramienta gratuita para empezar hoy.<br />
                                Elegí tu diagnóstico y empezá con claridad.
                            </Text>
                        </SlideUp>

                        <SlideUp delay={0.3}>
                            <Text variant="small" className="max-w-xl mx-auto text-muted-foreground">
                                Elegí 1 herramienta y hacela gratis.
                                Si querés profundizar, podés sumar más herramientas (de pago) o agendar una sesión 1:1 con especialistas.
                            </Text>
                        </SlideUp>
                    </StaggerContainer>
                </Container>
            </section>

            {/* ─── 4 TOOL CARDS ─── */}
            <section className="pb-20 md:pb-28">
                <Container>
                    <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {tools.map((tool, i) => {
                            const Icon = tool.icon;
                            return (
                                <FadeIn key={i}>
                                    <Card className={`h-full border bg-background hover:shadow-subtle transition-all duration-300 flex flex-col ${tool.available ? "border-primary/20 ring-1 ring-primary/5" : "border-muted"}`}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${tool.iconColor}`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${tool.badgeColor}`}>
                                                    {tool.badge === "Gratis" ? "🟢 Gratis (1 a elección)" : "🔵 " + tool.badge}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-heading font-bold text-foreground">
                                                {tool.title}
                                            </h3>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4">
                                            <Text className="text-foreground/80">
                                                {tool.description}
                                            </Text>
                                            <Text variant="small" className="text-foreground/70">
                                                {tool.detail}
                                            </Text>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {tool.duration}
                                                </span>
                                                <span className="flex-1 text-right">{tool.result}</span>
                                            </div>

                                            <Button
                                                asChild={tool.available}
                                                disabled={!tool.available}
                                                className={`w-full rounded-full h-12 font-bold text-base mt-2 ${tool.available ? "shadow-lg shadow-primary/15" : "opacity-60"}`}
                                                variant={tool.available ? "secondary" : "outline"}
                                            >
                                                {tool.available ? (
                                                    <Link href={tool.href}>
                                                        {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                ) : (
                                                    <span>{tool.cta} — Próximamente</span>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </FadeIn>
                            );
                        })}
                    </StaggerContainer>
                </Container>
            </section>

            {/* ─── DEEPENING SECTION ─── */}
            <section className="py-20 md:py-28 bg-muted/30">
                <Container>
                    <FadeIn className="text-center max-w-2xl mx-auto space-y-8">
                        <Heading level="h2" className="text-3xl md:text-4xl">
                            Cada recorrido es particular.
                        </Heading>
                        <Text className="text-lg leading-relaxed text-foreground/80">
                            Por eso, darte el espacio para explorar el cambio que querés hacer, acompañado por profesionales especializados, puede ayudarte a transformar la incertidumbre en un plan coherente con vos.
                        </Text>
                    </FadeIn>
                </Container>
            </section>

            {/* ─── 1:1 SESSIONS ─── */}
            <section className="py-20 md:py-28">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <FadeIn className="text-center mb-12 md:mb-16">
                            <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-sm font-medium text-secondary mb-6">
                                <Users className="mr-2 h-4 w-4" />
                                Acompañamiento profesional
                            </div>
                            <Heading level="h2" className="mb-6">
                                Sesiones 1:1 con especialistas
                            </Heading>
                            <Text variant="lead" className="max-w-2xl mx-auto">
                                Si querés ir más allá del diagnóstico, podés agendar una sesión individual con:
                            </Text>
                        </FadeIn>

                        <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-12">
                            {[
                                {
                                    title: "Psicólogos laborales",
                                    desc: "Especialistas en transición profesional",
                                },
                                {
                                    title: "Coach de carrera",
                                    desc: "Orientación estratégica personalizada",
                                },
                                {
                                    title: "Rediseño profesional",
                                    desc: "Expertos en reposicionamiento en redes",
                                },
                            ].map((specialist, i) => (
                                <FadeIn key={i}>
                                    <Card className="text-center p-6 border-muted bg-background hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h4 className="font-heading font-bold text-lg mb-2">{specialist.title}</h4>
                                        <Text variant="small" className="text-muted-foreground">{specialist.desc}</Text>
                                    </Card>
                                </FadeIn>
                            ))}
                        </StaggerContainer>

                        <FadeIn className="text-center space-y-6">
                            <Text className="text-foreground/80 max-w-xl mx-auto italic">
                                Un espacio confidencial, estratégico y personalizado para analizar tu situación y definir próximos pasos concretos.
                            </Text>
                            <Button asChild size="lg" variant="secondary" className="rounded-full px-12 h-14 text-lg">
                                <Link href="/contacto">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Agendar mi sesión 1:1
                                </Link>
                            </Button>
                        </FadeIn>
                    </div>
                </Container>
            </section>
        </div>
    );
}
