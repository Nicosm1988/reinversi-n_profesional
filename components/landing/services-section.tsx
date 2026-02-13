import { Check } from "lucide-react";

const services = [
    {
        title: "Diagnóstico",
        price: "Gratuito",
        desc: "Punto de partida.",
        features: ["Test de 15 minutos", "Informe preliminar IA", "Identificación de brechas"],
        cta: "Comenzar Ahora",
        highlight: false
    },
    {
        title: "Pack Triage",
        price: "$150 USD",
        desc: "Claridad inmediata.",
        features: ["Sesión 1:1 con Coach (60m)", "Análisis profundo de perfil", "Mapa de ruta personalizado"],
        cta: "Agendar Sesión",
        highlight: false
    },
    {
        title: "Reinvención Total",
        price: "$850 USD",
        desc: "Transformación completa.",
        features: [
            "Todo lo del Pack Triage",
            "Branding (CV, LinkedIn, Pitch)",
            "4 Sesiones de Coaching",
            "Simulacros de entrevista",
            "Acceso a red de contactos"
        ],
        cta: "Aplicar al Programa",
        highlight: true
    }
];

export function ServicesSection() {
    return (
        <section className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                        Inversión Transparente
                    </h2>
                    <p className="text-lg text-slate-500">
                        Sin costos ocultos ni compromisos a largo plazo obligatorios. Pagas por el valor que necesitas en cada etapa.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {services.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative p-8 rounded-2xl border ${plan.highlight ? 'border-blue-200 bg-blue-50/50 shadow-xl ring-1 ring-blue-200' : 'border-slate-100 bg-white shadow-sm'} flex flex-col`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                    Más Elegido
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-slate-900">{plan.title}</h3>
                                <div className="mt-2 flex items-baseline gap-x-2">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-500">/ único</span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-500">{plan.desc}</p>
                            </div>

                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#"
                                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${plan.highlight
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600 shadow-lg shadow-blue-600/20'
                                        : 'bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
                                    }`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
