import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { diagnosticType, userData, rawAnswers, dominantResult, aiFeedback } = body;

        const { data, error } = await supabase
            .from('user_diagnostics')
            .insert({
                user_id: user.id,
                diagnostic_type: diagnosticType,
                user_data: userData,
                raw_answers: rawAnswers,
                dominant_result: dominantResult,
                ai_feedback: aiFeedback
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving diagnostic:', error);
            return NextResponse.json({ error: 'Failed to save diagnostic', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
