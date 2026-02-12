"use client"

import { SectionContainer } from '@/components/ui/section-container'
import { ArrowRight, Database, FileText, MessageSquare, UserCheck, Zap } from 'lucide-react'

export function AutomationSection() {
    return (
        <SectionContainer className="bg-slate-950 border-y border-white/5 overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-sm font-semibold tracking-wide text-purple-400 uppercase mb-4">
                        Tecnología Invisible
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Escalabilidad con <br />
                        Toque Humano
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Nuestra arquitectura técnica nos permite enfocarnos en lo que importa: vos.
                        Automatizamos la burocracia para liberar tiempo de calidad en las sesiones
                        de estrategia y coaching.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-gray-300">
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Zap className="h-5 w-5 text-purple-400" />
                            </div>
                            <p>Seguimiento proactivo de postulaciones</p>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Database className="h-5 w-5 text-purple-400" />
                            </div>
                            <p>Base de datos de mercado en tiempo real</p>
                        </div>
                    </div>
                </div>

                {/* Visual Pipeline Representation */}
                <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent rounded-3xl pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                            <span className="flex items-center gap-3 text-white font-medium">
                                <UserCheck className="h-5 w-5 text-green-400" /> Test Diagnóstico
                            </span>
                            <ArrowRightMini className="text-gray-600" />
                            <span className="text-xs text-gray-400 font-mono">CRM Entry</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                            <span className="flex items-center gap-3 text-white font-medium">
                                <Zap className="h-5 w-5 text-blue-400" /> Análisis IA
                            </span>
                            <ArrowRightMini className="text-gray-600" />
                            <span className="text-xs text-gray-400 font-mono">Report JSON</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                            <span className="flex items-center gap-3 text-white font-medium">
                                <MessageSquare className="h-5 w-5 text-orange-400" /> Coach Triage
                            </span>
                            <ArrowRightMini className="text-gray-600" />
                            <span className="text-xs text-gray-400 font-mono">Human Approval</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                            <span className="flex items-center gap-3 text-white font-medium">
                                <FileText className="h-5 w-5 text-pink-400" /> Entregables
                            </span>
                            <ArrowRightMini className="text-gray-600" />
                            <span className="text-xs text-gray-400 font-mono">Auto-Send</span>
                        </div>
                    </div>
                </div>
            </div>
        </SectionContainer>
    )
}

function ArrowRightMini({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
        >
            <path fillRule="evenodd" d="M6 8a.5.5 0 00.5.5h5.793l-2.147 2.146a.5.5 0 00.708.708l3-3a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L12.293 7.5H6.5A.5.5 0 006 8zm-2.5 7a.5.5 0 01-.5-.5v-13a.5.5 0 011 0v13a.5.5 0 01-.5.5z" clipRule="evenodd" />
        </svg>
    )
}
