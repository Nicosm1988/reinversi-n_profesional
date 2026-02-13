import { HeroSection } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { ProblemSection } from "@/components/sections/problem";
import { MethodSection } from "@/components/sections/method";
import { PathsSection } from "@/components/sections/paths";
import { ServicesSection } from "@/components/sections/services";
import { AutomationSection } from "@/components/sections/automation";
import { FAQSection } from "@/components/sections/faq";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <MethodSection />
      <PathsSection />
      <ServicesSection />
      <AutomationSection />
      <FAQSection />
    </div>
  );
}
