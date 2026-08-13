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
            d="M1.5 .2C10.7 .8 15.3 3.8 19.7 8.1C24.1 12.4 31 12.7 40 10.5C55 6.8 66.8 8.6 78.6 10.8C92.8 13.5 108.4 12.2 126.2 6.6L126.5 7.25C108.7 13.35 92.7 14.7 78.3 12.1C66.6 9.9 55.1 8.3 40.4 12.1C30.7 14.6 23.1 14.2 18 9.5C13.8 5.6 10.1 3.2 1.5 3.35Z"
          />
        </svg>
      </span>
    </span>
  );
}
