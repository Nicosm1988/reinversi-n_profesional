import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ProcessPopup } from "@/components/layout/process-popup";
import { CookieProvider } from "@/lib/cookie-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PointerIllumination } from "@/components/effects/pointer-illumination";
import { getSiteUrl } from "@/lib/site-url";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap"
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";

  return {
    title: isEnglish
      ? "Senda | A clearer path through professional change"
      : "Senda | Orientación para tu camino profesional",
    description: isEnglish
      ? "Explore work, identity and purpose with thoughtful tools and human support."
      : "Procesos personalizados para comprender el cambio, encontrar una dirección y construir próximos pasos posibles.",
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: "website",
      locale: isEnglish ? "en_US" : "es_AR",
      siteName: "Senda",
      title: isEnglish ? "Senda | A clearer path through professional change" : "Senda | Una dirección para el cambio",
      description: isEnglish
        ? "Personalized journeys for vocational guidance, professional reinvention, and career transition."
        : "Recorridos personalizados de orientación vocacional, reinvención profesional y transición laboral.",
      images: [{ url: "/brand/senda-hero.png", width: 1536, height: 1024, alt: "Senda" }],
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

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          manrope.variable,
          instrumentSerif.variable
        )}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <CookieProvider>
            <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-[var(--senda-ink)] px-5 py-3 text-sm font-bold text-white transition-transform focus:translate-y-0 dark:bg-[#f4efe4] dark:text-[#272b23]">
              {locale === "en" ? "Skip to content" : "Saltar al contenido"}
            </a>
            <PointerIllumination />
            <Header />
            <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <ProcessPopup />
            {process.env.NODE_ENV === "production" && <SpeedInsights />}
            </CookieProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

