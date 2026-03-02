import { HeroSection } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { ProblemSection } from "@/components/sections/problem";
import { MethodSection } from "@/components/sections/method";
import { PathsSection } from "@/components/sections/paths";
import { TherapySection } from "@/components/sections/therapy";
import { ServicesSection } from "@/components/sections/services";
import { FAQSection } from "@/components/sections/faq";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-secondary/20">
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <MethodSection />
      <PathsSection />
      <TherapySection />
      <ServicesSection />
      <FAQSection />
    </div>
  );
}

