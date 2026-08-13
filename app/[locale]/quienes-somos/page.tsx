"use client";

import { Container, Section } from "@/components/layout/container";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Link } from "@/navigation";
import { ArrowRight, Brain, Compass, Heart, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { UniverseField } from "@/components/visual/universe-field";

const pillars = [
  {
    titleKey: "pillarPsychometricTitle",
    descriptionKey: "pillarPsychometricDesc",
  },
  {
    titleKey: "pillarHumanTitle",
    descriptionKey: "pillarHumanDesc",
  },
  {
    titleKey: "pillarAiTitle",
    descriptionKey: "pillarAiDesc",
  },
] as const;

const values = [
  {
    icon: Heart,
    titleKey: "valueWarmthTitle",
    descriptionKey: "valueWarmthDesc",
  },
  {
    icon: Brain,
    titleKey: "valueRigorTitle",
    descriptionKey: "valueRigorDesc",
  },
  {
    icon: Compass,
    titleKey: "valueClarityTitle",
    descriptionKey: "valueClarityDesc",
  },
  {
    icon: Users,
    titleKey: "valueSupportTitle",
    descriptionKey: "valueSupportDesc",
  },
] as const;

export default function QuienesSomosPage() {
  const t = useTranslations("About");

  return (
    <div className="wati-page-shell flex flex-col">
      <section className="wati-page-hero pb-24 pt-36 lg:pb-32 lg:pt-44">
        <UniverseField className="left-[36%] text-[#89a9bd] opacity-20" />
        <Container>
          <FadeIn className="relative z-10 mx-auto max-w-3xl text-center">
            <Heading
              level="h1"
              className="mb-6 text-4xl text-primary dark:text-foreground sm:text-5xl lg:text-6xl"
            >
              {t("heroTitle")}
            </Heading>
            <Text variant="lead" className="mx-auto max-w-xl">
              {t("heroDescription")}
            </Text>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="lg">
        <Container size="sm">
          <FadeIn className="text-center">
            <Heading level="h2" className="mb-6">
              {t("missionTitle")}
            </Heading>
            <Text variant="body-lg" className="mx-auto max-w-2xl">
              {t("missionText")}
            </Text>
          </FadeIn>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container size="sm">
          <FadeIn className="mb-12 text-center">
            <Heading level="h2" className="mb-4">
              {t("whatWeDoTitle")}
            </Heading>
            <Text variant="lead" className="mx-auto max-w-xl">
              {t("whatWeDoSubtitle")}
            </Text>
          </FadeIn>

          <StaggerContainer className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar) => (
              <FadeIn key={pillar.titleKey}>
                <Card className="h-full border-primary/10 p-8 text-center">
                  <h3 className="mb-3 text-lg font-heading font-semibold text-primary dark:text-foreground">
                    {t(pillar.titleKey)}
                  </h3>
                  <Text className="text-sm">{t(pillar.descriptionKey)}</Text>
                </Card>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <FadeIn className="mb-16 text-center">
            <Heading level="h2" className="mb-4">
              {t("valuesTitle")}
            </Heading>
          </FadeIn>

          <StaggerContainer className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {values.map((value) => (
              <FadeIn key={value.titleKey}>
                <div className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-secondary/20 transition-colors group-hover:bg-secondary/30">
                    <value.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-primary dark:text-foreground"
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-heading font-semibold text-primary dark:text-foreground">
                      {t(value.titleKey)}
                    </h3>
                    <Text className="text-sm">{t(value.descriptionKey)}</Text>
                  </div>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section spacing="lg" background="muted">
        <Container size="sm">
          <FadeIn className="wati-dark-cta relative overflow-hidden p-8 text-center md:p-16">
            <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
            <div className="relative z-10 mx-auto max-w-xl">
              <Heading level="h2" className="mb-6 text-primary-foreground">
                {t("ctaTitle")}
              </Heading>
              <Text className="mb-10 text-lg text-primary-foreground/80">
                {t("ctaDescription")}
              </Text>
              <Button
                variant="secondary"
                size="lg"
                className="h-auto min-h-14 w-full whitespace-normal rounded-full px-5 py-3 text-center text-base sm:w-auto sm:px-10"
                asChild
              >
                <Link href="/diagnostico">
                  {t("ctaButton")}
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </div>
  );
}
