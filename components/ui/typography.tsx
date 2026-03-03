import * as React from "react"
import { cn } from "@/lib/utils"

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: "h1" | "h2" | "h3" | "h4"
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
}

export const Heading = ({ className, level = "h2", as, ...props }: HeadingProps) => {
    const Component = as || level

    const styles = {
        h1: "text-4xl md:text-5xl lg:text-h1 font-heading leading-tight tracking-tight",
        h2: "text-3xl md:text-4xl lg:text-h2 font-heading leading-snug tracking-tight",
        h3: "text-2xl md:text-3xl lg:text-h3 font-heading leading-snug font-normal",
        h4: "text-xl md:text-2xl lg:text-h4 font-heading font-medium",
    }

    return (
        <Component
            className={cn(styles[level], "text-foreground scroll-m-20", className)}
            {...props}
        />
    )
}

// Text Component with Variants
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: "body-lg" | "body" | "small" | "caption" | "lead"
    as?: React.ElementType
}

export const Text = ({ className, variant = "body", as = "p", ...props }: TextProps) => {
    const Component = as

    const styles = {
        "body-lg": "text-lg md:text-body-lg text-muted-foreground leading-relaxed",
        "body": "text-base md:text-body text-muted-foreground leading-relaxed",
        "small": "text-sm text-muted-foreground/80 leading-normal",
        "caption": "text-xs text-muted-foreground/70 uppercase tracking-widest font-medium",
        "lead": "text-xl md:text-2xl text-muted-foreground font-light leading-relaxed",
    }

    return (
        <Component
            className={cn(styles[variant], className)}
            {...props}
        />
    )
}
