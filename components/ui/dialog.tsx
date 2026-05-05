import * as React from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-(--border) bg-(--panel) p-6 shadow-xl max-h-[90vh] flex flex-col">
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-lg font-semibold tracking-tight", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return <p className={cn("text-sm text-(--muted-foreground)", className)}>{children}</p>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("overflow-auto", className)}>{children}</div>;
}
