"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { Chrome, Linkedin } from "lucide-react";
import { FadeIn } from "@/components/motion";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const supabase = createClient();

    const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
        try {
            setIsLoading(provider);
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    // Request specific scopes for LinkedIn if needed, but defaults are usually fine
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error(`Error logging in with ${provider}:`, error);
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col justify-center">
            <Container>
                <div className="max-w-md mx-auto w-full">
                    <FadeIn>
                        <Card className="border-primary/10 shadow-2xl bg-background/95 backdrop-blur-xl">
                            <CardHeader className="text-center pb-8 pt-8 space-y-4">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                                    <svg
                                        className="w-6 h-6 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                    </svg>
                                </div>
                                <CardTitle className="text-2xl font-bold font-heading">Bienvenido</CardTitle>
                                <CardDescription className="text-base">
                                    Inicia sesión para acceder a tu historial de diagnósticos y sesiones de reinvención.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pb-8">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-full border-muted-foreground/20 hover:bg-muted/50 transition-all font-medium text-base relative overflow-hidden group"
                                    onClick={() => handleOAuthLogin('google')}
                                    disabled={isLoading !== null}
                                >
                                    <span className={`flex items-center justify-center gap-3 transition-transform duration-300 ${isLoading === 'google' ? 'translate-y-[-150%]' : 'translate-y-0'}`}>
                                        <Chrome className="w-5 h-5 text-foreground/80" />
                                        Continuar con Google
                                    </span>
                                    {isLoading === 'google' && (
                                        <div className="absolute inset-0 flex items-center justify-center text-primary">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-full border-muted-foreground/20 hover:bg-[#0077b5]/5 transition-all font-medium text-base relative overflow-hidden group"
                                    onClick={() => handleOAuthLogin('linkedin_oidc')}
                                    disabled={isLoading !== null}
                                >
                                    <span className={`flex items-center justify-center gap-3 transition-transform duration-300 ${isLoading === 'linkedin_oidc' ? 'translate-y-[-150%]' : 'translate-y-0'}`}>
                                        <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                        Continuar con LinkedIn
                                    </span>
                                    {isLoading === 'linkedin_oidc' && (
                                        <div className="absolute inset-0 flex items-center justify-center text-[#0077b5]">
                                            <div className="w-5 h-5 border-2 border-[#0077b5] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </Button>

                                <div className="mt-8 text-center px-4">
                                    <Text variant="small" className="text-muted-foreground">
                                        Al continuar, aceptas nuestros términos de servicio y políticas de privacidad.
                                    </Text>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>
            </Container>
        </div>
    );
}
