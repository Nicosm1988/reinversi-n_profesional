import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { MethodSection } from "@/components/landing/method-section";
import { PathsSection } from "@/components/landing/paths-section";
import { ServicesSection } from "@/components/landing/services-section";
import { AutomationSection } from "@/components/landing/automation-section";
import { FAQSection } from "@/components/landing/faq-section";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <HeroSection />
      <ProblemSection />
      <MethodSection />
      <PathsSection />
      <ServicesSection />
      <AutomationSection />
      <FAQSection />
    </main>
  );
}
