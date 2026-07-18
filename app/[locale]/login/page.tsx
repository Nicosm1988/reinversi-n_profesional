"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/security/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export default function LoginPage() {
  const t = useTranslations("Login");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();
  const isAuthAvailable = Boolean(supabase);

  function getNextPath() {
    const fallback = window.location.pathname.startsWith("/en")
      ? "/en/diagnostico/ancla-de-carrera"
      : "/diagnostico/ancla-de-carrera";
    const params = new URLSearchParams(window.location.search);
    return sanitizeNextPath(params.get("next"), fallback);
  }

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (active && data.user) {
        window.location.replace(getNextPath());
      }
    })();

    return () => {
      active = false;
    };
  }, [supabase]);

  const handleOAuthLogin = async () => {
    if (!supabase) {
      console.error("Supabase no esta configurado para OAuth.");
      return;
    }

    try {
      setIsLoading("google");
      const nextPath = getNextPath();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setIsLoading(null);
    }
  };

  return (
    <div className="wati-page-shell min-h-screen flex flex-col justify-center">
      <Container>
        <div className="max-w-md mx-auto w-full">
          <FadeIn>
            <Card className="border-primary/10 bg-background/95 backdrop-blur-xl">
              <CardHeader className="text-center pb-8 pt-8 space-y-4">
                <Heading level="h1" className="text-2xl font-bold font-heading">{t("title")}</Heading>
                <CardDescription className="text-base">{t("description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-full transition-all font-medium text-base relative overflow-hidden group"
                  onClick={handleOAuthLogin}
                  disabled={isLoading !== null || !isAuthAvailable}
                >
                  <span className={`flex items-center justify-center gap-3 transition-transform duration-300 ${isLoading === "google" ? "translate-y-[-150%]" : "translate-y-0"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    {t("continueGoogle")}
                  </span>
                  {isLoading === "google" && (
                    <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </Button>

                <div className="mt-8 text-center px-4">
                  {!isAuthAvailable && (
                    <Text variant="small" className="text-destructive block mb-2">
                      Inicio de sesion no disponible: faltan variables de Supabase en este entorno.
                    </Text>
                  )}
                  <Text variant="small" className="text-muted-foreground">{t("termsNotice")}</Text>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}
