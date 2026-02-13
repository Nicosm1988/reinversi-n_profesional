import { Zap, Bot, Users, FileText, Send } from "lucide-react";

export function AutomationSection() {
    return (
        <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-4">
                            <Zap className="h-4 w-4" />
                            <span>POWERED BY N8N + OPENAI</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                            Tecnología Invisible, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Impacto Humano.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Nuestra arquitectura de automatización elimina la fricción administrativa.
                            Mientras la IA procesa datos y agendas, nuestros expertos se dedican 100% a escucharte.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Análisis de perfil en tiempo real con GPT-4o.",
                                "Matching automático con el coach ideal.",
                                "Generación de reportes de branding instantáneos."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        {/* Mockup Diagram */}
                        <div className="relative p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">

                            {/* Flow */}
                            <div className="flex flex-col gap-6">
                                {/* Step 1 */}
                                <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 animate-pulse-slow">
                                    <FileText className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-slate-600 rounded mb-2"></div>
                                        <div className="h-1.5 w-full bg-slate-700 rounded"></div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">INPUT</span>
                                </div>

                                {/* Arrow */}
                                <div className="h-8 w-px bg-slate-700 mx-auto"></div>

                                {/* Step 2 AI */}
                                <div className="flex items-center gap-4 p-4 bg-emerald-950/30 rounded-lg border border-emerald-900/50">
                                    <Bot className="text-emerald-400" />
                                    <div className="flex-1">
                                        <div className="text-xs text-emerald-400 font-mono mb-1">AI PROCESSING...</div>
                                        <div className="h-1.5 w-32 bg-emerald-900 rounded"></div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="h-8 w-px bg-slate-700 mx-auto"></div>

                                {/* Step 3 Human */}
                                <div className="flex items-center gap-4 p-4 bg-blue-950/30 rounded-lg border border-blue-900/50">
                                    <Users className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="text-xs text-blue-400 font-mono mb-1">HUMAN EXPERT</div>
                                        <div className="h-1.5 w-full bg-blue-900 rounded"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
