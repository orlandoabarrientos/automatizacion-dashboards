"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader, { DashboardStatus } from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DataTable from "@/components/dashboard/DataTable";
import LogsPanel from "@/components/dashboard/LogsPanel";
import EmptyState from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardDataResponse } from "@/lib/dashboard/types";
import { formatDate } from "@/lib/dashboard/formatting";

const POLL_INTERVAL = 5000;

const formatMetricNumber = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "-";
    return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value);
};

export default function DashboardClient() {
    const [data, setData] = useState<DashboardDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setIsRefreshing(true);
        try {
            const res = await fetch("/api/dashboard-data", { cache: "no-store" });
            const payload = (await res.json()) as DashboardDataResponse & { message?: string };
            if (!payload.ok) {
                throw new Error(payload.message ?? "Respuesta inválida");
            }
            setData(payload);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error inesperado");
        } finally {
            setLoading(false);
            if (showSpinner) setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => fetchDashboard(false), 0);
        return () => window.clearTimeout(timer);
    }, [fetchDashboard]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") fetchDashboard(false);
        }, POLL_INTERVAL);
        return () => window.clearInterval(interval);
    }, [fetchDashboard]);

    const status: DashboardStatus = useMemo(() => {
        if (error) return "error";
        if (data && data.rows.length > 0) return "connected";
        return "empty";
    }, [data, error]);

    const metrics = data?.metrics;

    if (loading) {
        return (
            <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    <Skeleton className="h-40 w-full" />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 w-full" />
                        ))}
                    </div>
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <DashboardHeader
                    status={status}
                    lastSync={data?.lastSync ?? null}
                    onRefresh={() => fetchDashboard(true)}
                    isRefreshing={isRefreshing}
                />

                {error ? (
                    <div className="rounded-3xl border border-(--border) bg-(--panel) p-6 text-sm text-(--muted-foreground)">
                        <p className="font-semibold text-(--foreground)">Error</p>
                        <p className="mt-1">{error}</p>
                    </div>
                ) : null}

                {data && data.rows.length === 0 ? <EmptyState /> : null}

                {metrics && data && data.rows.length > 0 ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <MetricCard label="Total registros" value={formatMetricNumber(metrics.totalRows)} />
                            <MetricCard
                                label="Registros activos"
                                value={formatMetricNumber(metrics.activeRows)}
                                helper={metrics.statusField ? `Campo: ${metrics.statusField}` : "Sin estado"}
                            />
                            <MetricCard
                                label="Suma total"
                                value={formatMetricNumber(metrics.totalAmount)}
                                helper={metrics.amountField ? `Campo: ${metrics.amountField}` : "Sin monto"}
                            />
                            <MetricCard
                                label="Última sincronización"
                                value={data.lastSync ? formatDate(data.lastSync) : "-"}
                            />
                        </div>

                        <DashboardCharts charts={data.charts} metrics={metrics} />

                        <DataTable rows={data.rows} columns={data.columns} />

                        <LogsPanel logs={data.logs} />
                    </>
                ) : null}
            </div>
        </main>
    );
}
