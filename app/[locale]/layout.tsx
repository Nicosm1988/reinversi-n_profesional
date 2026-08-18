import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ProcessPopup } from "@/components/layout/process-popup";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { CookieProvider } from "@/lib/cookie-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PointerIllumination } from "@/components/effects/pointer-illumination";
import { getSiteUrl } from "@/lib/site-url";
import { CONTACT_EMAIL } from "@/lib/contact-config";

// One local variable font powers body and display text. Keeping the licensed
// asset in the repository makes production builds independent from Google
// Fonts availability while preserving the existing Raleway identity.
const raleway = localFont({
  src: "../fonts/raleway-variable.ttf",
  variable: "--font-raleway",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1d172c" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const t = await getTranslations({ locale, namespace: "Home" });
  const positioning = `${t("hero.title")} ${t("hero.titleAccent")}`.replace(/\s+/g, " ").trim();
  const title = `Senda | ${positioning}`;
  const description = t("hero.description");

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: "website",
      locale: isEnglish ? "en_US" : "es_AR",
      alternateLocale: isEnglish ? ["es_AR"] : ["en_US"],
      siteName: "Senda",
      title,
      description,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/senda-mark.svg" },
  };
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>
) {
  const { children } = props;
  const params = await props.params;
  const { locale } = params;
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const siteUrl = getSiteUrl();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Senda",
    url: siteUrl,
    logo: `${siteUrl}/senda-mark.svg`,
    email: CONTACT_EMAIL,
    description:
      locale === "en"
        ? "Senda accompanies career transitions with psychometric science, editorial content, AI as a copilot, and expert human support."
        : "Senda acompaña transiciones laborales combinando ciencia psicométrica, contenido editorial, IA como copiloto y acompañamiento humano experto.",
  };

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          raleway.variable,
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider>
          <PointerIllumination />
          <NextIntlClientProvider messages={messages}>
            <CookieProvider>
            <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-[var(--senda-ink)] px-5 py-3 text-sm font-bold text-white transition-transform focus:translate-y-0 dark:bg-[#fafafa] dark:text-[#1d172c]">
              {locale === "en" ? "Skip to content" : "Saltar al contenido"}
            </a>
            <Header />
            <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <ProcessPopup />
            <WhatsappButton locale={locale} />
            {process.env.NODE_ENV === "production" && <SpeedInsights />}
            </CookieProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
