import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Si "next" viene por parámetro, lo usamos. Sino redirigimos a dashboard o "/"
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error("Auth callback error:", error)
    }

    // Si hay error, enviamos al usuario de nuevo a login con flag de error
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
