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
            d="M24 .35C30.5 .45 34.8 2.2 39.4 6.5C44.8 11.6 52.4 13.4 61.8 11.55C74.7 9 85.6 9.25 95.8 11.4C106.8 13.75 116.9 12.35 126.2 7.45L126.8 8.05C116.7 14.2 106.2 15.75 95.3 13.45C85.2 11.3 74.8 11.2 62.2 13.95C51.5 16.25 42.9 13.95 37.2 8.65C33.6 5.25 30.3 3.75 24 3.55Z"
          />
        </svg>
      </span>
    </span>
  );
}
