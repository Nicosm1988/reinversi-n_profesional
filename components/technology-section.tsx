import { ArrowDown } from "lucide-react";

const pipeline = [
  {
    label: "Test inteligente",
    detail: "Formulario web conectado vía webhook",
    tech: "CRM (Airtable / HubSpot)",
  },
  {
    label: "IA genera resumen",
    detail: "Procesamiento automático del diagnóstico",
    tech: "Motor de IA propietario",
  },
  {
    label: "Coach decide intervención",
    detail: "Validación humana del análisis de IA",
    tech: "Calendly integrado",
  },
  {
    label: "Psicóloga genera informe",
    detail: "Sesión + informe clínico-laboral",
    tech: "Si el triage lo indica",
  },
  {
    label: "Branding: entrega completa",
    detail: "CV, LinkedIn, narrativa, plan de contenidos",
    tech: "Entregables digitales",
  },
  {
    label: "Seguimiento automatizado",
    detail: "Check-ins + NPS + alertas inteligentes",
    tech: "Make / n8n + email secuenciado",
  },
];

export function TechnologySection() {
  return (
    <section className="bg-primary py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
              Tecnología
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">
              <span className="text-balance">
                Escalable pero humano
              </span>
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-primary-foreground/70">
              Nuestra arquitectura combina automatización inteligente con puntos
              de decisión humana. Cada paso del proceso está diseñado para ser
              eficiente sin perder la calidez.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-4">
                <p className="text-sm font-semibold text-primary-foreground">
                  Regla ética central
                </p>
                <p className="mt-1 text-sm text-primary-foreground/60">
                  La IA sugiere, el humano decide. Ninguna decisión sobre tu
                  carrera la toma un algoritmo.
                </p>
              </div>
              <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-4">
                <p className="text-sm font-semibold text-primary-foreground">
                  Integraciones activas
                </p>
                <p className="mt-1 text-sm text-primary-foreground/60">
                  CRM, Calendly, WhatsApp API, email automatizado, Make / n8n,
                  motor de IA propietario.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Pipeline */}
          <div className="flex flex-col items-center">
            {pipeline.map((step, index) => (
              <div key={step.label} className="flex w-full max-w-md flex-col items-center">
                <div className="w-full rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                  <p className="font-heading text-base font-semibold text-primary-foreground">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm text-primary-foreground/60">
                    {step.detail}
                  </p>
                  <p className="mt-2 text-xs font-medium text-secondary">
                    {step.tech}
                  </p>
                </div>
                {index < pipeline.length - 1 && (
                  <div className="flex h-8 items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-primary-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
