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
            d="M27.5 0.45C30.4 0.55 32.9 1.9 34.8 4.55C38.3 9.35 44.2 11.7 52 10.4C66.5 8 75.4 9.2 85.6 11.2C99 13.8 111.2 11.9 126 8.3L126 8.65C111.2 12.5 98.7 14.7 85.4 12.35C75.1 10.5 66.5 9.3 52.3 11.8C43.5 13.3 36.8 10.3 32.6 5.4C31 3.55 29.6 3.35 27.5 4.55Z"
          />
        </svg>
      </span>
    </span>
  );
}
