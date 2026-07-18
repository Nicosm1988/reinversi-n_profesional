import { Card } from "@/components/ui/card";
import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";

const testimonials = [
  {
    quote:
      "Venia postergando decisiones desde hacia meses. El proceso me devolvio foco y un criterio para moverme sin improvisar.",
    author: "Martina V.",
    role: "Product Manager",
  },
  {
    quote:
      "Pensaba que mi experiencia ya no encajaba con el mercado actual. Aprendi a traducirla y recuperar confianza para dar el siguiente paso.",
    author: "Carlos M.",
    role: "Director de Operaciones",
  },
  {
    quote:
      "Necesitaba un espacio para pensar sin presion. Salio una hoja de ruta clara y una sensacion de alivio enorme.",
    author: "Sofia L.",
    role: "Consultora Independiente",
  },
];

export function TrustSection() {
  return (
    <Section spacing="lg" background="default" className="relative">
      <Container>
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <Text variant="caption" className="text-[#9b472d]">
            Situaciones frecuentes
          </Text>
          <Heading level="h2" className="mt-3 text-[#2f3647]">
            Lo que puede cambiar cuando recuperás claridad
          </Heading>
          <Text className="mt-5 text-[#5d6372]">
            Estos ejemplos son orientativos: cada recorrido y cada resultado son diferentes.
          </Text>
        </FadeIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <FadeIn key={item.author}>
              <Card className="h-full border-[#dcc8b5] bg-[#fffaf4] p-7 shadow-[0_20px_50px_-36px_rgba(47,54,71,0.45)]">
                <blockquote className="flex h-full flex-col">
                  <span className="mb-5 text-5xl leading-none text-[#e0b59a]">“</span>
                  <Text variant="body-lg" className="mb-8 flex-1 text-[#3f4758]">
                    {item.quote}
                  </Text>
                  <footer className="border-t border-[#ebded2] pt-5">
                    <p className="font-heading text-base font-semibold text-[#2f3647]">Ejemplo representativo</p>
                    <p className="text-sm text-[#655e6b]">{item.role}</p>
                  </footer>
                </blockquote>
              </Card>
            </FadeIn>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
