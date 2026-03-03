import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";

export default function TerminosPage() {
    return (
        <div className="flex flex-col bg-background pt-20">
            <Section spacing="lg">
                <Container size="sm">
                    <Heading level="h1" className="mb-8">Términos y Condiciones</Heading>
                    <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
                        <Text variant="body-lg" className="text-muted-foreground italic mb-10">
                            Última actualización: Marzo 2026
                        </Text>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">1. Descripción del servicio</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Reinvención.Pro es una plataforma de orientación vocacional-profesional y acompañamiento estratégico de carrera. Nuestros servicios incluyen diagnósticos vocacionales, sesiones de orientación profesional, inglés para negocios y terapia online complementaria. No somos un servicio de psicoterapia clínica ni reemplazamos tratamiento psiquiátrico.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">2. Registro y cuenta</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Para acceder a ciertos servicios es necesario crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">3. Diagnósticos y evaluaciones</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Los diagnósticos vocacionales proporcionados por la plataforma son herramientas de orientación. Los resultados son orientativos y deben complementarse con el acompañamiento profesional. No constituyen un diagnóstico clínico ni deben interpretarse como tal.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">4. Pagos y precios</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Los precios de los servicios se expresan en dólares estadounidenses (USD) y pueden variar según el plan seleccionado. El diagnóstico inicial de ancla de carrera es gratuito. Los pagos se procesan a través de plataformas seguras (MercadoPago y/o Stripe) según tu ubicación.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">5. Cancelaciones y reembolsos</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Las sesiones pueden cancelarse o reprogramarse con al menos 24 horas de anticipación sin costo. Las cancelaciones con menos de 24 horas de anticipación no son reembolsables. Los packs de sesiones no son reembolsables una vez iniciado el proceso.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">6. Propiedad intelectual</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Todo el contenido de la plataforma, incluyendo textos, diseños, metodología, diagnósticos y materiales de sesiones, es propiedad de Reinvención Profesional y está protegido por leyes de propiedad intelectual. No está permitida su reproducción sin autorización expresa.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">7. Limitación de responsabilidad</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Reinvención.Pro no garantiza resultados específicos derivados del uso de sus servicios. Nuestro rol es brindarte herramientas, información y acompañamiento profesional para tu proceso de transición. Las decisiones de carrera son responsabilidad del usuario.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">8. Contacto</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Para consultas sobre estos términos, escribinos a <a href="mailto:contacto@reinvencion.pro" className="text-secondary hover:underline">contacto@reinvencion.pro</a>.
                        </p>
                    </div>
                </Container>
            </Section>
        </div>
    );
}
