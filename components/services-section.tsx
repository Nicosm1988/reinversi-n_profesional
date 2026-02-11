import {
  Search,
  Target,
  Heart,
  Palette,
  FileText,
  Activity,
  Check,
} from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Diagnóstico profesional",
    description:
      "Test inteligente con análisis de IA + validación humana. Informe completo de situación, riesgos y oportunidades.",
    features: [
      "Test de 10-15 min con IA",
      "Informe preliminar automatizado",
      "Derivación personalizada",
    ],
    price: "Gratuito",
    priceNote: "Primera etapa sin costo",
    highlighted: true,
  },
  {
    icon: Target,
    title: "Coaching estratégico",
    description:
      "Sesiones individuales con coach certificado para definir tu ruta, tus objetivos y tu plan de acción.",
    features: [
      "Sesiones de 45-60 min",
      "Plan de acción personalizado",
      "Seguimiento entre sesiones",
    ],
    price: "Desde $45.000",
    priceNote: "Por sesión",
    highlighted: false,
  },
  {
    icon: Heart,
    title: "Psicología laboral",
    description:
      "Intervención profesional para burnout, duelo laboral, ansiedad ante el cambio y reconstrucción de la confianza.",
    features: [
      "Psicóloga especializada",
      "Enfoque laboral (no clínico)",
      "Informes de progreso",
    ],
    price: "Desde $35.000",
    priceNote: "Por sesión",
    highlighted: false,
  },
  {
    icon: Palette,
    title: "Marca personal",
    description:
      "CV estratégico, LinkedIn optimizado, narrativa profesional y estrategia de visibilidad digital.",
    features: [
      "CV con diseño profesional",
      "LinkedIn optimizado con SEO",
      "Narrativa y elevator pitch",
    ],
    price: "Desde $120.000",
    priceNote: "Paquete completo",
    highlighted: false,
  },
  {
    icon: FileText,
    title: "Plan de contenidos",
    description:
      "Estrategia de contenidos para LinkedIn y redes profesionales que posiciona tu expertise y genera oportunidades.",
    features: [
      "Calendario editorial mensual",
      "Templates de publicación",
      "Métricas de impacto",
    ],
    price: "Desde $80.000",
    priceNote: "Plan mensual",
    highlighted: false,
  },
  {
    icon: Activity,
    title: "Seguimiento post",
    description:
      "Acompañamiento automatizado + check-ins humanos durante 90 días post intervención para asegurar resultados.",
    features: [
      "Check-ins quincenales",
      "Alertas inteligentes",
      "NPS y ajustes continuos",
    ],
    price: "Incluido",
    priceNote: "Con paquetes integrales",
    highlighted: false,
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
            Servicios
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">
              Todo lo que necesitás, en un solo sistema
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Cada servicio puede contratarse individualmente o como parte de un
            plan integral de reinvención profesional.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative flex flex-col rounded-xl border p-6 transition-shadow hover:shadow-lg ${
                service.highlighted
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card"
              }`}
            >
              {service.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  Empezá acá
                </span>
              )}

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  service.highlighted
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <service.icon className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-border pt-4">
                <p className="font-heading text-2xl font-bold text-foreground">
                  {service.price}
                </p>
                <p className="text-xs text-muted-foreground">
                  {service.priceNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
