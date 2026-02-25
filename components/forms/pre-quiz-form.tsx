"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, UserCircle2 } from "lucide-react";

const preQuizSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18 && Number(val) <= 90, {
        message: "Debes ingresar una edad válida (18-90)",
    }),
    occupation: z.string().min(3, "La ocupación es requerida"),
    city: z.string().min(2, "La ciudad es requerida"),
    country: z.string().min(2, "El país es requerido"),
});

export type PreQuizData = z.infer<typeof preQuizSchema>;

interface PreQuizFormProps {
    onSubmit: (data: PreQuizData) => void;
}

export function PreQuizForm({ onSubmit }: PreQuizFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<PreQuizData>({
        resolver: zodResolver(preQuizSchema),
        mode: "onChange",
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="max-w-xl mx-auto border-primary/20 shadow-xl bg-background/95 backdrop-blur-sm">
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="¿Cómo te llamas?"
                                placeholder="Ej. Martín"
                                {...register("name")}
                                error={errors.name?.message}
                            />
                            <Input
                                label="¿Qué edad tienes?"
                                placeholder="Ej. 34"
                                type="number"
                                {...register("age")}
                                error={errors.age?.message}
                            />
                        </div>

                        <Input
                            label="¿Cuál es tu ocupación o rol principal actual?"
                            placeholder="Ej. Líder de Operaciones, Arquitecto, etc."
                            {...register("occupation")}
                            error={errors.occupation?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Ciudad"
                                placeholder="Ej. Buenos Aires"
                                {...register("city")}
                                error={errors.city?.message}
                            />
                            <Input
                                label="País"
                                placeholder="Ej. Argentina"
                                {...register("country")}
                                error={errors.country?.message}
                            />
                        </div>

                        <div className="pt-4 border-t mt-8">
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="w-full h-14 rounded-full text-lg shadow-lg"
                            >
                                {isSubmitting ? "Analizando..." : "Ver mis resultados"} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
