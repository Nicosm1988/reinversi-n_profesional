"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";

const benefitKeys = ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"] as const;

export default function CareerAnchorIntroPage() {
  const t = useTranslations("CareerAnchorIntro");

  return (
    <Section spacing="xl">
      <Container size="tight">
        <Text variant="caption" className="text-primary">
          {t("label")}
        </Text>
        <Heading level="h1" className="mt-4">
          {t("title")}
        </Heading>
        <Text variant="lead" className="mt-6">
          {t("intro")}
        </Text>
        <Text variant="body" className="mt-4">
          {t("introContinuation")}
        </Text>

        <Card className="mt-10">
          <CardContent className="p-7 md:p-9">
            <Heading level="h3">{t("benefitsTitle")}</Heading>
            <ul className="mt-6 space-y-4">
              {benefitKeys.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <Text variant="body" className="text-foreground/85">
                    {t(key)}
                  </Text>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Text variant="small" className="mt-8">
          {t("clarification")}
        </Text>

        <Button asChild size="lg" className="mt-8">
          <Link href="/diagnostico/ancla-de-carrera/test">
            {t("cta")}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>

        <Card className="mt-16">
          <CardContent className="p-7 md:p-9">
            <Heading level="h3">{t("accompanimentTitle")}</Heading>
            <Text variant="body" className="mt-4">
              {t("accompanimentDescription")}
            </Text>
            <Button asChild variant="outline" size="lg" className="mt-6">
              <Link href="/contacto">{t("accompanimentCta")}</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
