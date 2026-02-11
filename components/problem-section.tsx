import {
  Brain,
  TrendingDown,
  Flame,
  Briefcase,
  HelpCircle,
} from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "La IA avanza y no sabés cómo adaptarte",
    description:
      "Sentís que la tecnología te dejó atrás. Tu industria cambió y nadie te preparó para esto.",
  },
  {
    icon: TrendingDown,
    title: "Desactualización profesional",
    description:
      "Tus habilidades ya no coinciden con lo que el mercado demanda. El gap crece cada día.",
  },
  {
    icon: Flame,
    title: "Burnout y agotamiento laboral",
    description:
      "Estás fundido. No es solo cansancio: es una señal de que necesitás un cambio estructural.",
  },
  {
    icon: Briefcase,
    title: "Pérdida de empleo",
    description:
      "Te desvincularon o tu puesto desapareció. La incertidumbre financiera y emocional te paraliza.",
  },
  {
    icon: HelpCircle,
    title: "Confusión vocacional",
    description:
      "Sabés que querés un cambio, pero no tenés claro hacia dónde ni cómo dar el primer paso.",
  },
];

export function ProblemSection() {
  return (
    <section id="problema" className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            El contexto
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              Si te sentís identificado con algo de esto, no estás solo
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Millones de profesionales enfrentan estos desafíos hoy. El problema
            no sos vos. El problema es no tener un sistema para resolverlo.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="group rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <problem.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
