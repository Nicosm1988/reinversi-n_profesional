import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FAQSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>

                <div className="space-y-4">
                    {[
                        { q: "¿Es terapia psicológica?", a: "No. Aunque usamos herramientas de psicología laboral, esto es un proceso estratégico orientado a objetivos profesionales, no clínicos." },
                        { q: "¿Cuánto dura el proceso?", a: "Depende de tu ritmo. El diagnóstico es inmediato. Un plan de reinvención típico dura entre 4 y 8 semanas." },
                        { q: "¿La IA toma decisiones por mí?", a: "Jamás. La IA procesa datos para darte opciones que quizás no considerabas. Tú y tu coach siempre tienen la última palabra." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                            <p className="text-slate-600 text-sm">{item.a}</p>
                        </div>
                    ))}
                </div>

                {/* Final CTA */}
                <div className="mt-24 text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-emerald-50 opacity-50 -z-10"></div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
                        Tu transición empieza hoy.
                    </h2>
                    <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
                        Deja de adivinar. Empieza a construir tu futuro con datos, estrategia y soporte real.
                    </p>
                    <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-2xl hover:scale-105 transition-all">
                        Hacé tu diagnóstico ahora <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
