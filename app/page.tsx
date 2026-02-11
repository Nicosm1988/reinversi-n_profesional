import Link from "next/link"
import { ArrowRight, Brain, Briefcase, CheckCircle2, FlaskConical, LayoutDashboard, LineChart, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F172A] text-white selection:bg-green-500/30">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">ReINversión</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#problema" className="hover:text-white transition-colors">El Problema</Link>
            <Link href="#metodo" className="hover:text-white transition-colors">Método</Link>
            <Link href="#caminos" className="hover:text-white transition-colors">Caminos</Link>
            <Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="#diagnostico"
              className="hidden sm:inline-flex items-center justify-center rounded-md bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-colors"
            >
              Diagnóstico gratuito
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 w-fit">
                  <Brain className="mr-2 h-4 w-4" />
                  Plataforma Humano + IA
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  No estás perdido.<br />
                  Estás en transición.
                </h1>

                <p className="max-w-[600px] text-gray-400 md:text-xl leading-relaxed">
                  Convertimos la incertidumbre en dirección estratégica. Un sistema integral de reinvención profesional que combina inteligencia artificial con acompañamiento humano experto.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="#diagnostico"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-[#16A34A] px-8 text-sm font-medium text-white shadow hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 transition-colors"
                  >
                    Hacé tu diagnóstico gratuito
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="#metodo"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 bg-white/5 px-8 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 transition-colors"
                  >
                    Conocé el método
                  </Link>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-center space-y-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-3xl font-bold text-[#4ADE80]">+2.500</div>
                  <p className="text-sm text-gray-400">Profesionales acompañados</p>
                </div>
                <div className="flex flex-col justify-center space-y-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-3xl font-bold text-[#4ADE80]">94%</div>
                  <p className="text-sm text-gray-400">Tasa de recolocación</p>
                </div>
                <div className="flex flex-col justify-center space-y-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-3xl font-bold text-[#4ADE80]">45 días</div>
                  <p className="text-sm text-gray-400">Tiempo promedio de proceso</p>
                </div>
                <div className="flex flex-col justify-center space-y-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-3xl font-bold text-[#4ADE80]">5 rutas</div>
                  <p className="text-sm text-gray-400">De reinvención disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: El Contexto (White Background) */}
        <section id="problema" className="py-20 md:py-32 bg-slate-50 text-slate-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-sm font-semibold tracking-wide text-[#16A34A] uppercase">El Contexto</h2>
              <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                Si te sentís identificado con algo de esto, no estás solo
              </h3>
              <p className="text-lg text-slate-600">
                Millones de profesionales enfrentan estos desafíos hoy. El problema no sos vos. El problema es no tener un sistema para resolverlo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: "La IA avanza y no sabés cómo adaptarte",
                  desc: "Sentís que la tecnología te dejó atrás. Tu industria cambió y nadie te preparó para esto."
                },
                {
                  icon: LineChart,
                  title: "Desactualización profesional",
                  desc: "Tus habilidades ya no coinciden con lo que el mercado demanda. El gap crece cada día."
                },
                {
                  icon: FlaskConical,
                  title: "Burnout y agotamiento laboral",
                  desc: "Estás fundido. No es solo cansancio: es una señal de que necesitás un cambio estructural."
                },
                {
                  icon: Briefcase,
                  title: "Pérdida de empleo",
                  desc: "Te desvincularon o tu puesto desapareció. La incertidumbre financiera y emocional te paraliza."
                },
                {
                  icon: Users,
                  title: "Confusión vocacional",
                  desc: "Sabés que querés un cambio, pero no tenés claro hacia dónde ni cómo dar el primer paso."
                }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 mb-4 group-hover:bg-[#EFF6FF] transition-colors">
                    <item.icon className="h-6 w-6 text-slate-700 group-hover:text-[#1D4ED8]" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Método (Timeline) */}
        <section id="metodo" className="py-20 md:py-32 bg-[#F8FAFC] text-slate-900 border-t border-slate-200">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">NUESTRO MÉTODO</h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Un proceso estructurado para garantizar resultados.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-300 md:left-1/2 md:-ml-px"></div>

              <div className="space-y-12">
                {[
                  {
                    title: "Pre-análisis con IA",
                    width: "30-45 min",
                    tag: "Humano",
                    desc: "Nuestra inteligencia artificial procesa tus respuestas y genera un informe preliminar con patrones, riesgos y oportunidades detectadas."
                  },
                  {
                    title: "Triage con coach",
                    width: "30-45 min",
                    tag: "Humano",
                    desc: "Un coach certificado revisa el informe de IA, valida el análisis y define con vos el mejor camino de intervención."
                  },
                  {
                    title: "Psicología laboral",
                    width: "Si aplica",
                    tag: "Bienestar",
                    desc: "Si el diagnóstico lo sugiere, accedés a sesiones con psicóloga laboral para trabajar aspectos emocionales que impactan tu carrera."
                  },
                  {
                    title: "Branding y posicionamiento",
                    width: "2-4 semanas",
                    tag: "Estrategia",
                    desc: "Construimos tu marca profesional: CV estratégico, perfil de LinkedIn optimizado, narrativa personal y plan de visibilidad."
                  }
                ].map((step, i) => (
                  <div key={i} className={`relative flex items-center md:justify-between ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="absolute left-8 -ml-3 h-6 w-6 rounded-full border-4 border-white bg-[#1D4ED8] md:left-1/2 md:right-auto md:-ml-3"></div>
                    <div className="ml-20 md:ml-0 md:w-5/12">
                      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{step.width}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${step.tag === 'Humano' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {step.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                    <div className="hidden md:block md:w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/10 bg-[#0F172A] py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} ReINversión Profesional. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
