import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <header className="senda-night border-b border-white/10 px-5 pb-20 pt-32 text-[#f4efe4] sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 xl:px-20">
      <UniverseField className="left-[30%] text-[#89a9bd] opacity-20" />
      <div className="relative mx-auto max-w-[1120px]">
        <p className="senda-coordinate-label text-[#d2b879]">{eyebrow}</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-16">
          <h1 className="max-w-[15ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
            {title}
          </h1>
          <p className="max-w-2xl border-l border-[#cf8a70]/70 pl-6 text-base leading-7 text-[#d0d8dd] sm:pl-8 sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}

type PageSectionProps = {
  children: ReactNode;
  tone?: "default" | "muted" | "warm";
  className?: string;
};

const sectionTones = {
  default: "",
  muted: "border-y border-[var(--senda-border)] bg-[var(--senda-section)]",
  warm: "border-y border-[var(--senda-border)] bg-[var(--senda-section-warm)]",
};

export function PageSection({ children, tone = "default", className = "" }: PageSectionProps) {
  return (
    <section className={`${sectionTones[tone]} px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20 ${className}`}>
      <div className="mx-auto max-w-[1120px]">{children}</div>
    </section>
  );
}

type ClosingCtaProps = {
  title: string;
  description: string;
  label: string;
  href?: "/contacto" | "/diagnostico" | "/recorridos";
};

export function ClosingCta({ title, description, label, href = "/contacto" }: ClosingCtaProps) {
  return (
    <section className="px-5 pb-10 sm:px-8 lg:px-12 xl:px-20">
      <div className="senda-night relative mx-auto max-w-[1120px] overflow-hidden rounded-[1.4rem] border border-white/10 px-7 py-14 text-[#f4efe4] sm:px-12 sm:py-16 lg:px-16">
        <UniverseField compact className="left-[38%] text-[#89a9bd] opacity-20" />
        <div className="relative max-w-3xl">
          <h2 className="max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#d0d8dd] sm:text-lg">{description}</p>
          <Link href={href} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f4efe4] px-7 py-3 text-sm font-bold text-[#17263a] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
