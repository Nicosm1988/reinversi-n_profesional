import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google"; // Pivot to Editorial: Fraunces
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"] // Use variable axes for character
});

export const metadata: Metadata = {
  title: "Reinvención Profesional | Dirección Estratégica en la Era IA",
  description: "Estudio de arquitectura de carrera. Acompañamos procesos de reinvención profesional con método, estrategia y calidez humana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col selection:bg-secondary/30 selection:text-foreground",
          inter.variable,
          fraunces.variable
        )}
      >
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
