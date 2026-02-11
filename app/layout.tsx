import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ReINversión Profesional | Tu transición empieza hoy",
  description:
    "Plataforma híbrida humano + IA para la reinvención profesional en la era de la inteligencia artificial. Diagnóstico, coaching, psicología laboral y branding estratégico.",
  keywords: [
    "reinvención profesional",
    "coaching laboral",
    "inteligencia artificial",
    "cambio de carrera",
    "reempleo",
    "marca personal",
  ],
};

export const viewport: Viewport = {
  themeColor: "#1a3a6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
