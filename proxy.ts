import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // Las locales soportadas
    locales: ['es', 'en'],

    // Default locale
    defaultLocale: 'es',
    localePrefix: 'as-needed' // Muestra el prefijo solo para 'en', oculta para 'es'. Fixes 404 en root.
});

export const config = {
    // Explicitar la ruta root '/' para asegurar que Next Edge compile el interceptor de la landing page.
    matcher: [
        '/',
        '/(es|en)/:path*',
        '/((?!api|auth|_next|_vercel|.*\\..*).*)'
    ]
};
