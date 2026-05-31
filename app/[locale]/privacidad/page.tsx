import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";

export default function PrivacidadPage() {
  return (
    <div className="wati-page-shell flex flex-col pt-20">
      <Section spacing="lg">
        <Container size="sm">
          <article className="wati-feature-card p-8 md:p-10">
            <Heading level="h1" className="mb-8">
              Politica de Privacidad
            </Heading>
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/80">
              <Text variant="body-lg" className="mb-10 italic text-muted-foreground">
                Ultima actualizacion: Marzo 2026
              </Text>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">1. Informacion que recopilamos</h2>
              <p className="leading-relaxed text-foreground/80">
                En Reinvencion.Pro recopilamos informacion que nos proporcionas al utilizar nuestros servicios, incluyendo nombre completo, correo, perfil profesional, resultados de diagnosticos y datos de pago cuando aplica.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">2. Uso de la informacion</h2>
              <p className="leading-relaxed text-foreground/80">
                Utilizamos tu informacion para brindar servicios solicitados, personalizar tu experiencia, enviar comunicaciones relevantes, mejorar la plataforma y cumplir obligaciones legales.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">3. Proteccion de datos</h2>
              <p className="leading-relaxed text-foreground/80">
                Implementamos medidas tecnicas y organizativas para proteger tu informacion contra acceso no autorizado, alteracion, divulgacion o destruccion.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">4. Confidencialidad de diagnosticos</h2>
              <p className="leading-relaxed text-foreground/80">
                Los resultados de tus diagnosticos y la informacion compartida durante sesiones son confidenciales. Solo el profesional asignado accede a estos datos, salvo autorizacion expresa.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">5. Cookies</h2>
              <p className="leading-relaxed text-foreground/80">
                Usamos cookies esenciales y analiticas para mejorar experiencia. Puedes gestionar tus preferencias cuando quieras desde el panel del sitio.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">6. Tus derechos</h2>
              <p className="leading-relaxed text-foreground/80">
                Puedes solicitar acceso, rectificacion, eliminacion o portabilidad de tus datos, y tambien limitar u oponerte a su procesamiento.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">7. Contacto</h2>
              <p className="leading-relaxed text-foreground/80">
                Para consultas sobre esta politica puedes escribirnos a{" "}
                <a href="mailto:contacto@reinvencion.pro" className="text-secondary hover:underline">
                  contacto@reinvencion.pro
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
