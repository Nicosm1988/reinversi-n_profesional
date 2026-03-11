import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground border-2 border-black shadow-neo hover:shadow-neo-hover",
                destructive:
                    "bg-destructive text-destructive-foreground border-2 border-black shadow-neo hover:shadow-neo-hover",
                outline:
                    "border-2 border-black bg-transparent hover:bg-accent hover:text-accent-foreground shadow-neo hover:shadow-neo-hover",
                secondary:
                    "bg-secondary text-secondary-foreground border-2 border-black shadow-neo hover:shadow-neo-hover",
                ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
                link: "text-primary underline-offset-4 hover:underline rounded-md",
                // Editorial specific variants can be added here if needed, but keeping it clean is better.
            },
            size: {
                default: "h-11 px-6 py-2 text-base",
                sm: "h-9 px-4",
                lg: "h-14 px-10 text-lg font-semibold",
                icon: "h-11 w-11",
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
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
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
