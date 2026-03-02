import { Section, Container } from "@/components/layout/container";
import { Heading, Text } from "@/components/ui/typography";

export default function PrivacidadPage() {
    return (
        <div className="flex flex-col bg-background pt-20">
            <Section spacing="lg">
                <Container size="sm">
                    <Heading level="h1" className="mb-8">Política de Privacidad</Heading>
                    <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
                        <Text variant="body-lg" className="text-muted-foreground italic mb-10">
                            Última actualización: Marzo 2026
                        </Text>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">1. Información que recopilamos</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            En Reinvención.Pro recopilamos información que nos proporcionas directamente al utilizar nuestros servicios, incluyendo: nombre completo, dirección de correo electrónico, información de perfil profesional, resultados de diagnósticos vocacionales y datos de pago cuando aplique.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">2. Uso de la información</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Utilizamos tu información para: brindar los servicios de orientación vocacional y profesional solicitados, personalizar tu experiencia en la plataforma, enviar comunicaciones relevantes sobre tu proceso, mejorar nuestros servicios y cumplir con obligaciones legales.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">3. Protección de datos</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos cifrado SSL/TLS para todas las transmisiones de datos y almacenamos la información en servidores seguros.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">4. Confidencialidad de diagnósticos</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Los resultados de tus diagnósticos vocacionales y toda la información compartida durante las sesiones de orientación son estrictamente confidenciales. Solo el profesional asignado a tu caso tendrá acceso a esta información, y no será compartida con terceros sin tu consentimiento expreso.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">5. Cookies</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas para mejorar la experiencia de usuario. Puedes gestionar tus preferencias de cookies en cualquier momento a través del panel de configuración de cookies de nuestro sitio.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">6. Tus derechos</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Tienes derecho a acceder, rectificar, eliminar y portar tus datos personales. También puedes oponerte al procesamiento de tus datos o solicitar la limitación de su uso. Para ejercer estos derechos, contactanos a contacto@reinvencion.pro.
                        </p>

                        <h2 className="text-xl font-heading font-semibold text-foreground mt-10 mb-4">7. Contacto</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos, puedes escribirnos a <a href="mailto:contacto@reinvencion.pro" className="text-secondary hover:underline">contacto@reinvencion.pro</a>.
                        </p>
                    </div>
                </Container>
            </Section>
        </div>
    );
}
