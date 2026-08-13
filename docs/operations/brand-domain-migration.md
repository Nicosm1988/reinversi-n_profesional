# Migración de marca y dominio de Senda

## Estado

La aplicación, la interfaz y los metadatos editoriales usan la marca **Senda**. El dominio histórico de Vercel sigue activo hasta que se elija y configure el dominio definitivo.

## Preparación técnica completada

- `sitemap.xml` y `robots.txt` leen `NEXT_PUBLIC_SITE_URL`.
- Si la variable falta o es inválida, se conserva el dominio productivo actual como fallback seguro.
- El cambio de dominio no requiere modificar código ni duplicar el proyecto.

## Pasos cuando se defina el dominio

1. Comprar o asignar el dominio elegido.
2. Agregarlo en Vercel y completar la verificación DNS.
3. Definir `NEXT_PUBLIC_SITE_URL=https://dominio-elegido` para Production y Preview.
4. Actualizar la URL pública y los redirect URI en Google OAuth y Supabase Auth.
5. Configurar redirección permanente del dominio anterior al nuevo.
6. Actualizar Cloudflare Turnstile con el hostname nuevo.
7. Actualizar el monitor de disponibilidad, Search Console y cualquier perfil externo.
8. Ejecutar `npm run release:check` y verificar login, diagnóstico, sitemap y robots en producción.

## Decisiones pendientes del propietario

- Dominio definitivo y registrador.

La dirección pública de contacto vigente es `hola@universosenda.com`.
