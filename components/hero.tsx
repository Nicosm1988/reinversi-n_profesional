import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-primary pt-20"
    >
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Sparkles className="h-4 w-4" />
              <span>Plataforma Humano + IA</span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance">
                No estás perdido.
                <br />
                Estás en{" "}
                <span className="relative">
                  transición.
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-secondary" />
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/70">
              Convertimos la incertidumbre en dirección estratégica. Un sistema
              integral de reinvención profesional que combina inteligencia
              artificial con acompañamiento humano experto.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#diagnostico"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-3.5 text-base font-semibold text-secondary-foreground transition-all hover:opacity-90"
              >
                Hacé tu diagnóstico gratuito
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#metodo"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Conocé el método
              </a>
            </div>
          </div>

          {/* Right - Stats cards */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <StatCard number="+2.500" label="Profesionales acompañados" />
              <StatCard number="94%" label="Tasa de recolocación" />
              <StatCard number="45 días" label="Tiempo promedio de proceso" />
              <StatCard number="5 rutas" label="De reinvención disponibles" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
      <p className="font-heading text-3xl font-bold text-secondary">{number}</p>
      <p className="mt-1 text-sm text-primary-foreground/60">{label}</p>
    </div>
  );
}
