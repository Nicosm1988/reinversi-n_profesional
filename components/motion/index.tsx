import type { HTMLAttributes, ReactNode } from "react";

interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, ...props }: MotionProps) {
  const { delay, duration, ...divProps } = props;
  void delay;
  void duration;
  return <div {...divProps}>{children}</div>;
}

export function SlideUp({ children, ...props }: MotionProps) {
  const { delay, duration, ...divProps } = props;
  void delay;
  void duration;
  return <div {...divProps}>{children}</div>;
}

export function StaggerContainer({
  children,
  ...props
}: MotionProps & { staggerChildren?: number }) {
  const { delay, duration, staggerChildren, ...divProps } = props;
  void delay;
  void duration;
  void staggerChildren;
  return <div {...divProps}>{children}</div>;
}
