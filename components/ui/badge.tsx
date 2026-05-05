import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "success" | "warning" | "info" | "neutral" | "danger";
};

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    neutral: "bg-(--muted) text-(--foreground)",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                toneStyles[tone],
                className
            )}
            {...props}
        />
    );
}

