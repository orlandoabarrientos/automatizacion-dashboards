import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "subtle";
    size?: "sm" | "md" | "lg";
};

const baseStyles =
    "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default:
        "bg-(--accent) text-(--accent-foreground) hover:brightness-105 focus-visible:ring-(--accent)",
    outline:
        "border border-(--border) bg-transparent text-(--foreground) hover:bg-(--muted) focus-visible:ring-(--accent)",
    ghost:
        "bg-transparent text-(--foreground) hover:bg-(--muted) focus-visible:ring-(--accent)",
    subtle:
        "bg-(--muted) text-(--foreground) hover:bg-(--muted-strong) focus-visible:ring-(--accent)",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3",
    md: "h-10 px-4",
    lg: "h-11 px-5 text-base",
};

export function Button({
    className,
    variant = "default",
    size = "md",
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            {...props}
        />
    );
}

