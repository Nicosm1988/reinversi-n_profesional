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
            d="M6 .2C13 .3 18 2.4 23.4 7C28.8 11.9 36.4 13.6 45.8 11.75C58.7 9.2 69.6 9.45 79.8 11.6C90.8 13.95 100.9 12.55 110.2 7.65L110.8 8.25C100.7 14.4 90.2 15.95 79.3 13.65C69.2 11.5 58.8 11.4 46.2 14.15C35.5 16.45 26.9 14.15 21.2 8.85C17.4 5.3 13.6 3.55 6 3.4Z"
          />
        </svg>
      </span>
    </span>
  );
}
