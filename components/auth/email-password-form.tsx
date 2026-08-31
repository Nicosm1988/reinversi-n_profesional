"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";
import { getSiteUrl } from "@/lib/site-url";

type Mode = "signin" | "signup" | "forgot";

const MIN_PASSWORD_LENGTH = 8;

export function EmailPasswordForm({
  supabase,
  onAuthenticated,
  locale,
}: {
  supabase: SupabaseClient;
  onAuthenticated: () => void;
  locale: "es" | "en";
}) {
  const t = useTranslations("Login");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function resetFeedback() {
    setError("");
    setNotice("");
  }

  function switchMode(nextMode: Mode) {
    resetFeedback();
    setPassword("");
    setConfirmPassword("");
    setMode(nextMode);
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    resetFeedback();
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (signInError) {
      setError(t("emailInvalidCredentials"));
      return;
    }
    onAuthenticated();
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault();
    resetFeedback();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("emailPasswordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("emailPasswordMismatch"));
      return;
    }
    setIsLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${getSiteUrl()}/${locale === "en" ? "en/" : ""}test-anclas-de-carrera` },
    });
    setIsLoading(false);
    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? t("emailAlreadyRegistered")
          : t("emailGenericError"),
      );
      return;
    }
    if (data.session) {
      onAuthenticated();
      return;
    }
    setNotice(t("emailConfirmSent"));
  }

  async function handleForgotPassword(event: FormEvent) {
    event.preventDefault();
    resetFeedback();
    setIsLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/${locale === "en" ? "en/" : ""}restablecer-contrasena`,
    });
    setIsLoading(false);
    if (resetError) {
      setError(t("emailGenericError"));
      return;
    }
    setNotice(t("emailResetSent"));
  }

  return (
    <div className="w-full space-y-4">
      {mode === "forgot" ? (
        <form className="space-y-4" onSubmit={handleForgotPassword}>
          <Input
            type="email"
            label={t("emailLabel")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? t("emailLoading") : t("emailSendReset")}
          </Button>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="block w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("emailBackToSignIn")}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
          <Input
            type="email"
            label={t("emailLabel")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Input
            type="password"
            label={t("passwordLabel")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
            required
          />
          {mode === "signup" ? (
            <Input
              type="password"
              label={t("confirmPasswordLabel")}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          ) : null}
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("emailForgotPassword")}
            </button>
          ) : null}
          <Button type="submit" variant="outline" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? t("emailLoading") : mode === "signin" ? t("emailSignInCta") : t("emailSignUpCta")}
          </Button>
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? t("emailSwitchToSignUp") : t("emailSwitchToSignIn")}
          </button>
        </form>
      )}
      {error ? (
        <Text role="alert" variant="small" className="text-center text-destructive">
          {error}
        </Text>
      ) : null}
      {notice ? (
        <Text role="status" variant="small" className="text-center text-muted-foreground">
          {notice}
        </Text>
      ) : null}
    </div>
  );
}
