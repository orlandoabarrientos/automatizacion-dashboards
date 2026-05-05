"use client";

import { Inbox } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--panel) p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--muted)">
                <Inbox className="h-6 w-6 text-(--muted-foreground)" />
            </div>
            <p className="text-lg font-semibold text-(--foreground)">Aún no hay datos</p>
            <p className="mt-2 max-w-md text-sm text-(--muted-foreground)">
                n8n aún no ha enviado datos. Verifica el workflow y asegúrate de que el endpoint{" "}
                <code className="rounded bg-(--muted) px-1 py-0.5 text-xs">/api/sheets-sync</code>{" "}
                esté configurado correctamente.
            </p>
        </div>
    );
}
