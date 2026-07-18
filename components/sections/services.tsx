import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export function ServicesSection() {
  return (
    <Section id="servicios" spacing="lg" className="bg-[#31384a] text-[#f6efe7]">
      <Container>
        <FadeIn className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/8 p-8 shadow-[0_28px_80px_-42px_rgba(16,21,33,0.9)] md:p-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#e47c56]/18 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#f6efe7]/8 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Text variant="caption" className="text-[#f0b08d]">
              Empezar hoy
            </Text>
            <Heading level="h2" className="mt-3 text-[#f6efe7]">
              Tu siguiente movimiento puede empezar con una sola conversacion.
            </Heading>
            <Text className="mx-auto mt-5 max-w-2xl text-lg text-[#e8d8c8]/84">
              Haz el diagnostico, ordena tus opciones y descubre que tipo de camino profesional tiene mas sentido para
              ti en este momento.
            </Text>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="default"
                className="h-12 rounded-full border-[#a84729] bg-[#bd5734] px-8 text-white hover:border-[#963f25] hover:bg-[#a84729]"
                asChild
              >
                <Link href="/diagnostico/ancla-de-carrera">
                  Hacer diagnostico
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/16 bg-white/8 px-8 text-[#f6efe7] hover:bg-white/12 hover:text-[#f6efe7]"
                asChild
              >
                <Link href="/contacto">Agendar una sesion</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
