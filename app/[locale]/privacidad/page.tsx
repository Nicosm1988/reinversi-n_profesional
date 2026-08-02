import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const sections = [1, 2, 3, 4, 5, 6, 7] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: `${t("title")} | Senda` };
}

export default async function PrivacidadPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <div className="wati-page-shell flex flex-col pt-20">
      <Section spacing="lg">
        <Container size="sm">
          <article className="wati-feature-card p-8 md:p-10">
            <Heading level="h1" className="mb-8">
              {t("title")}
            </Heading>
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/80">
              <Text variant="body-lg" className="mb-10 italic text-muted-foreground">
                {t("lastUpdated")}
              </Text>

              {sections.map((section) => (
                <section key={section}>
                  <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">
                    {t(`section${section}Title`)}
                  </h2>
                  <p className="leading-relaxed text-foreground/80">
                    {section === 7
                      ? t.rich("section7Text", {
                          email: (chunks) => (
                            <a href="mailto:contacto@senda.com" className="font-medium text-foreground underline decoration-2 decoration-secondary underline-offset-4">
                              {chunks}
                            </a>
                          ),
                        })
                      : t(`section${section}Text`)}
                  </p>
                </section>
              ))}
            </div>
          </article>
        </Container>
      </Section>
    </div>
  );
}
