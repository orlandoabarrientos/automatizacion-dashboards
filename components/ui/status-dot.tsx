import * as React from "react";
import { cn } from "@/lib/utils";

type StatusDotProps = React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "success" | "warning" | "danger" | "neutral";
};

const toneStyles: Record<NonNullable<StatusDotProps["tone"]>, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-slate-400",
};

export function StatusDot({ className, tone = "neutral", ...props }: StatusDotProps) {
    return (
        <span
            className={cn("h-2 w-2 rounded-full", toneStyles[tone], className)}
            {...props}
        />
    );
}

