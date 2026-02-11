export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-heading text-xl font-bold text-primary">
              ReINversión
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Plataforma híbrida humano + IA para la reinvención profesional en
              la era de la inteligencia artificial.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-foreground">Servicios</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href="#servicios"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Diagnóstico
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Coaching
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Psicología laboral
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Marca personal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Plataforma</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href="#metodo"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Método
                </a>
              </li>
              <li>
                <a
                  href="#caminos"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Rutas
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a
                  href="#diagnostico"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Diagnóstico gratuito
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Contacto</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="text-sm text-muted-foreground">
                hola@reinversion.com.ar
              </li>
              <li className="text-sm text-muted-foreground">
                Buenos Aires, Argentina
              </li>
              <li className="text-sm text-muted-foreground">
                Lun a Vie, 9 a 18 hs
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {`© ${new Date().getFullYear()} ReINversión Profesional. Todos los derechos reservados.`}
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
