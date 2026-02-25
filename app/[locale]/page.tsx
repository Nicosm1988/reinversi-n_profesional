import { HeroSection } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { ProblemSection } from "@/components/sections/problem";
import { MethodSection } from "@/components/sections/method";
import { PathsSection } from "@/components/sections/paths";
import { ServicesSection } from "@/components/sections/services";
import { FAQSection } from "@/components/sections/faq";

// El layout se maneja en cada sección usando los componentes de Layout (Section/Container)
// y Typography para asegurar consistencia. 

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-secondary/20">
      <HeroSection />

      {/* Spacer visual opcional o manejado por padding interno de secciones */}

      <TrustSection />
      <ProblemSection />
      <MethodSection />
      <PathsSection />
      <ServicesSection />
      <FAQSection />
    </div>
  );
}
