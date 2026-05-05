import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={cn(
                "h-10 w-full rounded-xl border border-(--border) bg-(--panel) px-3 text-sm text-(--foreground) shadow-sm outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/30",
                className
            )}
            {...props}
        />
    );
}

