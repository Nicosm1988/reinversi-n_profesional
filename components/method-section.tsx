"use client";

import {
  ClipboardCheck,
  Cpu,
  Users,
  Heart,
  Award,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Test inteligente",
    duration: "10-15 min",
    description:
      "Completás un diagnóstico diseñado con metodología científica que evalúa tu situación profesional, emocional y de competencias.",
    tag: "Autogestión",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Pre-análisis con IA",
    duration: "Automático",
    description:
      "Nuestra inteligencia artificial procesa tus respuestas y genera un informe preliminar con patrones, riesgos y oportunidades detectadas.",
    tag: "Tecnología",
  },
  {
    number: "03",
    icon: Users,
    title: "Triage con coach",
    duration: "30-45 min",
    description:
      "Un coach certificado revisa el informe de IA, valida el análisis y define con vos el mejor camino de intervención.",
    tag: "Humano",
  },
  {
    number: "04",
    icon: Heart,
    title: "Psicología laboral",
    duration: "Si aplica",
    description:
      "Si el diagnóstico lo sugiere, accedés a sesiones con psicóloga laboral para trabajar aspectos emocionales que impactan tu carrera.",
    tag: "Bienestar",
  },
  {
    number: "05",
    icon: Award,
    title: "Branding y posicionamiento",
    duration: "2-4 semanas",
    description:
      "Construimos tu marca profesional: CV estratégico, perfil de LinkedIn optimizado, narrativa personal y plan de visibilidad.",
    tag: "Estrategia",
  },
];

export function MethodSection() {
  return (
    <section id="metodo" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Nuestro método
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              Un proceso estructurado, no improvisación
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            5 etapas diseñadas científicamente. La IA sugiere, el humano decide.
            Esa es nuestra regla ética central.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:left-1/2 md:block" />

          <div className="flex flex-col gap-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex flex-col gap-6 md:flex-row md:items-start ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content card */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:pl-16 md:text-left"
                  }`}
                >
                  <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                    <div
                      className={`flex items-center gap-3 ${
                        index % 2 === 0
                          ? "md:flex-row-reverse"
                          : "md:flex-row"
                      }`}
                    >
                      <span className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                        {step.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center node */}
                <div className="absolute left-8 top-6 z-10 hidden -translate-x-1/2 md:left-1/2 md:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-card text-primary shadow-md">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
