"use client";

import { useEffect } from "react";
import type { ParsedRow } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";

type JsonViewerModalProps = {
    open: boolean;
    row: ParsedRow | null;
    onClose: () => void;
};

export default function JsonViewerModal({ open, row, onClose }: JsonViewerModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open || !row) return null;

    const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={handleBackdrop}
        >
            <div className="w-full max-w-3xl rounded-3xl border border-(--border) bg-(--panel) shadow-xl">
                <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-(--muted-foreground)">
                            Detalle JSON
                        </p>
                        <p className="text-lg font-semibold">Fila</p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-6">
                    <pre className="whitespace-pre-wrap rounded-2xl bg-(--muted) p-4 text-xs text-(--foreground)">
                        {JSON.stringify(row, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
