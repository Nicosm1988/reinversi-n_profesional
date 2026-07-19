import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";

export default function TerminosPage() {
  return (
    <div className="wati-page-shell flex flex-col pt-20">
      <Section spacing="lg">
        <Container size="sm">
          <article className="wati-feature-card p-8 md:p-10">
            <Heading level="h1" className="mb-8">
              Terminos y Condiciones
            </Heading>
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/80">
              <Text variant="body-lg" className="mb-10 italic text-muted-foreground">
                Ultima actualizacion: Marzo 2026
              </Text>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">1. Descripcion del servicio</h2>
              <p className="leading-relaxed text-foreground/80">
                Senda ofrece orientación vocacional y herramientas para tomar decisiones de carrera. Sus contenidos son orientativos y no reemplazan una evaluación individual especializada.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">2. Registro y cuenta</h2>
              <p className="leading-relaxed text-foreground/80">
                Para algunos servicios necesitás crear una cuenta con información veraz y mantener seguras tus credenciales.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">3. Diagnosticos y evaluaciones</h2>
              <p className="leading-relaxed text-foreground/80">
                Los diagnósticos son herramientas de orientación y pueden complementarse con una conversación individual con el equipo. Sus resultados no son definiciones cerradas ni determinan decisiones de carrera.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">4. Pagos y precios</h2>
              <p className="leading-relaxed text-foreground/80">
                Los precios se expresan en USD y pueden variar según el plan. El diagnóstico inicial de ancla de carrera es gratuito y puede realizarse una sola vez por cuenta.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">5. Cancelaciones y reembolsos</h2>
              <p className="leading-relaxed text-foreground/80">
                Las sesiones pueden reprogramarse con 24 horas de anticipacion. Las cancelaciones fuera de ese plazo no son reembolsables.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">6. Propiedad intelectual</h2>
              <p className="leading-relaxed text-foreground/80">
                El contenido, metodologia y materiales de la plataforma son propiedad de Senda y no pueden reproducirse sin autorizacion.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">7. Limitacion de responsabilidad</h2>
              <p className="leading-relaxed text-foreground/80">
                No garantizamos resultados especificos. Nuestro rol es proveer herramientas y acompanamiento para tus decisiones de carrera.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">8. Contacto</h2>
              <p className="leading-relaxed text-foreground/80">
                Para consultas sobre estos terminos escribinos a{" "}
                <a href="mailto:contacto@senda.com" className="text-secondary hover:underline">
                  contacto@senda.com
                </a>
                .
              </p>
            </div>
          </article>
        </Container>
      </Section>
    </div>
  );
}
