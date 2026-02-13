import { Rocket, Target, Briefcase, RefreshCw, LayoutGrid } from "lucide-react";


const paths = [
    {
        icon: Rocket,
        title: "Reempleo Acelerado",
        desc: "Optimización quirúrgica de tu perfil para volver al mercado en tiempo récord.",
        badge: "Fast Track"
    },
    {
        icon: RefreshCw,
        title: "Re-skilling Guiado",
        desc: "Identificación de brechas tecnológicas y plan de aprendizaje curado por expertos.",
        badge: "Update"
    },
    {
        icon: Target,
        title: "Reposicionamiento Senior",
        desc: "Para líderes que buscan roles de impacto (C-Level, Advisory) y necesitan nueva narrativa.",
        badge: "Executive"
    },
    {
        icon: LayoutGrid,
        title: "Cambio Total (Pivot)",
        desc: "Diseño de una nueva carrera desde cero, aprovechando tus skills transferibles.",
        badge: "Transform"
    },
    {
        icon: Briefcase,
        title: "Emprendimiento",
        desc: "Validación de ideas de negocio y transición de empleado a fundador con bajo riesgo.",
        badge: "Venture"
    },
];

export function PathsSection() {
    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="mb-12">
                    <span className="text-secondary font-bold tracking-wide uppercase text-sm">Tu Futuro</span>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mt-2">
                        5 Caminos Posibles. <br />
                        <span className="text-slate-400">Una Sola Decisión: Empezar.</span>
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paths.map((path, i) => (
                        <div key={i} className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start">
                            <div className="absolute top-6 right-6">
                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-sm">
                                    {path.badge}
                                </span>
                            </div>

                            <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <path.icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {path.title}
                            </h3>

                            <p className="text-slate-600 leading-relaxed mb-6">
                                {path.desc}
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-50 w-full">
                                <button className="text-sm font-semibold text-slate-900 flex items-center group-hover:translate-x-1 transition-transform">
                                    Ver detalles <span className="ml-2">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
