"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { ArrowRight, Compass, Search, FileCheck, DoorOpen, Sparkles, Users, Brain } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        icon: Compass,
        title: "Descubre tu dirección",
        desc: "A través de actividades de exploración profunda, identificamos qué te motiva, qué te apasiona y hacia dónde quieres ir. No importa tu edad ni tu punto de partida.",
    },
    {
        icon: Brain,
        title: "Conoce tus fortalezas reales",
        desc: "Con herramientas psicométricas validadas y entrevistas en profundidad, mapeamos tus habilidades, valores e intereses para que tomes decisiones basadas en datos concretos.",
    },
    {
        icon: Sparkles,
        title: "Diseña tu próximo capítulo",
        desc: "Con claridad sobre quién eres y qué quieres, construimos juntos un plan de acción realista: desde qué estudiar hasta cómo posicionarte en el mercado laboral.",
    },
];

const sessions = [
    {
        number: "01",
        title: "Tu historia y tu momento",
        desc: "Comenzamos explorando tu trayectoria, tu situación actual y qué te trajo hasta acá. Escuchamos sin juicios para entender a fondo tu contexto.",
    },
    {
        number: "02",
        title: "Quién eres hoy",
        desc: "Trabajamos tu personalidad, tus recursos, tus estilos de aprendizaje y tus estrategias de afrontamiento. El autoconocimiento es el pilar de todo el proceso.",
    },
    {
        number: "03",
        title: "Tus intereses y motivaciones",
        desc: "Profundizamos en lo que te mueve: qué actividades disfrutas, en qué entornos te sientes cómodo y qué tipo de desafíos te energizan.",
    },
    {
        number: "04",
        title: "Exploración vocacional",
        desc: "Cruzamos todo lo aprendido con campos profesionales y áreas de desarrollo. Empezamos a dar forma a las opciones que resuenan con tu perfil.",
    },
    {
        number: "05",
        title: "Tu vocación toma forma",
        desc: "Acotamos las opciones e investigamos a fondo: planes de estudio, campos laborales, proyección a futuro y mercado real en tu zona.",
    },
    {
        number: "06",
        title: "El mundo laboral de 2026",
        desc: "Analizamos roles, inserción laboral y tendencias del mercado actual — incluyendo el impacto de la IA — para que tu decisión esté contextualizada en el presente.",
    },
    {
        number: "07",
        title: "Tu plan de acción",
        desc: "Consolidamos todo en un plan concreto: qué hacer, por dónde empezar, qué estudiar y cómo posicionarte. Es tu hoja de ruta personalizada.",
    },
    {
        number: "08",
        title: "Informe final y cierre",
        desc: "Te entregamos un informe integral con tu perfil de fortalezas, intereses, recomendaciones y próximos pasos. Te vas con claridad y dirección.",
    },
];

const reportIncludes = [
    "Perfil completo de personalidad y fortalezas",
    "Mapa de intereses y motivaciones",
    "Estrategias de aprendizaje identificadas",
    "Áreas de desarrollo y desafíos",
    "Carreras y caminos recomendados",
    "Plan de acción personalizado",
];

export default function OrientacionVocacionalPage() {
    return (
        <div className="flex flex-col bg-background">

            {/* ═══ Hero ═══ */}
            <section className="relative bg-primary text-primary-foreground py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
                <Container>
                    <FadeIn className="max-w-2xl mx-auto text-center relative z-10">
                        <Heading level="h1" className="text-primary-foreground text-4xl sm:text-5xl lg:text-6xl mb-6">
                            Orientación Vocacional: <br className="hidden md:block" />
                            <span className="italic text-secondary">Encontrá tu camino</span>
                        </Heading>
                        <Text variant="lead" className="text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                            No importa si tienes 18 o 50 años. Si estás en un momento de transición, incertidumbre
                            o simplemente sentís que llegó la hora de un cambio, este proceso es para ti.
                        </Text>
                        <Button
                            size="lg"
                            className="rounded-full px-10 h-14 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                            asChild
                        >
                            <a href="#proceso">
                                Conocer el proceso <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══ Intro ═══ */}
            <Section spacing="lg">
                <Container size="sm">
                    <FadeIn className="text-center">
                        <Heading level="h2" className="mb-6">
                            No saber qué quieres hacer es más común de lo que crees.
                        </Heading>
                        <Text variant="body-lg" className="max-w-2xl mx-auto">
                            La orientación vocacional y ocupacional es un proceso de aprendizaje
                            para personas de todas las edades. Se trata de autoconocerte,
                            identificar tus objetivos de vida y encontrar las opciones
                            profesionales que realmente te representan — especialmente en un
                            mercado transformado por la inteligencia artificial.
                        </Text>
                    </FadeIn>
                </Container>
            </Section>

            {/* ═══ Benefits (3 cards) ═══ */}
            <Section spacing="lg" background="muted">
                <Container>
                    <FadeIn className="text-center mb-16">
                        <Heading level="h2" className="mb-4">¿Qué vas a lograr?</Heading>
                    </FadeIn>

                    <StaggerContainer className="grid md:grid-cols-3 gap-8">
                        {benefits.map((b, i) => (
                            <FadeIn key={i}>
                                <Card className="h-full bg-background border-none shadow-soft p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 transition-colors">
                                        <b.icon className="h-7 w-7 text-secondary" />
                                    </div>
                                    <h3 className="text-lg font-heading font-medium text-foreground mb-3">
                                        {b.title}
                                    </h3>
                                    <Text className="text-sm">{b.desc}</Text>
                                </Card>
                            </FadeIn>
                        ))}
                    </StaggerContainer>
                </Container>
            </Section>

            {/* ═══ Mid CTA ═══ */}
            <Section spacing="lg">
                <Container size="sm">
                    <FadeIn className="text-center">
                        <Heading level="h2" className="mb-6">
                            Encontrar tu rumbo empieza con una decisión.
                        </Heading>
                        <Text variant="lead" className="max-w-lg mx-auto mb-8">
                            Este proceso te ayuda a pensar, reflexionar y encontrar respuestas.
                            Te guiamos hacia el encuentro con tu verdadera vocación, para que puedas
                            dedicarte a algo que te motive y disfrutes.
                        </Text>
                        <Button size="lg" className="rounded-full px-10 h-14 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" asChild>
                            <Link href="/contacto">
                                Quiero comenzar <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </FadeIn>
                </Container>
            </Section>

            {/* ═══ Process Timeline ═══ */}
            <Section id="proceso" spacing="lg" background="muted">
                <Container size="sm">
                    <FadeIn className="mb-16">
                        <span className="text-sm font-medium tracking-widest uppercase text-secondary mb-2 block">
                            El Proceso
                        </span>
                        <Heading level="h2">
                            ¿Cómo funciona la orientación vocacional?
                        </Heading>
                        <Text variant="body-lg" className="mt-4 max-w-xl">
                            8 sesiones individuales de 60 a 90 minutos, a tu ritmo (semanal o quincenal).
                            100% online desde donde estés.
                        </Text>
                    </FadeIn>

                    <StaggerContainer className="relative border-l border-border/60 ml-3 md:ml-0 space-y-10 pb-4">
                        {sessions.map((session, i) => (
                            <FadeIn key={i} className="relative pl-12 md:pl-16">
                                <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-background border-2 border-secondary ring-4 ring-background z-10 transition-colors hover:bg-secondary"></div>

                                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 group">
                                    <span className="text-sm font-bold text-secondary/50 font-mono group-hover:text-secondary transition-colors">
                                        SESIÓN {session.number}
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-heading font-medium text-foreground mb-2 group-hover:text-secondary transition-colors duration-300">
                                            {session.title}
                                        </h3>
                                        <Text>
                                            {session.desc}
                                        </Text>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </StaggerContainer>
                </Container>
            </Section>

            {/* ═══ Report Section ═══ */}
            <Section spacing="lg">
                <Container size="sm">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <FadeIn>
                            <Heading level="h2" className="mb-6">
                                Tu informe final
                            </Heading>
                            <Text variant="body-lg" className="mb-6">
                                Al cierre del proceso, recibes un informe completo que integra todo lo
                                trabajado. Es tu brújula para tomar decisiones con confianza.
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                                Durante la entrega del informe resolvemos dudas, trabajamos
                                interrogantes y podemos incluir asesoramiento en armado de CV.
                            </Text>
                        </FadeIn>

                        <FadeIn>
                            <Card className="bg-muted border-none p-8">
                                <h3 className="font-heading font-semibold text-foreground mb-6">
                                    El informe incluye:
                                </h3>
                                <ul className="space-y-3">
                                    {reportIncludes.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <FileCheck className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </FadeIn>
                    </div>
                </Container>
            </Section>

            {/* ═══ Audience ═══ */}
            <Section spacing="lg" background="muted">
                <Container size="sm">
                    <FadeIn className="text-center mb-12">
                        <Heading level="h2" className="mb-4">¿Para quién es?</Heading>
                    </FadeIn>

                    <StaggerContainer className="grid md:grid-cols-2 gap-6">
                        <FadeIn>
                            <Card className="bg-background border-none shadow-soft p-8 group hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                                    <Users className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="font-heading font-medium text-foreground mb-2">Jóvenes (18-25)</h3>
                                <Text className="text-sm">
                                    Terminaste el colegio y no sabes qué estudiar. O empezaste una carrera y sentís
                                    que no es lo tuyo. Este es tu espacio para pensar sin presión.
                                </Text>
                            </Card>
                        </FadeIn>
                        <FadeIn>
                            <Card className="bg-background border-none shadow-soft p-8 group hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                                    <Search className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="font-heading font-medium text-foreground mb-2">Profesionales (25-35)</h3>
                                <Text className="text-sm">
                                    Llevas años trabajando pero algo no encaja. Tal vez la IA transformó tu industria,
                                    o simplemente quieres un cambio. Es hora de repensar tu rumbo.
                                </Text>
                            </Card>
                        </FadeIn>
                        <FadeIn>
                            <Card className="bg-background border-none shadow-soft p-8 group hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                                    <Compass className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="font-heading font-medium text-foreground mb-2">Líderes y seniors (35-50)</h3>
                                <Text className="text-sm">
                                    Tienes experiencia de sobra pero sentís que necesitas un giro. Ya sea
                                    pivotar a otro sector, emprender o apuntar a un rol C-Level.
                                </Text>
                            </Card>
                        </FadeIn>
                        <FadeIn>
                            <Card className="bg-background border-none shadow-soft p-8 group hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                                    <DoorOpen className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="font-heading font-medium text-foreground mb-2">En transición</h3>
                                <Text className="text-sm">
                                    Perdiste tu empleo, fuiste desplazado por la automatización o estás
                                    en un momento de cambio. No importa la edad: este proceso te da claridad.
                                </Text>
                            </Card>
                        </FadeIn>
                    </StaggerContainer>
                </Container>
            </Section>

            {/* ═══ Final CTA ═══ */}
            <Section spacing="lg">
                <Container size="sm">
                    <FadeIn className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 max-w-xl mx-auto">
                            <Heading level="h2" className="text-primary-foreground mb-6">
                                Tu futuro profesional merece claridad.
                            </Heading>
                            <Text className="text-primary-foreground/80 text-lg mb-10">
                                Empieza tu proceso de orientación vocacional con acompañamiento
                                profesional y herramientas validadas. 100% online.
                            </Text>
                            <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-base shadow-lg" asChild>
                                <Link href="/contacto">
                                    Quiero comenzar mi proceso <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </FadeIn>
                </Container>
            </Section>
        </div>
    );
}
