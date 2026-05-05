"use client";

import { RefreshCw, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { formatDate } from "@/lib/dashboard/formatting";
import { cn } from "@/lib/utils";
import type { DashboardStatus } from "@/lib/dashboard/types";

type Props = {
    status: DashboardStatus;
    lastSync: string | null;
    totalRows: number;
    totalColumns: number;
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

export default function DashboardHeader({ status, lastSync, totalRows, totalColumns, onRefresh, isRefreshing }: Props) {
    const c = config[status];
    return (
        <div className="flex flex-col gap-6 rounded-3xl border border-(--border) bg-(--panel) p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-(--muted-foreground)">Dashboard Empresarial</p>
                        <Badge tone={c.tone} className="gap-2">
                            <StatusDot tone={dot[status]} />
                            {c.label}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Panel Ejecutivo de Ventas</h1>
                    <p className="text-sm text-(--muted-foreground)">
                        Datos sincronizados por n8n desde Google Sheets. Sin base de datos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={onRefresh} disabled={isRefreshing} className="gap-2">
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        {isRefreshing ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--background) px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--muted)">
                        <Database className="h-4 w-4 text-(--accent)" />
                    </div>
                    <div>
                        <p className="text-xs text-(--muted-foreground)">Registros / Columnas</p>
                        <p className="text-sm font-semibold text-(--foreground)">
                            {totalRows.toLocaleString("es-ES")} / {totalColumns}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--background) px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--muted)">
                        <Zap className="h-4 w-4 text-(--accent)" />
                    </div>
                    <div>
                        <p className="text-xs text-(--muted-foreground)">Última sincronización</p>
                        <p className="text-sm font-semibold text-(--foreground)">{formatDate(lastSync)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--background) px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--muted)">
                        <RefreshCw className="h-4 w-4 text-(--accent)" />
                    </div>
                    <div>
                        <p className="text-xs text-(--muted-foreground)">Estado</p>
                        <p className="text-sm font-semibold text-(--foreground)">{c.label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
