"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                        </svg>
                                        Continuar con Google
                                    </span>
                                    {isLoading === 'google' && (
                                        <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                                            <path fill="#0a66c2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
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
