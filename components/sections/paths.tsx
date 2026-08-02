import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { DoorsIllustration } from "@/components/illustrations/pastel-illustrations";

const paths = [
  {
    title: "Reempleo con foco",
    desc: "Para volver al mercado con una narrativa mas clara, CV estrategico y criterios para buscar mejor.",
    badge: "Empleo",
  },
  {
    title: "Actualizacion digital e IA",
    desc: "Si sentís que el contexto te corrió de eje, ordenamos qué necesitás aprender y para qué.",
    badge: "Upskilling",
  },
  {
    title: "Reposicionamiento senior",
    desc: "Para lideres que necesitan reformular su propuesta de valor y abrir conversaciones de otro nivel.",
    badge: "Executive",
  },
  {
    title: "Cambio de rumbo",
    desc: "Cuando querés pivotear de industria o función sin tirar por la borda todo lo construido.",
    badge: "Pivot",
  },
  {
    title: "Proyecto propio",
    desc: "Si emprender aparece como posibilidad, bajamos la idea a una estructura concreta y sostenible.",
    badge: "Venture",
  },
];

export function PathsSection() {
  return (
    <Section id="caminos" spacing="lg" background="default" className="bg-[#fcf5ec]">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <FadeIn className="space-y-6">
            <div>
              <Text variant="caption" className="text-[#9b472d]">
                Caminos posibles
              </Text>
              <Heading level="h2" className="mt-3 text-[#2f3647]">
                No todas las puertas llevan al mismo lugar.
              </Heading>
              <Text variant="body-lg" className="mt-5 max-w-xl text-[#5d6372]">
                La pregunta no es solo que opcion existe, sino cual encaja mejor con tu momento, tu energia y el tipo
                de vida que querés construir.
              </Text>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-[#dcc8b5] bg-[#fffaf4] p-4 shadow-[0_24px_60px_-36px_rgba(47,54,71,0.45)]">
              <DoorsIllustration className="rounded-[26px]" />
            </div>
          </FadeIn>

          <StaggerContainer className="grid gap-4 md:grid-cols-2">
            {paths.map((path) => (
              <FadeIn key={path.title}>
                <article className="flex h-full flex-col rounded-[28px] border border-[#dcc8b5] bg-[#fffaf4] p-6 shadow-[0_18px_44px_-36px_rgba(47,54,71,0.4)]">
                  <Badge className="mb-5 w-fit border-none bg-[#f1dfd1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4028]">
                    {path.badge}
                  </Badge>
                  <h3 className="font-heading text-xl font-semibold text-[#2f3647]">{path.title}</h3>
                  <Text className="mt-3 flex-1 text-[#5d6372]">{path.desc}</Text>
                  <Button variant="link" className="mt-6 h-auto justify-start p-0 text-[#9b472d] hover:text-[#7f3925]" asChild>
                    <Link href="/diagnostico/ancla-de-carrera">
                      Empezar por mi diagnostico
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              </FadeIn>
            ))}
          </StaggerContainer>
        </div>
      </Container>
    </Section>
  );
}
