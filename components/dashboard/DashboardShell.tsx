"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardHeader from "./DashboardHeader";
import FiltersPanel from "./FiltersPanel";
import ExecutiveSummary from "./ExecutiveSummary";
import { KpiGrid } from "./KpiGrid";
import RevenueCharts from "./RevenueCharts";
import StatusDistribution from "./StatusDistribution";
import PipelineFunnel from "./PipelineFunnel";
import RankingTables from "./RankingTables";
import HeatmapTable from "./HeatmapTable";
import StatisticalReport from "./StatisticalReport";
import DataTable from "./DataTable";
import LogsPanel from "./LogsPanel";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import type { DashboardDataResponse, DashboardFilters, DashboardStatus } from "@/lib/dashboard/types";

type Props = {
    data: DashboardDataResponse | null;
    status: DashboardStatus;
    error: string | null;
    filters: DashboardFilters;
    onFiltersChange: (f: DashboardFilters) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    refreshMessage: string | null;
};

export default function DashboardShell({ data, status, error, filters, onFiltersChange, onRefresh, isRefreshing, refreshMessage }: Props) {
    const [tab, setTab] = useState("resumen");

    if (error && !data) {
        return (
            <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-7xl">
                    <ErrorState message={error} />
                </div>
            </main>
        );
    }

    const rows = data?.rows ?? [];
    const columns = data?.columns ?? [];
    const hasData = rows.length > 0;

    return (
        <main className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <DashboardHeader
                    status={status}
                    lastSync={data?.lastSync ?? null}
                    totalRows={data?.metrics?.totalRows ?? 0}
                    totalColumns={columns.length}
                    onRefresh={onRefresh}
                    isRefreshing={isRefreshing}
                    refreshMessage={refreshMessage}
                />

                {!hasData ? (
                    <EmptyState />
                ) : (
                    <>
                        <FiltersPanel rows={rows} columns={columns} filters={filters} onChange={onFiltersChange} />

                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="mb-2">
                                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                                <TabsTrigger value="kpis">KPIs</TabsTrigger>
                                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                                <TabsTrigger value="embudo">Embudo</TabsTrigger>
                                <TabsTrigger value="tabla">Tabla</TabsTrigger>
                                <TabsTrigger value="logs">Logs</TabsTrigger>
                            </TabsList>

                            <TabsContent value="resumen" className="space-y-6">
                                <ExecutiveSummary items={data?.executiveSummary ?? []} />
                                <KpiGrid kpis={data?.kpis?.slice(0, 8) ?? []} />
                                <RevenueCharts charts={data?.charts ?? ({} as DashboardDataResponse["charts"])} />
                                <StatusDistribution charts={data?.charts ?? ({} as DashboardDataResponse["charts"])} />
                                <HeatmapTable data={data?.charts?.cityVsChannel ?? []} />
                            </TabsContent>

                            <TabsContent value="kpis" className="space-y-6">
                                <KpiGrid kpis={data?.kpis ?? []} />
                            </TabsContent>

                            <TabsContent value="estadisticas" className="space-y-6">
                                <StatisticalReport stats={data?.statistics ?? ({} as DashboardDataResponse["statistics"])} />
                                <RankingTables stats={data?.statistics ?? ({} as DashboardDataResponse["statistics"])} />
                            </TabsContent>

                            <TabsContent value="embudo" className="space-y-6">
                                <PipelineFunnel charts={data?.charts ?? ({} as DashboardDataResponse["charts"])} />
                            </TabsContent>

                            <TabsContent value="tabla" className="space-y-6">
                                <DataTable rows={rows} columns={columns} />
                            </TabsContent>

                            <TabsContent value="logs" className="space-y-6">
                                <LogsPanel logs={data?.logs ?? []} />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </main>
    );
}
