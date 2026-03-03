"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Container } from "@/components/layout/container";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, BarChart3, Sparkles } from "lucide-react";
import quizData from "@/lib/data/anchors.json";
import Link from "next/link";
import { PreQuizForm, type PreQuizData } from "@/components/forms/pre-quiz-form";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Step = "intro" | "questions" | "transition" | "bonus" | "pre-quiz" | "results";

export function CareerQuiz() {
    const [step, setStep] = useState<Step>("intro");
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [bonusQuestions, setBonusQuestions] = useState<number[]>([]);
    const [userData, setUserData] = useState<PreQuizData | null>(null);
    const [aiResult, setAiResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Auth and Flow states
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState<string | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const supabase = createClient();

    // Rehydrate state after OAuth redirect
    useEffect(() => {
        const checkSessionAndSavedState = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const savedStateStr = localStorage.getItem('careerQuizState');

                if (savedStateStr) {
                    const savedState = JSON.parse(savedStateStr);
                    setAnswers(savedState.answers || {});
                    setBonusQuestions(savedState.bonusQuestions || []);

                    if (session?.user && savedState.status === 'awaiting_results') {
                        // User is logged in and completed questions, move to pre-quiz for details
                        setStep("pre-quiz");
                        localStorage.removeItem('careerQuizState');
                    }
                }
            } catch (error) {
                console.error("Error evaluating session:", error);
            } finally {
                setIsCheckingSession(false);
            }
        };

        checkSessionAndSavedState();
    }, [supabase.auth]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const handleAnswer = (questionId: number, value: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleBonusToggle = (questionId: number) => {
        setBonusQuestions(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(id => id !== questionId);
            }
            if (prev.length < 3) {
                return [...prev, questionId];
            }
            return prev;
        });
    };

    const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
        try {
            setIsAuthLoading(provider);
            // Save state before redirecting out of the app
            localStorage.setItem('careerQuizState', JSON.stringify({
                answers,
                bonusQuestions,
                status: 'awaiting_results'
            }));

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/diagnostico/ancla-de-carrera`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error(`Error logging in with ${provider}:`, error);
            setIsAuthLoading(null);
        }
    };

    const submitAndAnalyze = async (data: PreQuizData) => {
        setUserData(data);
        setIsAnalyzing(true);
        setStep("results");
        try {
            const dominantAnchor = calculateResults?.[0];
            if (dominantAnchor) {
                // Call AI SDK Analyze
                const res = await fetch('/api/diagnostics/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ anchor: dominantAnchor, userData: data })
                });
                const aiData = await res.json();
                setAiResult(aiData);

                // Save to Profile
                await fetch('/api/diagnostics/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        diagnosticType: 'career_anchor',
                        userData: data,
                        rawAnswers: { ...answers, bonus: bonusQuestions },
                        dominantResult: dominantAnchor,
                        aiFeedback: aiData
                    })
                }).catch(e => console.error("Not saved (possibly unauthenticated)", e));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const allAnswered = Object.keys(answers).length >= quizData.questions.length;

    const calculateResults = useMemo(() => {
        if (!allAnswered) return null;

        const results = quizData.anchors.map(anchor => {
            let total = 0;
            anchor.questions.forEach(qId => {
                total += answers[qId] || 0;
                if (bonusQuestions.includes(qId)) {
                    total += 4;
                }
            });
            return {
                ...anchor,
                score: total,
                mean: total / 5
            };
        });

        return results.sort((a, b) => b.score - a.score);
    }, [answers, bonusQuestions, allAnswered]);

    // Avoid flashing Intro if we're checking session and redirecting
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

            <Container>
                <div className="max-w-4xl mx-auto py-12 md:py-20">
                    <AnimatePresence mode="wait">

                        {/* ─── STEP 1: INTRO ─── */}
                        {step === "intro" && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8 text-center"
                            >
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-secondary/10 text-secondary mb-4">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Modelo de Edgar Schein
                                </div>
                                <Heading level="h2" className="text-4xl md:text-5xl">¿Cuál es tu Ancla de Carrera?</Heading>
                                <div className="space-y-6 text-left bg-background p-8 rounded-2xl border shadow-sm">
                                    <Text variant="lead" className="font-semibold text-primary">
                                        El GPS interno que orienta tu reinvención.
                                    </Text>
                                    <Text>
                                        Edgar Schein, psicólogo especializado en el ambito laboral desarrolló este concepto para identificar los aspectos de tu perfil que garantizan una <strong>&quot;sintonía&quot; real</strong> entre tus expectativas y tu entorno laboral.
                                    </Text>
                                    <Text>
                                        Tu ancla de carrera es esa combinación única de capacidades, motivaciones y valores a los que <strong>no renunciarías</strong> fácilmente. Conocerla es fundamental en una reinvención profesional porque actúa como la fuerza impulsora que te permite gestionar el cambio en coherencia durante todo el proceso.
                                    </Text>
                                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                                        <div className="flex gap-3">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            </div>
                                            <Text variant="small">Identifica tus motivaciones profundas</Text>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            </div>
                                            <Text variant="small">Evita decisiones laborales incompatibles</Text>
                                        </div>
                                    </div>
                                </div>
                                <Button size="lg" className="rounded-full px-12 h-14 text-lg" onClick={() => setStep("questions")}>
                                    Comenzar Test <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {/* ─── STEP 2: ALL 40 QUESTIONS ON ONE PAGE ─── */}
                        {step === "questions" && (
                            <motion.div
                                key="questions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="border-none shadow-xl bg-background/80 backdrop-blur-sm">
                                    <CardHeader className="text-center pb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                                        <div className="flex justify-between items-center mb-2">
                                            <Text variant="small" className="text-muted-foreground">
                                                Respondidas: {Object.keys(answers).length} de {quizData.questions.length}
                                            </Text>
                                            <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(Object.keys(answers).length / quizData.questions.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <CardTitle>Cuestionario de Identificación</CardTitle>
                                        <CardDescription>Responde cada pregunta según la escala: 1 (Nunca) hasta 6 (Siempre)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-10 pt-8 pb-8">
                                        {quizData.questions.map((q) => (
                                            <div key={q.id} className="space-y-4">
                                                <div className="flex gap-4">
                                                    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${answers[q.id] !== undefined ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                                        {q.id}
                                                    </span>
                                                    <Text className="text-lg font-medium leading-tight">{q.text}</Text>
                                                </div>
                                                <div className="flex justify-between items-center gap-1 sm:gap-4 ml-12">
                                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                                        <button
                                                            key={num}
                                                            onClick={() => handleAnswer(q.id, num)}
                                                            className={`flex-1 h-12 rounded-lg border transition-all duration-200 flex items-center justify-center font-bold text-sm 
                                ${answers[q.id] === num
                                                                    ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                                                                    : "bg-background border-muted hover:border-primary/50 hover:bg-primary/5"}`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between px-12 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                    <span>Nunca</span>
                                                    <span>Siempre</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t bg-muted/30 rounded-b-xl p-6 sticky bottom-0 backdrop-blur-sm">
                                        <Button variant="ghost" onClick={() => setStep("intro")}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                                        </Button>
                                        <Button
                                            disabled={!allAnswered}
                                            onClick={() => setStep("transition")}
                                            className="rounded-full px-8 bg-secondary hover:bg-secondary/90 text-white"
                                        >
                                            {allAnswered ? "Continuar" : `Faltan ${quizData.questions.length - Object.keys(answers).length} respuestas`} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ─── STEP 3: TRANSITION ─── */}
                        {step === "transition" && (
                            <motion.div
                                key="transition"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="text-center space-y-8 py-16"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-4">
                                    <Sparkles className="h-10 w-10 text-secondary" />
                                </div>
                                <Heading level="h2" className="text-3xl md:text-4xl">
                                    Último paso, ¡ya casi llegás al resultado!
                                </Heading>
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <Text variant="lead" className="text-primary/80">
                                        Ahora te vamos a mostrar las 40 preguntas una vez más.
                                    </Text>
                                    <Text>
                                        Esta vez, necesitamos que elijas las <strong>3 preguntas que sentís como verdades absolutas</strong> sobre tu perfil profesional. Esas que, sin importar las circunstancias, siempre te representan.
                                    </Text>
                                    <Text variant="small" className="text-muted-foreground">
                                        A esas 3 elecciones les asignaremos un bono de +4 puntos para definir con mayor precisión tu ancla dominante.
                                    </Text>
                                </div>
                                <Button
                                    size="lg"
                                    className="rounded-full px-12 h-14 text-lg"
                                    onClick={() => setStep("bonus")}
                                >
                                    Seleccionar mis 3 verdades <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {/* ─── STEP 4: BONUS SELECTION ─── */}
                        {step === "bonus" && (
                            <motion.div
                                key="bonus"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                            >
                                <Card className="border-primary/20 shadow-2xl">
                                    <CardHeader className="text-center bg-primary/5 border-b">
                                        <CardTitle className="text-2xl">Selección de Veracidad Máxima</CardTitle>
                                        <CardDescription className="text-base text-primary/80">
                                            Elegí las <strong>3 preguntas</strong> que sentís como verdades absolutas sobre tu perfil profesional.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="bg-muted/20 px-6 py-2 border-b flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <span>Elegí tus 3 verdades fundamentales</span>
                                            <span>Seleccionadas: {bonusQuestions.length} / 3</span>
                                        </div>
                                        <div className="grid gap-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            {quizData.questions.map((q) => (
                                                <button
                                                    key={q.id}
                                                    onClick={() => handleBonusToggle(q.id)}
                                                    disabled={!bonusQuestions.includes(q.id) && bonusQuestions.length >= 3}
                                                    className={`flex items-start gap-4 p-4 border-b transition-all text-left
                            ${bonusQuestions.includes(q.id)
                                                            ? "bg-primary/10 border-l-4 border-l-primary"
                                                            : "bg-background hover:bg-muted/30"} 
                            ${!bonusQuestions.includes(q.id) && bonusQuestions.length >= 3 ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}
                                                >
                                                    <div className={`mt-1.5 h-7 w-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                            ${bonusQuestions.includes(q.id) ? "bg-primary border-primary text-white" : "border-muted text-muted-foreground"}`}>
                                                        {bonusQuestions.includes(q.id) ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{q.id}</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <Text variant="small" className="leading-snug text-foreground/90 font-medium">{q.text}</Text>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 p-6">
                                        <div className="flex justify-between w-full items-center">
                                            <div className="flex flex-col">
                                                <Text variant="small" className="font-bold text-primary">Seleccionadas: {bonusQuestions.length} de 3</Text>
                                                {bonusQuestions.length < 3 && <Text variant="small" className="text-[10px] text-muted-foreground italic">Faltan {3 - bonusQuestions.length} selección(es)</Text>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" onClick={() => setStep("transition")}>Atrás</Button>
                                                <Button
                                                    disabled={bonusQuestions.length < 3}
                                                    className="rounded-full px-8 bg-primary shadow-lg shadow-primary/20"
                                                    onClick={async () => {
                                                        const { data: { user } } = await supabase.auth.getUser();
                                                        if (user) {
                                                            setStep("pre-quiz");
                                                        } else {
                                                            setIsAuthModalOpen(true);
                                                        }
                                                    }}
                                                >
                                                    Conocer mi resultado <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ─── STEP 4.5: DEMOGRAPHIC DATA (PRE-QUIZ) ─── */}
                        {step === "pre-quiz" && (
                            <motion.div
                                key="pre-quiz"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                            >
                                <div className="mb-8 text-center">
                                    <Heading level="h2">Ya tenemos procesadas tus respuestas</Heading>
                                    <Text className="text-muted-foreground mt-2 max-w-xl mx-auto">
                                        Para que nuestra Inteligencia Artificial evalúe de manera hiperpersonalizada tu Ancla Dominante, necesitamos algunos datos básicos sobre tu contexto actual.
                                    </Text>
                                </div>
                                <PreQuizForm onSubmit={submitAndAnalyze} />
                            </motion.div>
                        )}

                        {/* ─── STEP 5: RESULTS ─── */}
                        {step === "results" && calculateResults && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                {/* Results logic... */}
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold bg-green-100 text-green-700 border border-green-200">
                                        ¡Análisis Completado!
                                    </div>
                                    <Heading level="h2">Tu Mapa Estratégico de Carrera</Heading>
                                    <Text className="max-w-2xl mx-auto italic font-serif text-muted-foreground">
                                        &quot;El ancla de carrera es una combinación única de competencias, talentos, motivaciones y valores que nunca se abandonarán.&quot; — Edgar Schein
                                    </Text>
                                </div>

                                {/* ── RANKING 1 A 8 ── */}
                                <div>
                                    <Heading level="h3" className="mb-6">Ranking de tus Anclas de Carrera</Heading>
                                    <div className="grid gap-4">
                                        {calculateResults.map((result, idx) => (
                                            <div
                                                key={result.id}
                                                className={`p-5 rounded-xl border bg-background transition-all hover:shadow-md flex items-center gap-4
                            ${idx === 0 ? "border-primary/50 ring-2 ring-primary/10 shadow-md" : idx === 1 ? "border-secondary/40 ring-1 ring-secondary/10" : idx === 2 ? "border-secondary/20" : "border-muted"}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                            ${idx === 0 ? "bg-primary text-white" : idx === 1 ? "bg-secondary text-white" : idx === 2 ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`font-bold text-lg ${idx < 3 ? "text-foreground" : "text-muted-foreground"}`}>{result.name}</span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${idx === 0 ? "bg-primary" : idx === 1 ? "bg-secondary" : idx === 2 ? "bg-secondary/50" : "bg-muted-foreground/30"}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(result.score / (calculateResults[0]?.score || 1)) * 100}%` }}
                                                            transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── DETAILED DESCRIPTIONS FOR TOP 3 ── */}
                                <div className="space-y-10">
                                    <Heading level="h3">Tu Perfil en Profundidad</Heading>

                                    {calculateResults.slice(0, 3).map((result, idx) => (
                                        <Card key={result.id} className={`overflow-hidden ${idx === 0 ? "border-2 border-primary/20 shadow-xl" : idx === 1 ? "border-secondary/20 shadow-lg" : "border-muted shadow-md"}`}>
                                            <CardHeader className={`${idx === 0 ? "bg-primary/5" : idx === 1 ? "bg-secondary/5" : "bg-muted/30"} pb-6`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm border
                                ${idx === 0 ? "bg-white border-primary/10 text-primary" : idx === 1 ? "bg-white border-secondary/10 text-secondary" : "bg-white border-muted text-muted-foreground"}`}>
                                                        #{idx + 1}
                                                    </div>
                                                    <div>
                                                        <CardTitle className={`text-2xl ${idx === 0 ? "text-primary" : idx === 1 ? "text-secondary" : "text-foreground"}`}>
                                                            {result.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm mt-1">
                                                            {idx === 0 ? "Tu ancla dominante" : idx === 1 ? "Tu ancla secundaria" : "Tu tercera ancla"}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-8 pb-8 space-y-6">
                                                {(result as typeof result & { longDescription?: string }).longDescription?.split("\n\n").map((paragraph, pIdx) => (
                                                    <Text key={pIdx} className="text-base leading-relaxed text-foreground/85">
                                                        {paragraph}
                                                    </Text>
                                                ))}

                                                {idx === 0 && (
                                                    <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/15">
                                                        <Text className="text-base leading-relaxed">
                                                            Dado que tu ancla dominante es <strong>{result.article} {result.name}</strong>, cualquier movimiento estratégico que realices debería potenciar este aspecto de tu perfil. Ignorar{result.article === "el" ? "lo" : "la"} en tu próximo paso profesional generaría una sensación de insatisfacción que, con el tiempo, se vuelve difícil de sostener. <strong>Si querés diseñar tu siguiente movimiento profesional con claridad y acompañamiento experto, te invitamos a agendar una Sesión Estratégica 1:1</strong> donde analizaremos estos resultados en profundidad y definiremos juntos tu hoja de ruta.
                                                        </Text>
                                                        <div className="mt-6">
                                                            <Button asChild className="rounded-full px-8 h-12 bg-primary shadow-lg shadow-primary/20 text-base font-bold">
                                                                <Link href="#contacto">Agendar Sesión Estratégica</Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* ── AI PERSONALIZED FEEDBACK ── */}
                                {isAnalyzing && (
                                    <Card className="border-secondary/20 shadow-lg bg-secondary/5 mt-10">
                                        <CardContent className="pt-8 pb-8 text-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto"></div>
                                            <Heading level="h4">La IA de ReINversión está analizando tu perfil...</Heading>
                                            <Text className="text-muted-foreground">Cruzando tus 40 respuestas con tu perfil como {userData?.occupation || "profesional"}.</Text>
                                        </CardContent>
                                    </Card>
                                )}

                                {aiResult && !isAnalyzing && (
                                    <div className="mt-12 space-y-10">
                                        <Heading level="h3">Tu Análisis Ejecutivo Personalizado</Heading>
                                        <Card className="border-2 border-secondary/20 shadow-xl overflow-hidden">
                                            <CardHeader className="bg-secondary/5 pb-6">
                                                <CardTitle className="text-2xl text-secondary">{aiResult.title}</CardTitle>
                                                <CardDescription className="text-base text-foreground/80 mt-2 font-medium">
                                                    Análisis Basado en tu Perfil ({userData?.age || ""} años, {userData?.occupation || "Profesional"})
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-8 pb-8 space-y-8">
                                                <div className="space-y-4">
                                                    <Text className="text-base leading-relaxed text-foreground/90 font-medium">
                                                        {aiResult.summary}
                                                    </Text>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-4 bg-red-50/50 p-6 rounded-2xl border border-red-100">
                                                        <Heading level="h4" className="text-red-800 text-lg flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div> Puntos probables de fricción
                                                        </Heading>
                                                        <ul className="space-y-3">
                                                            {(aiResult.frictionAreas || []).map((friction: string, i: number) => (
                                                                <li key={i} className="text-sm text-red-900/80 leading-relaxed flex items-start gap-2">
                                                                    <span className="text-red-400 font-bold">•</span> {friction}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="space-y-4 bg-green-50/50 p-6 rounded-2xl border border-green-100">
                                                        <Heading level="h4" className="text-green-800 text-lg flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Tu ecosistema natural
                                                        </Heading>
                                                        <Text className="text-sm text-green-900/80 leading-relaxed">
                                                            {aiResult.idealEcosystem}
                                                        </Text>
                                                    </div>
                                                </div>

                                                <div className="mt-8 p-8 bg-muted/30 rounded-2xl border border-muted text-center space-y-4">
                                                    <Text variant="lead" className="font-serif italic text-foreground/80">
                                                        "{aiResult.strategicQuestion}"
                                                    </Text>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* ── CLOSING MESSAGE ── */}
                                <div className="text-center space-y-8 py-12">
                                    <div className="max-w-2xl mx-auto space-y-6">
                                        <Heading level="h3" className="text-2xl md:text-3xl">Cada recorrido es particular.</Heading>
                                        <Text className="text-lg leading-relaxed text-foreground/80">
                                            Por eso, darte el espacio para explorar el cambio que querés hacer, acompañado por profesionales especializados, puede ayudarte a transformar la incertidumbre en un plan coherente con vos.
                                        </Text>
                                    </div>
                                    <Button asChild size="lg" className="rounded-full px-12 h-14 text-lg shadow-xl">
                                        <Link href="#contacto">Agendá tu espacio</Link>
                                    </Button>

                                    <div className="pt-4">
                                        <Button variant="ghost" className="text-muted-foreground" onClick={() => {
                                            setStep("intro");
                                            setAnswers({});
                                            setBonusQuestions([]);
                                        }}>
                                            Reiniciar Test
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Container>

            {/* Auth Modal via Dialog */}
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <DialogContent className="sm:max-w-lg p-0 border-none bg-transparent shadow-none">
                    <Card className="border-primary/10 shadow-2xl bg-background/95 backdrop-blur-xl">
                        <CardHeader className="text-center pb-8 pt-8 space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl font-bold font-heading">
                                Tus resultados están listos
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Ingresá para guardar el progreso y ver tu Ancla de Carrera con la evaluación hiperpersonalizada por IA.
                            </DialogDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-8">
                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-full border-muted-foreground/20 hover:bg-muted/50 transition-all font-medium text-base relative overflow-hidden group"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={isAuthLoading !== null}
                            >
                                <span className={`flex items-center justify-center gap-3 transition-transform duration-300 ${isAuthLoading === 'google' ? 'translate-y-[-150%]' : 'translate-y-0'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                    </svg>
                                    Ingresar con Google
                                </span>
                                {isAuthLoading === 'google' && (
                                    <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-full border-muted-foreground/20 hover:bg-[#0077b5]/5 transition-all font-medium text-base relative overflow-hidden group"
                                onClick={() => handleOAuthLogin('linkedin_oidc')}
                                disabled={isAuthLoading !== null}
                            >
                                <span className={`flex items-center justify-center gap-3 transition-transform duration-300 ${isAuthLoading === 'linkedin_oidc' ? 'translate-y-[-150%]' : 'translate-y-0'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                                        <path fill="#0a66c2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    Ingresar con LinkedIn
                                </span>
                                {isAuthLoading === 'linkedin_oidc' && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[#0077b5]">
                                        <div className="w-5 h-5 border-2 border-[#0077b5] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </Button>

                            <div className="mt-4 text-center px-4">
                                <Text variant="small" className="text-muted-foreground">
                                    El registro es seguro y nos permite almacenar tus resultados para sesiones posteriores.
                                </Text>
                            </div>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary), 0.4);
        }
      `}</style>
        </div>
    );
}
