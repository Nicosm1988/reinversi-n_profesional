"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
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
    "border-[#d7c3ae] bg-[#fffaf4] text-[#2f3647] placeholder:text-[#8d8278] focus-visible:ring-[#e47c56]";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mx-auto max-w-xl border-[#d7c3ae] bg-[#f6efe7]/95 shadow-[0_28px_80px_-42px_rgba(17,24,39,0.45)] backdrop-blur-sm">
        <CardContent className="pt-8">
          <form
            onSubmit={handleSubmit((data) => onSubmit({ ...data, captchaToken }))}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("labelName")}
                placeholder={t("placeholderName")}
                className={warmInputClass}
                {...register("name")}
                error={errors.name?.message}
              />
              <Input
                label={t("labelAge")}
                placeholder={t("placeholderAge")}
                type="number"
                className={warmInputClass}
                {...register("age")}
                error={errors.age?.message}
              />
            </div>

            <Input
              label={t("labelOccupation")}
              placeholder={t("placeholderOccupation")}
              className={warmInputClass}
              {...register("occupation")}
              error={errors.occupation?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("labelCity")}
                placeholder={t("placeholderCity")}
                className={warmInputClass}
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                label={t("labelCountry")}
                placeholder={t("placeholderCountry")}
                className={warmInputClass}
                {...register("country")}
                error={errors.country?.message}
              />
            </div>

            <div className="mt-8 border-t border-[#dcc7b3] pt-4">
              <TurnstileWidget
                onTokenChange={setCaptchaToken}
                onErrorChange={setCaptchaError}
                action="diagnostic_prequiz"
                language={locale}
                className="mb-4"
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
                className="h-14 w-full rounded-full border-[#a84729] bg-[#bd5734] text-lg text-white shadow-[0_18px_40px_-18px_rgba(189,87,52,0.85)] hover:border-[#963f25] hover:bg-[#a84729]"
              >
                {isSubmitting ? t("submitLoading") : t("submitDefault")} <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
