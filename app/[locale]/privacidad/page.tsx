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
                Última actualización: 18 de julio de 2026
              </Text>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">1. Informacion que recopilamos</h2>
              <p className="leading-relaxed text-foreground/80">
                En Senda recopilamos la información que proporcionás al utilizar nuestros servicios: nombre, correo electrónico, información profesional, respuestas y resultados de diagnósticos, consultas enviadas y datos técnicos esenciales para seguridad y funcionamiento.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">2. Uso de la informacion</h2>
              <p className="leading-relaxed text-foreground/80">
                Utilizamos esta información para brindar los servicios solicitados, guardar tu resultado, responder consultas, proteger la plataforma, mejorar su funcionamiento y cumplir obligaciones legales. Las comunicaciones informativas requieren tu consentimiento y podés dejar de recibirlas.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">3. Proteccion de datos</h2>
              <p className="leading-relaxed text-foreground/80">
                Aplicamos controles de autenticación, permisos de base de datos, validación del lado del servidor, protección contra automatizaciones abusivas y comunicaciones cifradas. Ningún sistema ofrece seguridad absoluta, pero reducimos el acceso y la recopilación a lo necesario para operar el servicio.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">4. Confidencialidad de diagnosticos</h2>
              <p className="leading-relaxed text-foreground/80">
                El test gratuito produce una devolución orientativa y no constituye un diagnóstico clínico. Para generar y guardar esa devolución, las respuestas y datos profesionales necesarios pueden ser procesados por nuestros proveedores técnicos de infraestructura, base de datos, seguridad e inteligencia artificial bajo nuestras instrucciones. No enviamos al modelo nombre, correo, teléfono ni dirección. El acceso humano se limita al equipo o profesional que lo necesite para prestar un servicio solicitado o atender una consulta.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">5. Cookies</h2>
              <p className="leading-relaxed text-foreground/80">
                Usamos cookies esenciales para autenticación, seguridad y preferencias. Las tecnologías no esenciales, si se incorporan, deberán respetar la elección mostrada en el sitio.
              </p>

              <h2 className="mb-4 mt-10 text-xl font-heading font-semibold text-foreground">6. Tus derechos</h2>
              <p className="leading-relaxed text-foreground/80">
                Podés solicitar acceso, rectificación o eliminación de tus datos, retirar consentimientos y consultar sobre su tratamiento. Conservamos la información mientras sea necesaria para prestar el servicio y cumplir obligaciones aplicables.
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
