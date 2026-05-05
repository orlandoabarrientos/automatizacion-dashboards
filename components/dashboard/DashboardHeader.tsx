"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { formatDate } from "@/lib/dashboard/formatting";

export type DashboardStatus = "connected" | "empty" | "error";

type Props = {
    status: DashboardStatus;
    lastSync: string | null;
    onRefresh: () => void;
    isRefreshing: boolean;
};

const config: Record<DashboardStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
    connected: { label: "Conectado a n8n", tone: "success" },
    empty: { label: "Sin datos", tone: "warning" },
    error: { label: "Error", tone: "danger" },
};

const dot: Record<DashboardStatus, "success" | "warning" | "danger" | "neutral"> = {
    connected: "success",
    empty: "warning",
    error: "danger",
};

export default function DashboardHeader({ status, lastSync, onRefresh, isRefreshing }: Props) {
    const c = config[status];
    return (
        <div className="flex flex-col gap-6 rounded-3xl border border-(--border) bg-(--panel) p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--muted-foreground)">
                        Dashboard sincronizado por n8n
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard de Sincronización</h1>
                    <p className="text-sm text-(--muted-foreground)">Datos enviados por n8n. Sin base de datos.</p>
                </div>
                <div className="flex flex-col items-start gap-3">
                    <Badge tone={c.tone} className="gap-2">
                        <StatusDot tone={dot[status]} />
                        {c.label}
                    </Badge>
                    <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
                        {isRefreshing ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </div>
            <div className="text-sm text-(--muted-foreground)">
                <p className="text-xs uppercase tracking-wide">Última sincronización</p>
                <p className="text-base text-(--foreground)">{formatDate(lastSync)}</p>
            </div>
        </div>
    );
}
