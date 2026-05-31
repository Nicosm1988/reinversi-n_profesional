import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

function safeOrigin(urlValue: string | undefined) {
  if (!urlValue) return null;
  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

function buildCspHeader() {
  const isDev = process.env.NODE_ENV !== "production";
  const supabaseOrigin = safeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const scriptSrc = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"];
  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = ["'self'", "https://challenges.cloudflare.com"];
  if (supabaseOrigin) {
    connectSrc.push(supabaseOrigin);
  }
  if (isDev) {
    connectSrc.push("http://localhost:*", "ws://localhost:*");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const securityHeaders = [
  { key: "x-content-type-options", value: "nosniff" },
  { key: "x-frame-options", value: "DENY" },
  { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
  { key: "permissions-policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "cross-origin-opener-policy", value: "same-origin" },
  { key: "strict-transport-security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "content-security-policy", value: buildCspHeader() },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
