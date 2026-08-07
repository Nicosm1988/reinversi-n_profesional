import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    spacing?: "none" | "sm" | "md" | "lg" | "xl"
    background?: "default" | "muted" | "brand"
}

export const Section = ({ className, spacing = "lg", background = "default", ...props }: SectionProps) => {
    const spacingStyles = {
        none: "",
        sm: "py-12 md:py-16",
        md: "py-16 md:py-20",
        lg: "py-20 md:py-28",
        xl: "py-24 md:py-32",
    }

    const bgStyles = {
        default: "bg-background",
        muted: "bg-muted/60",
        brand: "bg-primary text-primary-foreground",
    }

    return (
        <section
            className={cn(
                "relative w-full overflow-hidden",
                spacingStyles[spacing],
                bgStyles[background],
                className
            )}
            {...props}
        />
    )
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "default" | "sm" | "tight"
}

export const Container = ({ className, size = "default", ...props }: ContainerProps) => {
    const sizeStyles = {
        default: "max-w-6xl", // ~1152px
        sm: "max-w-5xl",      // ~1024px
        tight: "max-w-3xl",   // ~768px
    }

    return (
        <div
            className={cn("container mx-auto px-5 md:px-8", sizeStyles[size], className)}
            {...props}
        />
    )
}
