"use client";

export default function EmptyState() {
    return (
        <div className="rounded-3xl border border-dashed border-(--border) bg-(--panel) p-10 text-center">
            <p className="text-xl font-semibold text-(--foreground)">Aún no hay datos.</p>
            <p className="mt-3 text-sm text-(--muted-foreground)">
                n8n aún no ha enviado datos. Verifica el workflow y el endpoint <code>/api/sheets-sync</code>.
            </p>
        </div>
    );
}
