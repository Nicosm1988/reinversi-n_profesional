"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Section, Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";
import { SupportIllustration } from "@/components/illustrations/pastel-illustrations";

export function TherapySection() {
  return (
    <Section id="terapia" spacing="lg" background="muted" className="bg-[#f4e8dc]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.98fr_1.02fr]">
          <FadeIn>
            <div className="overflow-hidden rounded-[34px] border border-[#dcc8b5] bg-[#fffaf4] p-4 shadow-[0_24px_60px_-36px_rgba(47,54,71,0.45)]">
              <SupportIllustration className="rounded-[26px]" />
            </div>
          </FadeIn>

          <FadeIn>
            <div className="rounded-[32px] border border-[#dcc8b5] bg-[#fffaf4] p-8 shadow-[0_24px_60px_-36px_rgba(47,54,71,0.45)] md:p-10">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1dfd1] text-[#cf724e]">
                <Heart className="h-7 w-7" />
              </div>

              <Text variant="caption" className="text-[#cf724e]">
                Acompanamiento emocional
              </Text>
              <Heading level="h2" className="mt-3 text-[#2f3647]">
                A veces el cambio necesita un espacio mas profundo.
              </Heading>
              <Text variant="body-lg" className="mt-5 max-w-xl text-[#5d6372]">
                Si tu proceso de reinvencion viene cargado de angustia, cansancio o bloqueo, puedes sumar un
                acompanamiento psicologico especializado. Todo online, con el mismo tono cuidado del resto del
                proceso.
              </Text>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="default"
                  className="h-12 rounded-full border-[#d86f49] bg-[#e47c56] px-8 text-white hover:border-[#c85f3a] hover:bg-[#d86f49]"
                  asChild
                >
                  <Link href="/terapia">
                    Conocer terapia
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-[#d3c0ad] bg-[#fbf5ee] px-8 text-[#2f3647] hover:bg-[#f0e3d5]"
                  asChild
                >
                  <Link href="/contacto">Hablar con nosotros</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
