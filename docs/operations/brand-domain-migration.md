# Migración de marca y dominio de Senda

## Estado

La aplicación, la interfaz y los metadatos editoriales usan la marca **Senda**. El dominio definitivo es **`universosenda.com`** (comprado, confirmado 2026-08-17). El dominio histórico de Vercel sigue activo como fallback (`lib/site-url.ts`) hasta completar los pasos de conexión de abajo.

## Preparación técnica completada

- `sitemap.xml` y `robots.txt` leen `NEXT_PUBLIC_SITE_URL`.
- Si la variable falta o es inválida, se conserva el dominio productivo actual como fallback seguro.
- El cambio de dominio no requiere modificar código ni duplicar el proyecto.

## Pasos para conectar `universosenda.com`

1. ~~Comprar o asignar el dominio elegido.~~ Hecho — `universosenda.com`.
2. Agregarlo en Vercel (Project → Settings → Domains → Add) y completar la verificación DNS (registros A/CNAME que Vercel indique en el panel del registrador).
3. Definir `NEXT_PUBLIC_SITE_URL=https://universosenda.com` para Production y Preview en Vercel → Settings → Environment Variables.
4. Actualizar la URL pública y los redirect URI en Google OAuth y Supabase Auth.
5. Configurar redirección permanente del dominio anterior al nuevo.
6. Actualizar Cloudflare Turnstile con el hostname nuevo.
7. Actualizar el monitor de disponibilidad, Search Console y cualquier perfil externo.
8. Ejecutar `npm run release:check` y verificar login, diagnóstico, sitemap y robots en producción.

## Decisiones pendientes del propietario

Ninguna — dominio definido. Quedan pasos 2–8 por ejecutar en los paneles externos (Vercel, Google OAuth, Supabase Auth, Cloudflare Turnstile).

La dirección pública de contacto vigente es `hola@universosenda.com`, ya alineada con el dominio elegido.
