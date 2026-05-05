"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--panel) p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
                <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-300" />
            </div>
            <p className="text-lg font-semibold text-(--foreground)">Error al cargar datos</p>
            <p className="mt-2 max-w-md text-sm text-(--muted-foreground)">{message}</p>
        </div>
    );
}
