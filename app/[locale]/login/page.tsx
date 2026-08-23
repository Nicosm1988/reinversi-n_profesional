"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  initializeGoogleIdentityOnce,
  readGoogleClientId,
  replaceSessionWithGoogleIdToken,
} from "@/lib/supabase/google";
import { sanitizeNextPath } from "@/lib/security/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { UniverseField } from "@/components/visual/universe-field";

export default function LoginPage() {
  const t = useTranslations("Login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef("");
  const credentialInFlightRef = useRef(false);
  const googleButtonRenderedRef = useRef(false);
  const supabase = createClient();
  const googleClientId = readGoogleClientId();
  const isAuthAvailable = Boolean(supabase);

  const getNextPath = useCallback(() => {
    const fallback = window.location.pathname.startsWith("/en")
      ? "/en/test-anclas-de-carrera"
      : "/test-anclas-de-carrera";
    const params = new URLSearchParams(window.location.search);
    return sanitizeNextPath(params.get("next"), fallback);
  }, []);

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    if (!supabase || !response.credential || !nonceRef.current || credentialInFlightRef.current) {
      if (!credentialInFlightRef.current) setLoginError(t("oauthError"));
      return;
    }

    credentialInFlightRef.current = true;
    try {
      setLoginError("");
      setIsLoading(true);
      await replaceSessionWithGoogleIdToken(supabase, response.credential, nonceRef.current);
      window.location.replace(getNextPath());
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setLoginError(t("oauthError"));
      setIsLoading(false);
      credentialInFlightRef.current = false;
    }
  }, [getNextPath, supabase, t]);

  const initializeGoogleButton = useCallback(async () => {
    const buttonContainer = buttonContainerRef.current;
    const googleIdentity = window.google?.accounts.id;

    if (!buttonContainer || !googleIdentity || !supabase || googleButtonRenderedRef.current) return;
    googleButtonRenderedRef.current = true;

    try {
      const { nonce } = await initializeGoogleIdentityOnce(
        googleIdentity,
        googleClientId,
        (response) => void handleGoogleCredential(response),
      );

      // A locale change or a framework remount can detach the first container
      // while the nonce is being created. Only render into the active page.
      if (buttonContainerRef.current !== buttonContainer || !buttonContainer.isConnected) return;
      nonceRef.current = nonce;

      buttonContainer.replaceChildren();
      googleIdentity.renderButton(buttonContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        locale: window.location.pathname.startsWith("/en") ? "en" : "es",
        width: Math.min(400, Math.max(240, Math.floor(buttonContainer.getBoundingClientRect().width))),
      });
    } catch (error) {
      console.error("Error initializing Google Identity Services:", error);
      googleButtonRenderedRef.current = false;
      setLoginError(t("oauthError"));
    }
  }, [googleClientId, handleGoogleCredential, supabase, t]);

  return (
    <div className="wati-page-shell flex min-h-screen flex-col justify-center pb-16 pt-28">
      <UniverseField compact className="left-[34%] text-[#6b3fa0] opacity-10 dark:text-[#b8a0e8] dark:opacity-15" />
      <Container className="relative z-10">
        <div className="max-w-md mx-auto w-full">
          <FadeIn>
            <Card className="senda-editorial-card rounded-[1.35rem] bg-background/95 backdrop-blur-xl">
              <CardHeader className="text-center pb-8 pt-8 space-y-4">
                <Heading level="h1" className="text-2xl font-bold font-heading">{t("title")}</Heading>
                <CardDescription className="text-base">{t("description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                {isAuthAvailable ? (
                  <>
                    <Script
                      src="https://accounts.google.com/gsi/client"
                      strategy="afterInteractive"
                      onReady={() => void initializeGoogleButton()}
                      onError={() => setLoginError(t("oauthError"))}
                    />
                    <div
                      className="relative flex min-h-11 w-full items-center justify-center"
                      role="group"
                      aria-label={t("continueGoogle")}
                      aria-busy={isLoading}
                      aria-describedby={loginError ? "login-status" : undefined}
                    >
                      <div
                        ref={buttonContainerRef}
                        className={isLoading ? "pointer-events-none opacity-40" : undefined}
                      />
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                          <div aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          <span className="sr-only">{t("loading")}</span>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                <div className="mt-8 text-center px-4">
                  {!isAuthAvailable && (
                    <Text id="login-status" role="status" variant="small" className="mb-2 block text-destructive">
                      {t("unavailable")}
                    </Text>
                  )}
                  {isAuthAvailable && loginError && (
                    <Text id="login-status" role="alert" variant="small" className="mb-2 block text-destructive">
                      {loginError}
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
