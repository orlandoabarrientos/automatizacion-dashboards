"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCards } from "./KpiCards";
import { FiltersPanel } from "./FiltersPanel";
import { VehicleCard } from "./VehicleCard";
import { VehicleTable } from "./VehicleTable";
import { VehicleDetail } from "./VehicleDetail";
import { InventoryCharts } from "./InventoryCharts";
import type {
  InventoryDataResponse,
  InventoryVehicle,
  InventoryFilters,
} from "@/lib/inventory/types";
import { applyFilters } from "@/lib/inventory/calculations";
import { RefreshCw, LayoutGrid, Table2, AlertCircle } from "lucide-react";

const POLL_INTERVAL = 8000;
const SNAPSHOT_KEY = "inventory:last-snapshot";

function loadSnapshot(): InventoryDataResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InventoryDataResponse;
    if (parsed && parsed.ok && Array.isArray(parsed.vehicles)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveSnapshot(data: InventoryDataResponse) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const defaultFilters: InventoryFilters = {
  search: "",
  marca: null,
  modelo: null,
  ano: null,
  categoria: null,
  sucursal: null,
  color: null,
  condicion: null,
  estadoInventario: null,
  precioMin: null,
  precioMax: null,
};

export default function InventoryClient() {
  const snapshot = useMemo(() => loadSnapshot(), []);
  const [data, setData] = useState<InventoryDataResponse | null>(snapshot);
  const [loading, setLoading] = useState(!snapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>(defaultFilters);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryVehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/inventory-data", { cache: "no-store" });
      const payload = (await res.json()) as InventoryDataResponse & { message?: string };
      if (!payload.ok) {
        throw new Error(payload.message ?? "Respuesta inválida");
      }
      setData(payload);
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
    const timer = window.setTimeout(() => fetchData(false), 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchData(false);
    }, POLL_INTERVAL);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshMessage("Solicitando actualización a n8n...");

    const beforeLastSync = data?.lastSync;

    const response = await fetch("/api/refresh-inventory", { method: "POST" });
    const result = await response.json();

    if (!result.ok) {
      setRefreshMessage(result.error ?? "No se pudo solicitar actualización.");
      setIsRefreshing(false);
      return;
    }

    setRefreshMessage("n8n está leyendo Google Sheets...");
    const startedAt = Date.now();

    const interval = window.setInterval(async () => {
      const res = await fetch("/api/inventory-data", { cache: "no-store" });
      const nextData = (await res.json()) as InventoryDataResponse;

      if (nextData.lastSync && nextData.lastSync !== beforeLastSync) {
        setData(nextData);
        saveSnapshot(nextData);
        setRefreshMessage("Inventario actualizado.");
        setIsRefreshing(false);
        window.clearInterval(interval);
        return;
      }

      if (Date.now() - startedAt > 15000) {
        setData(nextData);
        saveSnapshot(nextData);
        setRefreshMessage("Solicitud completada. Se mantiene el último dataset recibido.");
        setIsRefreshing(false);
        window.clearInterval(interval);
      }
    }, 1500);
  }, [data?.lastSync]);

  const filteredVehicles = useMemo(() => {
    if (!data) return [];
    return applyFilters(data.vehicles, filters);
  }, [data, filters]);

  const openDetail = useCallback((v: InventoryVehicle) => {
    setSelectedVehicle(v);
    setDetailOpen(true);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="h-40 w-full animate-pulse rounded-3xl bg-(--muted)" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-(--muted)" />
            ))}
          </div>
          <div className="h-72 w-full animate-pulse rounded-2xl bg-(--muted)" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventario del Concesionario</h1>
            <p className="text-sm text-(--muted-foreground)">
              Unidades, disponibilidad y ventas sincronizadas desde n8n
            </p>
            <p className="mt-1 text-xs text-(--muted-foreground)">
              Última sincronización:{" "}
              {data?.lastSync
                ? new Date(data.lastSync).toLocaleString("es-VE")
                : "Sin sincronizar"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {refreshMessage && (
          <div className="rounded-xl border border-(--border) bg-(--panel) px-4 py-2 text-sm text-(--muted-foreground)">
            {refreshMessage}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {data && <KpiCards metrics={data.metrics} />}

        {data && (
          <FiltersPanel
            filters={filters}
            options={data.filters}
            onChange={setFilters}
            onClear={() => setFilters(defaultFilters)}
          />
        )}

        <Tabs value={view} onValueChange={(v) => setView(v as "cards" | "table")}>
          <TabsList>
            <TabsTrigger value="cards" className="gap-1">
              <LayoutGrid className="h-4 w-4" />
              Tarjetas
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1">
              <Table2 className="h-4 w-4" />
              Tabla
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cards">
            {filteredVehicles.length === 0 ? (
              <EmptyState message="No se encontraron vehículos con los filtros aplicados." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVehicles.map((v) => (
                  <VehicleCard key={v.vehicle_id} vehicle={v} onView={openDetail} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="table">
            {filteredVehicles.length === 0 ? (
              <EmptyState message="No se encontraron vehículos con los filtros aplicados." />
            ) : (
              <VehicleTable vehicles={filteredVehicles} onView={openDetail} />
            )}
          </TabsContent>
        </Tabs>

        {data && data.vehicles.length > 0 && (
          <InventoryCharts metrics={data.metrics} vehicles={data.vehicles} />
        )}
      </div>

      <VehicleDetail
        vehicle={selectedVehicle}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-(--border) bg-(--panel) py-16 text-center">
      <Car className="h-10 w-10 text-(--muted-foreground)" />
      <p className="text-sm text-(--muted-foreground)">{message}</p>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}
