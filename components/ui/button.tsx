import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90",
                outline:
                    "border border-primary/20 bg-white text-primary hover:bg-muted dark:border-white/20 dark:bg-white/5 dark:text-[#f5f2f7] dark:hover:bg-white/10",
                secondary:
                    "border border-secondary bg-secondary text-secondary-foreground shadow-[0_16px_30px_-18px_rgba(204,20,140,0.85)] hover:bg-secondary/90",
                ghost: "border-2 border-transparent hover:bg-muted hover:text-primary dark:hover:text-foreground",
                link: "text-primary underline-offset-4 hover:underline dark:text-foreground",
            },
            size: {
                default: "h-11 px-5 py-2",
                sm: "h-10 rounded-lg px-4",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    buttonVariants({ variant, size, className })
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
