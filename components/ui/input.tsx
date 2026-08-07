import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, id, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={id}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-input bg-white px-4 py-2 text-base shadow-subtle transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-destructive font-medium">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
