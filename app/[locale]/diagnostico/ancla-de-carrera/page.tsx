"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { UniverseField } from "@/components/visual/universe-field";

const benefitKeys = ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"] as const;

export default function CareerAnchorIntroPage() {
  const t = useTranslations("CareerAnchorIntro");

  return (
    <div className="wati-page-shell">
      <section className="wati-page-hero pb-24 pt-36 lg:pb-32 lg:pt-44">
        <UniverseField className="left-[32%] text-[var(--senda-atmosphere-sky)] opacity-25" />
        <Container>
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <Text variant="caption" className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">
                {t("label")}
              </Text>
              <Heading level="h1" className="mt-7 max-w-[12ch] text-pretty text-[var(--senda-atmosphere-ink)]">
                {t("title")}
              </Heading>
            </div>
            <div className="border-l border-[var(--senda-atmosphere-border)] pl-6 sm:pl-8">
              <Text variant="lead" className="text-[var(--senda-atmosphere-ink)]">{t("intro")}</Text>
              <Text variant="body" className="mt-5 text-[var(--senda-atmosphere-muted)]">{t("introContinuation")}</Text>
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.58fr_1fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <p className="senda-kicker">01 · {t("label")}</p>
              <Heading level="h2" className="mt-5 max-w-[12ch] text-pretty">{t("benefitsTitle")}</Heading>
              <Text variant="small" className="mt-6 max-w-sm leading-6">{t("clarification")}</Text>
            </div>

            <div>
              <Card className="senda-editorial-card overflow-hidden rounded-[1.35rem]">
                <CardContent className="p-7 md:p-10">
                  <ul className="divide-y divide-[var(--senda-border)] border-y border-[var(--senda-border)]">
                    {benefitKeys.map((key, index) => (
                      <li key={key} className="grid gap-4 py-5 sm:grid-cols-[3rem_1fr] sm:items-start">
                        <span className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[var(--senda-terracotta)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--senda-olive)]" aria-hidden="true" />
                          <Text variant="body" className="text-foreground/85">{t(key)}</Text>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button asChild size="lg" className="mt-8 rounded-full bg-[var(--senda-ink)] px-8 text-white hover:bg-[var(--senda-dark-hover)] dark:bg-[#f5f1e8] dark:text-[#17263a]">
                <Link href="/diagnostico/ancla-de-carrera/test">
                  {t("cta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container>
          <Card className="senda-night overflow-hidden rounded-[1.4rem] border-[var(--senda-atmosphere-border)]">
            <UniverseField compact className="left-[40%] text-[var(--senda-atmosphere-sky)] opacity-20" />
            <CardContent className="relative z-10 grid gap-8 p-8 md:p-12 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:p-16">
              <div>
                <Heading level="h3" className="text-pretty text-[var(--senda-atmosphere-ink)]">{t("accompanimentTitle")}</Heading>
                <Text variant="body-lg" className="mt-5 max-w-2xl text-[var(--senda-atmosphere-muted)]">{t("accompanimentDescription")}</Text>
              </div>
              <Button asChild variant="outline" size="lg" className="w-full whitespace-normal rounded-full border-[var(--senda-atmosphere-border)] bg-[var(--senda-atmosphere-control)] px-5 text-center text-[var(--senda-atmosphere-ink)] hover:bg-[var(--senda-atmosphere-control-hover)] hover:text-[var(--senda-atmosphere-ink)] lg:w-auto lg:justify-self-end">
                <Link href="/contacto">{t("accompanimentCta")}</Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
