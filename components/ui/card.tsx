import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-(--border) bg-(--panel) text-(--foreground) shadow-sm",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardSectionProps) {
    return <div className={cn("p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
    return (
        <h3
            className={cn("text-base font-semibold tracking-tight", className)}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: CardSectionProps) {
    return <div className={cn("px-5 pb-5", className)} {...props} />;
}

