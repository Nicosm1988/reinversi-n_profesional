"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/security/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion";
import { UniverseField } from "@/components/visual/universe-field";
import { Link } from "@/navigation";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const supabase = createClient();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "success">(
    () => (supabase ? "checking" : "invalid"),
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getNextPath = useCallback(() => {
    const fallback = window.location.pathname.startsWith("/en")
      ? "/en/test-anclas-de-carrera"
      : "/test-anclas-de-carrera";
    const params = new URLSearchParams(window.location.search);
    return sanitizeNextPath(params.get("next"), fallback);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let active = true;
    void client.auth.getSession().then((result: { data: { session: Session | null } }) => {
      if (active) setStatus(result.data.session ? "ready" : "invalid");
    });
    const { data: listener } = client.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY" && active) setStatus("ready");
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("tooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }
    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (updateError) {
      setError(t("genericError"));
      return;
    }
    setStatus("success");
  }

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
                {status === "checking" ? (
                  <Text variant="small" className="text-center text-muted-foreground">{t("checking")}</Text>
                ) : status === "invalid" ? (
                  <div className="space-y-4 text-center">
                    <Text role="alert" variant="small" className="text-destructive">{t("invalidLink")}</Text>
                    <Link href="/login" className="block text-sm font-semibold text-muted-foreground hover:text-foreground">
                      {t("backToLogin")}
                    </Link>
                  </div>
                ) : status === "success" ? (
                  <div className="space-y-4 text-center">
                    <Text role="status" variant="small" className="text-muted-foreground">{t("success")}</Text>
                    <Button asChild size="lg" className="w-full">
                      <Link href={getNextPath()}>{t("successCta")}</Link>
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                      type="password"
                      label={t("newPasswordLabel")}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                    />
                    <Input
                      type="password"
                      label={t("confirmPasswordLabel")}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? t("loading") : t("cta")}
                    </Button>
                    {error ? (
                      <Text role="alert" variant="small" className="text-center text-destructive">
                        {error}
                      </Text>
                    ) : null}
                  </form>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}
