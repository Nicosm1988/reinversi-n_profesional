import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProblemSection } from "@/components/problem-section";
import { MethodSection } from "@/components/method-section";
import { PathsSection } from "@/components/paths-section";
import { ServicesSection } from "@/components/services-section";
import { TechnologySection } from "@/components/technology-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <MethodSection />
      <PathsSection />
      <ServicesSection />
      <TechnologySection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
