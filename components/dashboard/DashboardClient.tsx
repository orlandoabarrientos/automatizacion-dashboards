"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { DashboardDataResponse, DashboardFilters, DashboardStatus } from "@/lib/dashboard/types";
import { applyDashboardFilters } from "@/lib/dashboard/filters";
import { buildKpis } from "@/lib/dashboard/metrics";
import { buildAnalytics } from "@/lib/dashboard/analytics";
import { detectAllFields } from "@/lib/dashboard/field-detection";

const POLL_INTERVAL = 8000;
const SNAPSHOT_KEY = "dashboard:last-snapshot";

function loadSnapshot(): DashboardDataResponse | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as DashboardDataResponse;
        if (parsed && parsed.ok && Array.isArray(parsed.rows)) return parsed;
        return null;
    } catch {
        return null;
    }
}

function saveSnapshot(data: DashboardDataResponse) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
    } catch {
        // Ignore quota errors
    }
}

export default function DashboardClient() {
    const snapshot = useMemo(() => loadSnapshot(), []);
    const [rawData, setRawData] = useState<DashboardDataResponse | null>(snapshot);
    const [loading, setLoading] = useState(!snapshot);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
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
            saveSnapshot(payload);
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

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setRefreshMessage("Solicitando actualización a n8n...");

        const beforeHash = rawData?.hash;

        const response = await fetch("/api/refresh-dashboard", {
            method: "POST",
        });

        const result = await response.json();

        if (!result.ok) {
            setRefreshMessage(result.message ?? "No se pudo solicitar actualización a n8n.");
            setIsRefreshing(false);
            return;
        }

        setRefreshMessage("n8n está leyendo Google Sheets...");

        const startedAt = Date.now();

        const interval = window.setInterval(async () => {
            const res = await fetch("/api/dashboard-data", {
                cache: "no-store",
            });

            const nextData = (await res.json()) as DashboardDataResponse;

            if (nextData.hash && nextData.hash !== beforeHash) {
                setRawData(nextData);
                saveSnapshot(nextData);
                setRefreshMessage("Dashboard actualizado.");
                setIsRefreshing(false);
                window.clearInterval(interval);
                return;
            }

            if (Date.now() - startedAt > 15000) {
                setRawData(nextData);
                saveSnapshot(nextData);
                setRefreshMessage("Solicitud completada. Se mantiene el último dataset recibido.");
                setIsRefreshing(false);
                window.clearInterval(interval);
            }
        }, 1500);
    }, [rawData?.hash]);

    const filteredData = useMemo(() => {
        if (!rawData) return null;
        const filteredRows = applyDashboardFilters(rawData.rows, filters);
        const fields = detectAllFields(rawData.columns);
        const kpis = buildKpis(filteredRows, fields);
        const { stats, charts, summary } = buildAnalytics(filteredRows, rawData.columns);

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
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            refreshMessage={refreshMessage}
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
