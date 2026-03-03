import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Esquema de la respuesta estructurada que esperamos de la IA
const diagnosticResultSchema = z.object({
    title: z.string().describe("El arquetipo de ancla de carrera corto pero potente."),
    summary: z.string().describe("Resumen de 2 párrafos enfocado en su ocupación actual."),
    frictionAreas: z.array(z.string()).describe("Lista de 3 áreas probables de sufrimiento en su edad/rol actual."),
    idealEcosystem: z.string().describe("Qué debe buscar en su próximo movimiento laboral adaptado a su contexto demográfico."),
    strategicQuestion: z.string().describe("Una pregunta potente al final para invitarlo a la reflexión.")
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Analyzing diagnostic...", body);

        // Validar en caso de que no haya configurado OPENAI_API_KEY localmente aun
        if (!process.env.OPENAI_API_KEY) {
            console.warn("NO OPENAI_API_KEY FOUND. Returning mock structure.");
            return NextResponse.json({
                title: "Arquetipo (Modo Demo sin API Key)",
                summary: "Debido a que no se ha configurado la clave de OpenAI (OPENAI_API_KEY) en el entorno (.env), estamos devolviendo esta estructura genérica para evitar que el flujo se rompa. En producción, aquí iría el análisis profundo generado por AI cruzando tu edad (" + body.userData.age + ") y rol (" + body.userData.occupation + ").",
                frictionAreas: ["Fricción Mock 1", "Fricción Mock 2", "Fricción Mock 3"],
                idealEcosystem: "Ecosistema Ideal Mock",
                strategicQuestion: "¿Cuál es tu próximo paso estratégico (Mock)?"
            });
        }

        const prompt = `
      Actúa como Consultor de Carrera Premium especializado en el modelo de Edgar Schein.
      
      Tenemos un usuario con estos datos demográficos y profesionales:
      - Edad: ${body.userData.age}
      - Rol/Ocupación: ${body.userData.occupation}
      - Ubicación: ${body.userData.city}, ${body.userData.country}
      
      El resultado estadístico predominante de su Ancla de Carrera es: "${body.anchor.name}"
      
      Tu tarea es redactar una devolución ÚNICA Y PERSONALIZADA para esta persona, que vincule la teoría del ancla con su momento vital (edad), su ocupación actual y mercado local si aplica.
      
      REGLA ESTRICTA DE PRIVACIDAD: JAMÁS debes mencionar o devolver el nombre o correo del usuario ("${body.userData.name}"). Úsalo solo para tú análisis interno de empatía si quieres, pero en la salida háblale siempre "a esa persona", ej: "En tu perfil de Consultor a tus 35 años...".
      
      MANTÉN UN TONO: "Editorial Warmth". Autoridad, contención, sin exageraciones, directo al grano y muy profesional. NUNCA MENCIONES que eres una IA.
    `;

        const result = await generateObject({
            model: openai('gpt-4o'),
            schema: diagnosticResultSchema,
            prompt: prompt,
            temperature: 0.5,
        });

        return NextResponse.json(result.object);

    } catch (error) {
        console.error('Error generating diagnostic:', error);
        return NextResponse.json({ error: 'Failed to analyze diagnostic' }, { status: 500 });
    }
}
