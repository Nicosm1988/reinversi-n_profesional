import {
  Rocket,
  BookOpen,
  Crown,
  Repeat,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const paths = [
  {
    icon: Rocket,
    title: "Reempleo acelerado",
    description:
      "Para quienes necesitan volver al mercado laboral rápidamente con una estrategia optimizada de búsqueda y posicionamiento.",
    ideal: "Profesionales desvinculados recientemente",
    cta: "Explorar ruta",
  },
  {
    icon: BookOpen,
    title: "Re-skilling guiado",
    description:
      "Adquirí nuevas competencias alineadas al mercado actual. Te guiamos en la selección de formaciones con mayor retorno.",
    ideal: "Profesionales desactualizados",
    cta: "Explorar ruta",
  },
  {
    icon: Crown,
    title: "Reposicionamiento senior",
    description:
      "Estrategia exclusiva para ejecutivos y profesionales con +15 años que necesitan recalibrar su propuesta de valor.",
    ideal: "Directivos y C-level",
    cta: "Explorar ruta",
  },
  {
    icon: Repeat,
    title: "Cambio total de carrera",
    description:
      "Te acompañamos en la transición completa hacia una nueva industria o profesión, minimizando riesgos y maximizando chances.",
    ideal: "Profesionales en crisis vocacional",
    cta: "Explorar ruta",
  },
  {
    icon: Lightbulb,
    title: "Emprendimiento estratégico",
    description:
      "Convertí tu experiencia profesional en un proyecto propio viable. Validación, modelo de negocio y primeros pasos concretos.",
    ideal: "Profesionales con perfil emprendedor",
    cta: "Explorar ruta",
  },
];

export function PathsSection() {
  return (
    <section id="caminos" className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Tus caminos
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              5 rutas de reinvención, una es la tuya
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            No existe una receta única. Nuestro diagnóstico identifica cuál es
            el mejor camino para tu perfil, tu momento y tus objetivos.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <div
              key={path.title}
              className="group flex flex-col rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <path.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                {path.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {path.description}
              </p>
              <p className="mt-4 text-xs font-medium text-secondary">
                Ideal para: {path.ideal}
              </p>
              <a
                href="#diagnostico"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {path.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
