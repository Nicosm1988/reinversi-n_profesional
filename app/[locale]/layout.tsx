import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google"; // Pivot to Geometry/Friendly: Poppins
import "../globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { TherapyFloat } from "@/components/layout/therapy-float";
import { CookieProvider } from "@/lib/cookie-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Reinvención Profesional | Dirección Estratégica en la Era IA",
  description: "Estudio de arquitectura de carrera. Acompañamos procesos de reinvención profesional con método, estrategia y calidez humana.",
};

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
          "min-h-screen bg-background font-sans antialiased flex flex-col selection:bg-secondary/30 selection:text-foreground",
          inter.variable,
          poppins.variable
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
          </CookieProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

