import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
    value: string;
    onChange: (value: string) => void;
} | null>(null);

function useTabs() {
    const ctx = React.useContext(TabsContext);
    if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
    return ctx;
}

export function Tabs({
    value,
    onValueChange,
    children,
    className,
}: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <TabsContext.Provider value={{ value, onChange: onValueChange }}>
            <div className={cn("flex flex-col gap-4", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-start gap-1 rounded-2xl border border-(--border) bg-(--muted) p-1",
                className
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    children,
    className,
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) {
    const tabs = useTabs();
    const active = tabs.value === value;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => tabs.onChange(value)}
            className={cn(
                "inline-flex items-center justify-center rounded-xl px-4 py-1.5 text-sm font-medium transition",
                active
                    ? "bg-(--panel) text-(--foreground) shadow-sm"
                    : "text-(--muted-foreground) hover:text-(--foreground)",
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({
    value,
    children,
    className,
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) {
    const tabs = useTabs();
    if (tabs.value !== value) return null;
    return <div role="tabpanel" className={cn("animate-in fade-in duration-200", className)}>{children}</div>;
}
