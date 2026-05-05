import { NextResponse } from "next/server";
import { getState } from "@/lib/sheets-store";
import { buildDashboardMetrics } from "@/lib/dashboard/metrics";
import type { DashboardDataResponse } from "@/lib/dashboard/types";

export async function GET() {
    try {
        const state = getState();
        const metrics = buildDashboardMetrics(state.rows, state.columns, state.logs.length);

        const response: DashboardDataResponse = {
            ok: true,
            rows: state.rows,
            columns: state.columns,
            metrics,
            charts: {
                byStatus: metrics.statusBreakdown,
                byDate: metrics.byDate,
            },
            logs: state.logs,
            lastSync: state.lastSync,
            lastFetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error interno";
        return NextResponse.json(
            {
                ok: false,
                message: msg,
                rows: [],
                columns: [],
                metrics: {
                    totalRows: 0,
                    activeRows: null,
                    totalAmount: null,
                    lastSync: null,
                    lastDate: null,
                    statusField: null,
                    amountField: null,
                    dateField: null,
                    statusBreakdown: [],
                    byDate: [],
                    byAmountDate: [],
                    recentLogs: 0,
                },
                charts: { byStatus: [], byDate: [] },
                logs: [],
                lastSync: null,
                lastFetchedAt: new Date().toISOString(),
            } satisfies DashboardDataResponse & { message: string },
            { status: 500 }
        );
    }
}
