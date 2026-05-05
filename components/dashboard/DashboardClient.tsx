"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { DashboardDataResponse, DashboardFilters, DashboardStatus, ParsedRow } from "@/lib/dashboard/types";
import { applyDashboardFilters } from "@/lib/dashboard/filters";
import { buildKpis } from "@/lib/dashboard/metrics";
import { buildAnalytics } from "@/lib/dashboard/analytics";
import { detectAllFields } from "@/lib/dashboard/field-detection";

const POLL_INTERVAL = 8000;

export default function DashboardClient() {
    const [rawData, setRawData] = useState<DashboardDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DashboardFilters>({
        dateFrom: null,
        dateTo: null,
        mes: null,
        estado: null,
        canal: null,
        vendedor: null,
        ciudad: null,
        sucursal: null,
        campana: null,
        productoCategoria: null,
        temperaturaLead: null,
        prioridad: null,
        riesgoChurn: null,
        facturaEnviada: null,
        cumplimientoSla: null,
        montoMin: null,
        montoMax: null,
    });

    const fetchDashboard = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setIsRefreshing(true);
        try {
            const res = await fetch("/api/dashboard-data", { cache: "no-store" });
            const payload = (await res.json()) as DashboardDataResponse & { message?: string };
            if (!payload.ok) {
                throw new Error(payload.message ?? "Respuesta inválida");
            }
            setRawData(payload);
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

    const filteredData = useMemo(() => {
        if (!rawData) return null;
        const filteredRows = applyDashboardFilters(rawData.rows, filters);
        const fields = detectAllFields(rawData.columns);
        const kpis = buildKpis(filteredRows, fields);
        const { stats, charts, summary } = buildAnalytics(filteredRows, rawData.columns);

        // Recalculate top-level metrics
        const totalRows = filteredRows.length;
        const wonCount = fields.estado
            ? filteredRows.filter((r) => {
                  const s = String(r[fields.estado!] ?? "").toLowerCase();
                  return ["ganado", "win", "won", "closed won", "completado", "facturado"].some((k) => s.includes(k));
              }).length
            : 0;
        const totalRevenue = fields.monto
            ? filteredRows.reduce((sum, r) => {
                  const m = extractNumericValue(r[fields.monto!]);
                  return m !== null ? sum + m : sum;
              }, 0)
            : 0;
        const avgTicket = totalRows > 0 ? totalRevenue / totalRows : 0;
        const conversionRate = totalRows > 0 ? wonCount / totalRows : 0;

        return {
            ...rawData,
            rows: filteredRows,
            metrics: {
                totalRows,
                conversionRate,
                totalRevenue,
                averageTicket: avgTicket,
            },
            kpis,
            statistics: stats,
            charts,
            executiveSummary: summary,
        };
    }, [rawData, filters]);

    const status: DashboardStatus = useMemo(() => {
        if (error) return "error";
        if (filteredData && filteredData.rows.length > 0) return "connected";
        return "empty";
    }, [filteredData, error]);

    if (loading) {
        return (
            <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    <div className="h-40 w-full animate-pulse rounded-3xl bg-(--muted)" />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-(--muted)" />
                        ))}
                    </div>
                    <div className="h-72 w-full animate-pulse rounded-2xl bg-(--muted)" />
                </div>
            </main>
        );
    }

    return (
        <DashboardShell
            data={filteredData}
            status={status}
            error={error}
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={() => fetchDashboard(true)}
            isRefreshing={isRefreshing}
        />
    );
}

function extractNumericValue(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return null;
    const cleaned = value.replace(/[^0-9,.-]/g, "").trim();
    if (!cleaned) return null;
    const hasComma = cleaned.includes(",");
    const hasDot = cleaned.includes(".");
    let normalized = cleaned;
    if (hasComma && hasDot) {
        const lastComma = cleaned.lastIndexOf(",");
        const lastDot = cleaned.lastIndexOf(".");
        const decimalSeparator = lastComma > lastDot ? "," : ".";
        const thousandSeparator = decimalSeparator === "," ? "." : ",";
        normalized = cleaned.split(thousandSeparator).join("").replace(decimalSeparator, ".");
    } else if (hasComma) {
        normalized = cleaned.replace(/,/g, ".");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}
