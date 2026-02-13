import { BrainCircuit, Clock, TrendingDown, HelpCircle } from "lucide-react";

const problems = [
    {
        icon: BrainCircuit,
        title: "Miedo a la IA",
        description: "¿Sientes que la tecnología avanza más rápido que tu capacidad de adaptación? No estás solo.",
    },
    {
        icon: TrendingDown,
        title: "Desactualización",
        description: "Tu experiencia es valiosa, pero el mercado parece pedir habilidades que no terminas de dominar.",
    },
    {
        icon: Clock,
        title: "Burnout Profesional",
        description: "El éxito externo ya no compensa el vacío interno. Necesitas un cambio, pero no sabes hacia dónde.",
    },
    {
        icon: HelpCircle,
        title: "Confusión Vocacional",
        description: "Tantas opciones paralizan. Necesitas claridad para tomar la decisión correcta sin equivocarte.",
    },
];

export function ProblemSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                        Entendemos tu momento
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        La transición profesional es compleja. Identificamos los bloqueos más comunes para transformarlos en puntos de partida.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((item, i) => (
                        <div
                            key={i}
                            className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-slate-200"
                        >
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
