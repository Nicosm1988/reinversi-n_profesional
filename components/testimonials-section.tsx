import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcelo R.",
    role: "Director de Operaciones, 52 años",
    path: "Reposicionamiento senior",
    quote:
      "Después de 25 años en la misma industria, pensé que era el final. El diagnóstico me mostró que tenía más valor del que creía. En 6 semanas tenía 3 propuestas sobre la mesa.",
    initials: "MR",
  },
  {
    name: "Carolina S.",
    role: "Ex analista contable, 34 años",
    path: "Cambio total de carrera",
    quote:
      "Estaba paralizada. No sabía si necesitaba un psicólogo, un coach o un curso. El triage lo resolvió todo: primero trabajé lo emocional, después construimos mi nueva marca. Hoy trabajo en UX.",
    initials: "CS",
  },
  {
    name: "Andrés M.",
    role: "Ingeniero, 41 años",
    path: "Emprendimiento estratégico",
    quote:
      "Llegué pensando que quería buscar otro empleo. El proceso me ayudó a descubrir que mi experiencia servía para crear algo propio. Hoy tengo mi consultora y facturo más que antes.",
    initials: "AM",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Testimonios
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              Historias reales de reinvención
            </span>
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col rounded-xl border border-border bg-background p-6"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                {`"${testimonial.quote}"`}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <span className="mt-3 inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                {testimonial.path}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
