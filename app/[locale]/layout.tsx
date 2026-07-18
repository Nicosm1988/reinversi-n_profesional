import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { TherapyFloat } from "@/components/layout/therapy-float";
import { CookieProvider } from "@/lib/cookie-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SpeedInsights } from "@vercel/speed-insights/next";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
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
      : "Un mapa vivo para explorar trabajo, identidad y propósito con herramientas y acompañamiento humano.",
    robots: isEnglish ? { index: false, follow: true } : { index: true, follow: true },
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
    <html lang={locale} className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          dmSans.variable,
          outfit.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <CookieProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
            <TherapyFloat />
            <CookieBanner />
            <SpeedInsights />
          </CookieProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

