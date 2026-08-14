import { cn } from "@/lib/utils";

type SendaLogoProps = {
  className?: string;
  wordWrapClassName?: string;
  wordClassName?: string;
};

export function SendaLogo({ className, wordWrapClassName, wordClassName }: SendaLogoProps) {
  return (
    <span className={cn("senda-logo", className)} aria-hidden="true">
      <svg
        className="senda-logo__mark"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <circle className="senda-logo__boundary" cx="26" cy="26" r="22.5" />
        <g className="senda-logo__orbit senda-logo__orbit--one">
          <ellipse cx="26" cy="26" rx="23.5" ry="13.5" />
          <circle className="senda-logo__waypoint" cx="48" cy="22" r="1.75" />
        </g>
        <g className="senda-logo__orbit senda-logo__orbit--two">
          <ellipse cx="26" cy="26" rx="16" ry="23" />
          <circle className="senda-logo__waypoint senda-logo__waypoint--gold" cx="21" cy="3.8" r="1.35" />
        </g>
        <circle className="senda-logo__sun" cx="26" cy="26" r="3.6" />
      </svg>

      <span className={cn("senda-logo__word-wrap", wordWrapClassName)}>
        <span className={cn("senda-logo__word", wordClassName)}>Senda</span>
        <svg
          className="senda-logo__trail"
          viewBox="0 0 128 18"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <path
            d="M27.5 .35C34 .55 37.7 2.35 41.7 6.3C46.2 10.8 52.6 12.35 60.4 10.85C72.5 8.55 82.4 8.75 91.5 10.45C102.7 12.55 114.5 11.35 126.2 7L126.5 7.6C114.4 12.45 102.4 13.75 91.2 11.75C82.2 10.1 72.5 9.95 60.8 12.35C52.3 14.05 45.2 12.35 40.2 7.65C36.8 4.45 33.5 3.2 27.5 3.55Z"
          />
        </svg>
      </span>
    </span>
  );
}
