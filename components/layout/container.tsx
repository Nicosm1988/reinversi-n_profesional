import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    spacing?: "none" | "sm" | "md" | "lg" | "xl"
    background?: "default" | "muted" | "brand"
}

export const Section = ({ className, spacing = "lg", background = "default", ...props }: SectionProps) => {
    const spacingStyles = {
        none: "",
        sm: "py-8 md:py-10",
        md: "py-10 md:py-12", // ~40px - 48px
        lg: "py-12 md:py-16", // ~48px - 64px
        xl: "py-16 md:py-20", // ~64px - 80px
    }

    const bgStyles = {
        default: "bg-background",
        muted: "bg-muted/30",
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
        default: "max-w-7xl", // ~1280px
        sm: "max-w-5xl",      // ~1024px
        tight: "max-w-3xl",   // ~768px (Editorial Reading)
    }

    return (
        <div
            className={cn("container mx-auto px-4 md:px-6", sizeStyles[size], className)}
            {...props}
        />
    )
}
