import { cn } from "@/lib/utils"

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode
    className?: string
    id?: string
}

export function SectionContainer({ children, className, id, ...props }: SectionContainerProps) {
    return (
        <section
            id={id}
            className={cn("py-20 md:py-32 px-4 md:px-6 container mx-auto", className)}
            {...props}
        >
            {children}
        </section>
    )
}
