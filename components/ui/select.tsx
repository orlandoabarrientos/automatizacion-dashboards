import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
    return (
        <select
            className={cn(
                "h-10 w-full rounded-xl border border-(--border) bg-(--panel) px-3 text-sm text-(--foreground) shadow-sm outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/30",
                className
            )}
            {...props}
        />
    );
}

