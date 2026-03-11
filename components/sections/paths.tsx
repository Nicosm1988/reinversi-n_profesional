"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Book {
    title: string;
    author: string;
    why: string;
}

interface Path {
    title: string;
    desc: string;
    badge: string;
    books: Book[];
}

const paths: Path[] = [
    {
        title: "Reempleo Acelerado",
        desc: "Para quienes quieren reinsertarse rápidamente en un rol similar. Optimizamos tu narrativa profesional y posicionamiento para reducir el tiempo de búsqueda.",
        badge: "Fast Track",
        books: [
            {
                title: "What Color Is Your Parachute?",
                author: "Richard N. Bolles",
                why: "La guía más completa para búsqueda laboral estratégica, con ejercicios prácticos de autopresentación y networking.",
            },
            {
                title: "Diseña tu vida",
                author: "Bill Burnett & Dave Evans",
                why: "Aplica el pensamiento de diseño a tu carrera para prototipar tu próximo paso antes de dar el salto.",
            },
            {
                title: "El elemento",
                author: "Ken Robinson",
                why: "Descubre dónde se cruzan tu talento natural y tu pasión para no repetir patrones que ya no te representan.",
            },
        ],
    },
    {
        title: "Actualización Digital + IA",
        desc: "Si sientes que las nuevas herramientas te dejaron atrás, te ayudamos a cerrar la brecha y recuperar tu ventaja competitiva en el mercado de hoy.",
        badge: "Upskilling",
        books: [
            {
                title: "La era de la inteligencia artificial",
                author: "Henry Kissinger, Eric Schmidt & Daniel Huttenlocher",
                why: "Contexto esencial sobre cómo la IA está redefiniendo industrias completas y qué significa para los profesionales.",
            },
            {
                title: "Ultralearning",
                author: "Scott Young",
                why: "Estrategias probadas para aprender habilidades técnicas de forma rápida e intensa — ideal para cerrar brechas de conocimiento.",
            },
            {
                title: "El mundo que viene",
                author: "Juan Martínez Barea",
                why: "Panorama de las tecnologías emergentes y cómo posicionarte ante la transformación digital del mercado laboral.",
            },
        ],
    },
    {
        title: "Reposicionamiento Senior",
        desc: "Para directivos y gerentes que apuntan a posiciones C-Level o consultoría estratégica. Transformamos tu narrativa de ejecución a visión de negocio.",
        badge: "Executive",
        books: [
            {
                title: "De cero a uno",
                author: "Peter Thiel",
                why: "Pensamiento estratégico de nivel C-Suite: cómo crear valor único en lugar de competir en mercados saturados.",
            },
            {
                title: "Los primeros 90 días",
                author: "Michael D. Watkins",
                why: "Guía práctica para transiciones ejecutivas — acelerar tu impacto en un nuevo rol de liderazgo.",
            },
            {
                title: "Executive Presence",
                author: "Sylvia Ann Hewlett",
                why: "Cómo proyectar autoridad, comunicar con impacto y posicionarte como líder en cualquier organización.",
            },
        ],
    },
    {
        title: "Cambio de Rumbo",
        desc: "Quieres dar un giro de industria o función, pero no sabes cómo. Diseñamos un plan para transferir tus fortalezas hacia un sector completamente nuevo.",
        badge: "Pivot",
        books: [
            {
                title: "Pivot",
                author: "Jenny Blake",
                why: "Metodología paso a paso para hacer cambios de carrera estratégicos sin empezar de cero.",
            },
            {
                title: "Range (Amplitud)",
                author: "David Epstein",
                why: "La ciencia detrás de por qué los generalistas triunfan — valida el poder de tus habilidades transferibles.",
            },
            {
                title: "Ikigai",
                author: "Héctor García & Francesc Miralles",
                why: "Encuentra la intersección entre lo que amas, lo que necesita el mundo, lo que puedes ofrecer y lo que te sustenta.",
            },
        ],
    },
    {
        title: "Emprendimiento",
        desc: "De la relación de dependencia a tu propio proyecto. Validamos tu idea de negocio con una estructura de riesgo controlado y pasos claros.",
        badge: "Venture",
        books: [
            {
                title: "El método Lean Startup",
                author: "Eric Ries",
                why: "Cómo testear tu idea de negocio con mínima inversión antes de comprometerte por completo.",
            },
            {
                title: "Padre rico, padre pobre",
                author: "Robert Kiyosaki",
                why: "Cambia tu mentalidad sobre el dinero y entiende la diferencia entre trabajar por ingreso y construir activos.",
            },
            {
                title: "La semana laboral de 4 horas",
                author: "Timothy Ferriss",
                why: "Diseña un negocio que se adapte a tu estilo de vida — automatización, delegación y libertad.",
            },
        ],
    },
];

function PathCard({ path }: { path: Path }) {
    const [showBooks, setShowBooks] = useState(false);

    return (
        <Card className="h-full bg-background border-none shadow-soft hover:shadow-subtle p-8 flex flex-col items-start transition-all duration-300">
            <div className="mb-6">
                <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none font-medium">
                    {path.badge}
                </Badge>
            </div>

            <h3 className="text-xl font-heading font-medium text-foreground mb-4">
                {path.title}
            </h3>

            <Text className="mb-6 flex-1">
                {path.desc}
            </Text>

            {/* Book toggle */}
            <button
                onClick={() => setShowBooks(!showBooks)}
                className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors mb-4 group"
            >
                <BookOpen className="h-4 w-4" />
                <span>Lecturas recomendadas</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showBooks ? "rotate-180" : ""}`} />
            </button>

            {/* Book list */}
            <div
                className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${showBooks ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="space-y-4 pt-2 pb-4 border-t border-border/40">
                    {path.books.map((book, j) => (
                        <div key={j} className="pt-4 first:pt-3">
                            <p className="text-sm font-semibold text-foreground leading-snug">
                                {book.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {book.author}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                {book.why}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="link" className="p-0 h-auto text-secondary font-medium group mt-auto" asChild>
                <Link href="/diagnostico/ancla-de-carrera">
                    Comenzar mi diagnóstico <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
        </Card>
    );
}

export function PathsSection() {
    return (
        <Section id="caminos" spacing="lg" background="muted">
            <Container>
                <FadeIn className="mb-16 md:mb-24">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="max-w-2xl">
                            <Heading level="h2" className="mb-6">
                                5 Caminos Posibles. <br />
                                Una Sola Decisión.
                            </Heading>
                            <Text variant="lead">
                                No hay dos trayectorias iguales. Diseñamos la estrategia según tu punto de partida y tu horizonte.
                            </Text>
                        </div>
                        <Image
                            src="/illustrations/paths.png"
                            alt="Múltiples caminos profesionales"
                            width={220}
                            height={165}
                            className="object-contain opacity-85 flex-shrink-0"
                        />
                    </div>
                </FadeIn>

                <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paths.map((path, i) => (
                        <FadeIn key={i}>
                            <PathCard path={path} />
                        </FadeIn>
                    ))}
                </StaggerContainer>
            </Container>
        </Section>
    );
}
