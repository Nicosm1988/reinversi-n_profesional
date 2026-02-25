import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // Las locales soportadas
    locales: ['en', 'es'],

    // Default locale
    defaultLocale: 'es',
    localePrefix: 'never' // Para que / (sin locale explícito en la url) rutee a 'es' en producción y solo 'en' si es inglés, o se detecte. Para URL limpias usamos 'never' o 'as-needed'
});

export const config = {
    // Ignorar _next, imágenes, endpoints api y la ruta de callback de autenticación
    matcher: ['/((?!api|auth|_next|.*\\..*).*)']
};
