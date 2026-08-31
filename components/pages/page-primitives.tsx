import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { UniverseField } from "@/components/visual/universe-field";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <header className="senda-night border-b border-[var(--senda-atmosphere-border)] px-5 pb-20 pt-32 text-[var(--senda-atmosphere-ink)] sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 xl:px-20">
      <UniverseField className="left-[30%] text-[var(--senda-atmosphere-sky)] opacity-20" />
      <div className="relative mx-auto max-w-[1290px]">
        <p className="senda-coordinate-label text-[var(--senda-atmosphere-gold)]">{eyebrow}</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-16">
          <h1 className="max-w-[15ch] text-pretty font-heading text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
            {title}
          </h1>
          <p className="max-w-2xl border-l border-[var(--senda-atmosphere-accent)] pl-6 text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:pl-8 sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>
        {children ? <div className="mt-9 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
      </div>
    </header>
  );
}

type PageSectionProps = {
  children: ReactNode;
  tone?: "default" | "muted" | "warm";
  className?: string;
  id?: string;
};

const sectionTones = {
  default: "",
  muted: "border-y border-[var(--senda-border)] bg-[var(--senda-section)]",
  warm: "border-y border-[var(--senda-border)] bg-[var(--senda-section-warm)]",
};

export function PageSection({ children, tone = "default", className = "", id }: PageSectionProps) {
  return (
    <section id={id} className={`${sectionTones[tone]} px-5 py-20 sm:px-8 md:py-24 lg:px-12 xl:px-20 ${className}`}>
      <div className="mx-auto max-w-[1290px]">{children}</div>
    </section>
  );
}

type ClosingCtaProps = {
  title: string;
  description: string;
  label: string;
  href?:
    | "/contacto"
    | "/encontrar-mi-recorrido"
    | "/transiciones-laborales"
    | "/brujulas"
    | "/test-anclas-de-carrera";
};

export function ClosingCta({ title, description, label, href = "/contacto" }: ClosingCtaProps) {
  return (
    <section className="px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20 xl:px-20">
      <div className="senda-night relative mx-auto max-w-[1290px] overflow-hidden rounded-[1.4rem] border border-[var(--senda-atmosphere-border)] px-7 py-14 text-[var(--senda-atmosphere-ink)] sm:px-12 sm:py-16 lg:px-16">
        <UniverseField compact className="left-[38%] text-[var(--senda-atmosphere-sky)] opacity-20" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="max-w-[18ch] text-pretty font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em]">{title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--senda-atmosphere-muted)] sm:text-lg">{description}</p>
          <Link href={href} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--senda-atmosphere-action-bg)] px-7 py-3 text-sm font-bold text-[var(--senda-atmosphere-action-ink)] transition-colors hover:bg-[var(--senda-atmosphere-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-atmosphere-ring)]">
            {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
