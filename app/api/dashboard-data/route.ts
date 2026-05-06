import { NextResponse } from "next/server";
import { getState } from "@/lib/sheets-store";
import { buildKpis } from "@/lib/dashboard/metrics";
import { buildAnalytics } from "@/lib/dashboard/analytics";
import { detectAllFields } from "@/lib/dashboard/field-detection";
import { extractNumericValue } from "@/lib/dashboard/formatting";
import {
    buildInvoicesRequiredVsSent,
    buildMontosVsProbabilidad,
    buildRiskDistribution,
    buildPipelineFunnel,
} from "@/lib/dashboard/chart-builders";
import type { DashboardDataResponse } from "@/lib/dashboard/types";

export async function GET() {
    try {
        const state = getState();
        const fields = detectAllFields(state.columns);

        const totalRows = state.rows.length;
        const estadoField = fields.estado;
        const montoField = fields.monto;

        const wonCount = estadoField
            ? state.rows.filter((r) => {
                  const s = String(r[estadoField] ?? "").toLowerCase();
                  return ["ganado", "win", "won", "closed won", "completado", "facturado"].some((k) => s.includes(k));
              }).length
            : 0;
        const totalRevenue = montoField
            ? state.rows.reduce((sum, r) => {
                  const m = extractNumericValue(r[montoField]);
                  return m !== null ? sum + m : sum;
              }, 0)
            : 0;
        const avgTicket = totalRows > 0 ? totalRevenue / totalRows : 0;
        const conversionRate = totalRows > 0 ? wonCount / totalRows : 0;

        const kpis = buildKpis(state.rows, fields);
        const { stats, charts, summary } = buildAnalytics(state.rows, state.columns);

        // Fallback robusto para gráficos problemáticos usando helpers directos sobre rows
        const invoicesRequiredVsSent = buildInvoicesRequiredVsSent(state.rows);
        const montosVsProbabilidad = buildMontosVsProbabilidad(state.rows);
        const riskDistribution = buildRiskDistribution(state.rows);
        const pipelineFunnel = buildPipelineFunnel(state.rows);

        const response: DashboardDataResponse = {
            ok: true,
            rows: state.rows,
            columns: state.columns,
            metrics: {
                totalRows,
                conversionRate,
                totalRevenue,
                averageTicket: avgTicket,
            },
            kpis,
            statistics: stats,
            charts: {
                ...charts,
                invoicesRequiredVsSent,
                montosVsProbabilidad,
                riskDistribution,
                pipelineFunnel,
            },
            executiveSummary: summary,
            logs: state.logs,
            lastSync: state.lastSync,
            hash: state.hash,
            lastFetchedAt: new Date().toISOString(),
            diagnostics: {
                totalRows: state.rows.length,
                invoicesRequiredVsSentCount: invoicesRequiredVsSent.length,
                montosVsProbabilidadCount: montosVsProbabilidad.length,
                riskDistributionCount: riskDistribution.length,
                pipelineFunnelCount: pipelineFunnel.length,
                sampleRow: state.rows[0],
            },
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
                metrics: { totalRows: 0, conversionRate: null, totalRevenue: null, averageTicket: null },
                kpis: [],
                statistics: {
                    amounts: { min: null, max: null, avg: null, median: null, p25: null, p75: null, stdDev: null, sum: null, count: 0 },
                    margin: { avg: null, min: null, max: null, lowCount: 0, highCount: 0 },
                    time: { avgResponseMin: null, minResponseMin: null, maxResponseMin: null, slaCompliancePct: null, avgDaysInPipeline: null },
                    distributions: {},
                    rankings: {
                        topSellersByRevenue: [],
                        topSellersByConversion: [],
                        topChannelsByRevenue: [],
                        topCitiesByRevenue: [],
                        topCampaignsByRevenue: [],
                        topProductsByRevenue: [],
                        topClientsByAmount: [],
                    },
                    funnel: [],
                    monthlyCohorts: [],
                },
                charts: {
                    revenueByMonth: [],
                    statusDistribution: [],
                    revenueByChannel: [],
                    sellerRanking: [],
                    pipelineFunnel: [],
                    leadTemperature: [],
                    riskDistribution: [],
                    conversionRateMonthly: [],
                    invoicesRequiredVsSent: [],
                    montosVsProbabilidad: [],
                    cityVsChannel: [],
                    campaignRanking: [],
                },
                executiveSummary: [],
                logs: [],
                lastSync: null,
                hash: null,
                lastFetchedAt: new Date().toISOString(),
            } satisfies DashboardDataResponse,
            { status: 500 }
        );
    }
}
