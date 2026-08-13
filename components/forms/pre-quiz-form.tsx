"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, MotionConfig } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { TurnstileWidget } from "@/components/security/turnstile-widget";

export type PreQuizData = {
  name: string;
  age: string;
  occupation: string;
  city: string;
  country: string;
  captchaToken?: string;
};

interface PreQuizFormProps {
  onSubmit: (data: PreQuizData) => void;
}

export function PreQuizForm({ onSubmit }: PreQuizFormProps) {
  const t = useTranslations("PreQuizForm");
  const locale = useLocale();
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [captchaToken, setCaptchaToken] = React.useState<string | undefined>();
  const [captchaError, setCaptchaError] = React.useState(false);
  const warmInputClass =
    "border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-ink)] placeholder:text-[var(--quiz-muted)] focus-visible:ring-[var(--quiz-accent)]";

  const preQuizSchema = z.object({
    name: z.string().min(2, t("validationNameMin")),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18 && Number(val) <= 90, {
      message: t("validationAge"),
    }),
    occupation: z.string().min(3, t("validationOccupation")),
    city: z.string().min(2, t("validationCity")),
    country: z.string().min(2, t("validationCountry")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PreQuizData>({
    resolver: zodResolver(preQuizSchema),
    mode: "onChange",
  });

  const canSubmit = isValid && !isSubmitting && (!captchaEnabled || Boolean(captchaToken));

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mx-auto max-w-xl border-[var(--quiz-border)] bg-[color-mix(in_srgb,var(--quiz-surface-soft)_95%,transparent)] shadow-[0_28px_80px_-42px_var(--quiz-shadow)] backdrop-blur-sm">
          <CardContent className="pt-8">
            <form
            onSubmit={handleSubmit((data) => onSubmit({ ...data, captchaToken }))}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="prequiz-name"
                label={t("labelName")}
                placeholder={t("placeholderName")}
                autoComplete="name"
                className={warmInputClass}
                {...register("name")}
                error={errors.name?.message}
              />
              <Input
                id="prequiz-age"
                label={t("labelAge")}
                placeholder={t("placeholderAge")}
                type="number"
                className={warmInputClass}
                {...register("age")}
                error={errors.age?.message}
              />
            </div>

            <Input
              id="prequiz-occupation"
              label={t("labelOccupation")}
              placeholder={t("placeholderOccupation")}
              className={warmInputClass}
              {...register("occupation")}
              error={errors.occupation?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="prequiz-city"
                label={t("labelCity")}
                autoComplete="address-level2"
                placeholder={t("placeholderCity")}
                className={warmInputClass}
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                id="prequiz-country"
                label={t("labelCountry")}
                autoComplete="country-name"
                placeholder={t("placeholderCountry")}
                className={warmInputClass}
                {...register("country")}
                error={errors.country?.message}
              />
            </div>

            <div className="mt-8 border-t border-[var(--quiz-border-soft)] pt-4">
              <TurnstileWidget
                onTokenChange={setCaptchaToken}
                onErrorChange={setCaptchaError}
                action="diagnostic_prequiz"
                language={locale}
                className="mb-4"
                retryLabel={t("captchaRetry")}
              />
              {captchaError && (
                <p className="mb-4 text-sm text-destructive" role="alert">
                  {t("captchaError")}
                </p>
              )}
              <Button
                type="submit"
                disabled={!canSubmit}
                variant="default"
                className="h-14 w-full rounded-full border-[var(--senda-action)] bg-[var(--senda-action)] text-lg text-white shadow-[0_18px_40px_-18px_var(--quiz-shadow)] hover:border-[var(--senda-action-hover)] hover:bg-[var(--senda-action-hover)]"
              >
                {isSubmitting ? t("submitLoading") : t("submitDefault")} <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </MotionConfig>
  );
}
