# BIMI de Senda

## Objetivo

Mostrar el isotipo orbital original de Senda en los clientes de correo compatibles para los mensajes enviados desde `universosenda.com`.

El activo canónico es `public/bimi.svg` y su URL productiva es:

`https://universosenda.com/bimi.svg`

El archivo usa SVG Tiny Portable/Secure, dimensiones absolutas de 512 × 512, fondo sólido y no contiene scripts, animaciones ni recursos externos.

## Estado verificado el 23 de agosto de 2026

- MX: Namecheap Private Email.
- SPF: `v=spf1 include:spf.privateemail.com ~all`.
- DKIM: selector `privateemail`, clave RSA de 2048 bits.
- DMARC: no publicado todavía.
- BIMI: no publicado todavía.
- Todos los envíos de la aplicación usan el mismo SMTP de Private Email.

## Activación segura de DMARC

Antes de aplicar enforcement, confirmar que existe y se monitorea `dmarc@universosenda.com`, o reemplazarlo por otro buzón operativo.

Registro inicial de observación:

```text
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=none; sp=none; pct=100; rua=mailto:dmarc@universosenda.com; adkim=r; aspf=r
```

Durante 7 a 14 días, revisar informes agregados y verificar en Gmail que un mensaje real de cada flujo muestre SPF, DKIM y DMARC en `PASS`, con DKIM alineado a `universosenda.com`.

Registro requerido para habilitar BIMI después de esa verificación:

```text
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=quarantine; sp=quarantine; pct=100; rua=mailto:dmarc@universosenda.com; adkim=r; aspf=r
```

No avanzar directamente a `p=reject` sin confirmar que no existen remitentes legítimos externos al repositorio.

## Registro BIMI

Registro autoafirmado, útil sólo para proveedores que lo acepten sin certificado:

```text
Host: default._bimi
Type: TXT
Value: v=BIMI1; l=https://universosenda.com/bimi.svg;
```

Gmail exige un certificado CMC o VMC. Una vez emitido y publicado el PEM en una URL HTTPS estable, reemplazar el registro por:

```text
Host: default._bimi
Type: TXT
Value: v=BIMI1; l=https://universosenda.com/bimi.svg; a=https://universosenda.com/bimi.pem;
```

- CMC: para un logo no registrado con uso público verificable, normalmente durante al menos 12 meses. Gmail muestra el logo sin insignia de verificación.
- VMC: para una marca registrada aceptada por la autoridad certificadora. Gmail puede mostrar además la insignia verificada.

El certificado es una compra recurrente y queda ligado al logo. No reemplazar `bimi.svg` después de emitirlo sin coordinar la reemisión del certificado.
