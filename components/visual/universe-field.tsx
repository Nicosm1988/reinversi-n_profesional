import { cn } from "@/lib/utils";

type UniverseFieldProps = {
  className?: string;
  compact?: boolean;
};

export function UniverseField({ className, compact = false }: UniverseFieldProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("universe-field", compact && "universe-field--compact", className)}
      viewBox="0 0 900 620"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="universe-field__drift">
        <path d="M-72 512C108 324 244 586 426 356C566 180 698 239 958 22" />
        <path d="M-126 570C75 356 249 642 464 390C608 220 748 252 1001 62" />
        <path d="M24 453C160 310 301 465 453 297C589 147 737 177 920 33" />
        <ellipse cx="684" cy="226" rx="286" ry="134" transform="rotate(-23 684 226)" />
        <ellipse cx="684" cy="226" rx="185" ry="82" transform="rotate(-23 684 226)" />
        <path d="M129 174L271 249L410 151L563 242L742 138" className="universe-field__constellation" />
        <circle cx="129" cy="174" r="4" />
        <circle cx="271" cy="249" r="6" />
        <circle cx="410" cy="151" r="4" />
        <circle cx="563" cy="242" r="5" />
        <circle cx="742" cy="138" r="7" />
        <circle cx="817" cy="347" r="3" />
        <circle cx="523" cy="432" r="3" />
        <circle cx="213" cy="388" r="2.5" />
      </g>
    </svg>
  );
}

