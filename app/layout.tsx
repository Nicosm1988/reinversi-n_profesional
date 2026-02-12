import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReINversión Profesional | Tu transición empieza hoy",
  description: "Convertimos la incertidumbre en dirección estratégica. Un sistema integral de reinvención profesional que combina IA con acompañamiento humano.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
