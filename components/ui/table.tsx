import * as React from "react";
import { cn } from "@/lib/utils";

type TableProps = React.HTMLAttributes<HTMLTableElement>;

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function Table({ className, ...props }: TableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <table className={cn("w-full text-sm", className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }: TableSectionProps) {
    return <thead className={cn("text-left", className)} {...props} />;
}

export function TableBody({ className, ...props }: TableSectionProps) {
    return <tbody className={cn("divide-y divide-(--border)", className)} {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
    return (
        <tr
            className={cn("hover:bg-(--muted)/60", className)}
            {...props}
        />
    );
}

export function TableHead({ className, ...props }: TableHeadProps) {
    return (
        <th
            className={cn(
                "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)",
                className
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: TableCellProps) {
    return (
        <td className={cn("px-4 py-3 align-top", className)} {...props} />
    );
}

