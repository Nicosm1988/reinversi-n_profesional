"use client";

import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { Zap, Bot, Users } from "lucide-react";

export function AutomationSection() {
    return (
        <Section spacing="xl" className="bg-[#1C1C1C] text-[#F7F4EF] py-32 relative overflow-hidden">
            {/* Abstract Tech Element */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[120px] pointer-events-none opacity-20"></div>

            <Container>
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-white/70 mb-8">
                            <Zap className="h-3 w-3" />
                            <span>POWERED BY N8N + OPENAI</span>
                        </div>
                        <Heading level="h2" className="text-[#F7F4EF] mb-6">
                            Tecnología Invisible, <br />
                            Impacto Humano.
                        </Heading>
                        <Text className="text-white/60 text-lg mb-8">
                            Nuestra arquitectura de automatización elimina la fricción administrativa.
                            Mientras la IA procesa datos y agendas, nuestros expertos se dedican 100% a escucharte.
                        </Text>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-primary/20 p-2 rounded-lg">
                                    <Bot className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Análisis por IA en tiempo real</h4>
                                    <p className="text-white/50 text-sm">GPT-4o procesa tu perfil instantáneamente para detectar patrones.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-secondary/20 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Matching Experto</h4>
                                    <p className="text-white/50 text-sm">Te conectamos con el coach que mejor conoce tu industria, no uno genérico.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} className="relative">
                        <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-20"></div>
                            <code className="text-sm font-mono text-primary-foreground/80 space-y-2 block">
                                <div className="opacity-50"># System Analysis</div>
                                <div><span className="text-purple-400">const</span> <span className="text-blue-400">candidate</span> = <span className="text-yellow-400">await</span> analyzeProfile(user);</div>
                                <div><span className="text-purple-400">if</span> (candidate.potential &gt; <span className="text-green-400">0.9</span>) {'{'}</div>
                                <div className="pl-4"><span className="text-blue-400">reinventionPath</span>.init();</div>
                                <div>{'}'}</div>
                                <div className="mt-4 opacity-50">// Human verified</div>
                                <div className="text-green-400">✓ Strategy Generated</div>
                            </code>
                        </div>
                    </FadeIn>

                </div>
            </Container>
        </Section>
    );
}
