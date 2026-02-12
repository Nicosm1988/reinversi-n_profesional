import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { MethodSection } from "@/components/landing/method-section";
import { PathsSection } from "@/components/landing/paths-section";
import { ServicesSection } from "@/components/landing/services-section";
import { AutomationSection } from "@/components/landing/automation-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F172A] text-white selection:bg-green-500/30 font-sans">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              ReINversión
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#problema" className="hover:text-white transition-colors">Problema</Link>
            <Link href="#metodo" className="hover:text-white transition-colors">Método</Link>
            <Link href="#caminos" className="hover:text-white transition-colors">Caminos</Link>
            <Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="#diagnostico"
              className="hidden sm:inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all hover:scale-105"
            >
              Diagnóstico gratuito
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <MethodSection />
        <PathsSection />
        <ServicesSection />
        <AutomationSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <footer className="border-t border-white/5 bg-[#0B1221] py-12 text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12 text-left">
            <div>
              <h4 className="text-white font-bold mb-4">ReINversión</h4>
              <p>Tu carrera, redefinida.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white">Términos</Link></li>
              </ul>
            </div>
            {/* Add more footer columns as needed */}
          </div>
          <p>© {new Date().getFullYear()} ReINversión Profesional. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
