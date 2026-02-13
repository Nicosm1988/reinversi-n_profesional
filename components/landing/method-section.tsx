const steps = [
    {
        number: "01",
        title: "Diagnóstico Inteligente",
        description: "Test profundo de 15 minutos que evalúa tus hard y soft skills, valores y momento vital."
    },
    {
        number: "02",
        title: "Pre-análisis con IA",
        description: "Nuestros algoritmos cruzan tu perfil con tendencias de mercado global para detectar oportunidades."
    },
    {
        number: "03",
        title: "Triage con Experto",
        description: "Sesión 1:1 con un estratega senior para validar los hallazgos de la IA y definir la ruta real."
    },
    {
        number: "04",
        title: "Estrategia & Branding",
        description: "Construcción de tu nueva narrativa: CV, LinkedIn y Pitch personal optimizados para conversión."
    },
    {
        number: "05",
        title: "Lanzamiento Guiado",
        description: "Acciones concretas de networking y aplicación. No te soltamos hasta que estés en camino."
    }
];

export function MethodSection() {
    return (
        <section id="metodo" className="py-24 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <div>
                        <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Nuestro Método</span>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mt-2 mb-6">
                            Ciencia y Humanidad <br />
                            <span className="text-slate-400">Trabajando Juntos</span>
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 max-w-lg">
                            No es magia. Es un proceso estructurado en 5 etapas diseñado para eliminar el ruido mental y generar tracción real.
                        </p>

                        {/* Disclaimer Ethics */}
                        <div className="p-4 bg-slate-50 border-l-4 border-blue-600 rounded-r-lg max-w-md">
                            <p className="text-sm text-slate-700 italic">
                                "La IA sugiere caminos basados en datos, pero tú y tu coach deciden la estrategia final. La tecnología es el copiloto, tú eres el piloto."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {steps.map((step, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                {/* Icon / Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-slate-500">
                                    {i + 1}
                                </div>

                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h3 className="font-bold text-slate-900">{step.title}</h3>
                                        <span className="text-xs font-mono text-slate-300">Phase {step.number}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
