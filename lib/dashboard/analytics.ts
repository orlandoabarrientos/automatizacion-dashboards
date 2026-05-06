import type {
    ParsedRow,
    DashboardStatistics,
    DashboardCharts,
    ExecutiveSummaryItem,
    FunnelStage,
    CohortMonth,
    DistributionItem,
    ChartPoint,
} from "@/lib/dashboard/types";
import { detectAllFields, type FieldMap } from "./field-detection";
import { extractNumericValue, toMonthKey, parseDateValue, extractBooleanValue } from "./formatting";
import { groupByField, groupAndAgg, buildRanking, buildConversionRanking } from "./grouping";
import { median, percentile, standardDeviation } from "./statistics";
import {
    buildInvoicesRequiredVsSent,
    buildMontosVsProbabilidad,
    buildRiskDistribution,
    buildPipelineFunnel,
} from "./chart-builders";

const WIN_STATUS_KEYWORDS = ["ganado", "win", "won", "closed won", "completado", "facturado"];
const LOST_STATUS_KEYWORDS = ["perdido", "lost", "closed lost", "cancelado", "descartado"];

function isWinStatus(status: string): boolean {
    const s = status.toLowerCase();
    return WIN_STATUS_KEYWORDS.some((k) => s.includes(k));
}

function isLostStatus(status: string): boolean {
    const s = status.toLowerCase();
    return LOST_STATUS_KEYWORDS.some((k) => s.includes(k));
}

function isSlaCompliant(val: unknown): boolean | null {
    return extractBooleanValue(val);
}

function buildDistribution(rows: ParsedRow[], field: string | null): DistributionItem[] {
    if (!field) return [];
    const groups = groupByField(rows, field);
    const total = rows.length || 1;
    return Object.entries(groups)
        .map(([label, count]) => ({ label, count, percent: count / total }))
        .sort((a, b) => b.count - a.count);
}

function buildFunnel(rows: ParsedRow[], fields: FieldMap): FunnelStage[] {
    if (!fields.etapaPipeline || !fields.monto) return [];
    const groups: Record<string, { count: number; amount: number }> = {};
    for (const row of rows) {
        const stage = String(row[fields.etapaPipeline] ?? "Sin etapa").trim() || "Sin etapa";
        const monto = extractNumericValue(row[fields.monto]);
        if (!groups[stage]) groups[stage] = { count: 0, amount: 0 };
        groups[stage].count++;
        if (monto !== null) groups[stage].amount += monto;
    }
    const entries = Object.entries(groups).sort((a, b) => b[1].count - a[1].count);
    const totalCount = rows.length || 1;
    return entries.map(([stage, { count, amount }], index) => {
        const prevCount = index > 0 ? entries[index - 1][1].count : count;
        const conversion = prevCount > 0 && index > 0 ? count / prevCount : 1;
        return {
            stage,
            count,
            amount,
            conversion: Number.isFinite(conversion) ? conversion : 0,
            percentOfTotal: count / totalCount,
        };
    });
}

function buildCohorts(rows: ParsedRow[], fields: FieldMap): CohortMonth[] {
    if (!fields.fecha && !fields.mes) return [];
    const map: Record<string, { registros: number; ganadas: number; ingresos: number; margen: number; countMargin: number; ticketSum: number; ticketCount: number }> = {};

    for (const row of rows) {
        let key: string | null = null;
        if (fields.mes) {
            key = String(row[fields.mes] ?? "").trim();
        }
        if (!key && fields.fecha) {
            key = toMonthKey(row[fields.fecha]);
        }
        if (!key) continue;

        if (!map[key]) {
            map[key] = { registros: 0, ganadas: 0, ingresos: 0, margen: 0, countMargin: 0, ticketSum: 0, ticketCount: 0 };
        }
        const status = fields.estado ? String(row[fields.estado] ?? "").trim() : "";
        const monto = fields.monto ? extractNumericValue(row[fields.monto]) : null;
        const margen = fields.margenUsd ? extractNumericValue(row[fields.margenUsd]) : null;

        map[key].registros++;
        if (monto !== null) {
            map[key].ingresos += monto;
            if (isWinStatus(status)) {
                map[key].ganadas++;
                map[key].ticketSum += monto;
                map[key].ticketCount++;
            }
        }
        if (margen !== null) {
            map[key].margen += margen;
            map[key].countMargin++;
        }
    }

    return Object.entries(map)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({
            month,
            registros: data.registros,
            ganadas: data.ganadas,
            ingresos: data.ingresos,
            conversion: data.registros > 0 ? data.ganadas / data.registros : 0,
            margen: data.countMargin > 0 ? data.margen / data.countMargin : 0,
            ticketPromedio: data.ticketCount > 0 ? data.ticketSum / data.ticketCount : 0,
        }));
}

export function buildAnalytics(rows: ParsedRow[], columns: string[]) {
    const fields = detectAllFields(columns);

    // Statistics
    const amounts: number[] = [];
    const margins: number[] = [];
    const responseTimes: number[] = [];
    const daysInPipeline: number[] = [];

    for (const row of rows) {
        const monto = fields.monto ? extractNumericValue(row[fields.monto]) : null;
        if (monto !== null) amounts.push(monto);

        const margen = fields.margenUsd ? extractNumericValue(row[fields.margenUsd]) : null;
        if (margen !== null) margins.push(margen);

        const resp = fields.tiempoRespuestaMin ? extractNumericValue(row[fields.tiempoRespuestaMin]) : null;
        if (resp !== null) responseTimes.push(resp);

        const dias = fields.diasEnPipeline ? extractNumericValue(row[fields.diasEnPipeline]) : null;
        if (dias !== null) daysInPipeline.push(dias);
    }

    const lowMarginThreshold = 500; // USD
    const highMarginThreshold = 5000; // USD

    const stats: DashboardStatistics = {
        amounts: {
            min: amounts.length ? Math.min(...amounts) : null,
            max: amounts.length ? Math.max(...amounts) : null,
            avg: amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : null,
            median: median(amounts),
            p25: percentile(amounts, 25),
            p75: percentile(amounts, 75),
            stdDev: standardDeviation(amounts),
            sum: amounts.length ? amounts.reduce((a, b) => a + b, 0) : null,
            count: amounts.length,
        },
        margin: {
            avg: margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : null,
            min: margins.length ? Math.min(...margins) : null,
            max: margins.length ? Math.max(...margins) : null,
            lowCount: margins.filter((m) => m < lowMarginThreshold).length,
            highCount: margins.filter((m) => m > highMarginThreshold).length,
        },
        time: {
            avgResponseMin: responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null,
            minResponseMin: responseTimes.length ? Math.min(...responseTimes) : null,
            maxResponseMin: responseTimes.length ? Math.max(...responseTimes) : null,
            slaCompliancePct: null,
            avgDaysInPipeline: daysInPipeline.length ? daysInPipeline.reduce((a, b) => a + b, 0) / daysInPipeline.length : null,
        },
        distributions: {
            estado: buildDistribution(rows, fields.estado),
            canal: buildDistribution(rows, fields.canal),
            vendedor: buildDistribution(rows, fields.vendedor),
            ciudad: buildDistribution(rows, fields.ciudad),
            sucursal: buildDistribution(rows, fields.sucursal),
            campana: buildDistribution(rows, fields.campana),
            producto: buildDistribution(rows, fields.productoCategoria),
            temperatura: buildDistribution(rows, fields.temperaturaLead),
            riesgo: buildDistribution(rows, fields.riesgoChurn),
        },
        rankings: {
            topSellersByRevenue: buildRanking(rows, fields.vendedor, fields.monto, 10),
            topSellersByConversion: buildConversionRanking(rows, fields.vendedor, fields.estado, WIN_STATUS_KEYWORDS, 10),
            topChannelsByRevenue: buildRanking(rows, fields.canal, fields.monto, 10),
            topCitiesByRevenue: buildRanking(rows, fields.ciudad, fields.monto, 10),
            topCampaignsByRevenue: buildRanking(rows, fields.campana, fields.monto, 10),
            topProductsByRevenue: buildRanking(rows, fields.productoCategoria, fields.monto, 10),
            topClientsByAmount: buildRanking(rows, fields.clienteNombre, fields.monto, 10),
        },
        funnel: buildFunnel(rows, fields),
        monthlyCohorts: buildCohorts(rows, fields),
    };

    // SLA compliance from raw rows
    if (fields.cumplimientoSla) {
        let slaTotal = 0;
        let slaOk = 0;
        for (const row of rows) {
            const val = extractBooleanValue(row[fields.cumplimientoSla]);
            if (val !== null) {
                slaTotal++;
                if (val === true) slaOk++;
            }
        }
        stats.time.slaCompliancePct = slaTotal > 0 ? slaOk / slaTotal : null;
    }

    // Charts
    const revenueByMonth = fields.fecha
        ? groupAndAgg(rows, fields.fecha, fields.monto, "sum").map((p) => ({
              name: p.name,
              value: p.value,
          }))
        : [];

    const statusDistribution: ChartPoint[] = fields.estado
        ? Object.entries(groupByField(rows, fields.estado)).map(([name, value]) => ({ name, value }))
        : [];

    const revenueByChannel = fields.canal ? groupAndAgg(rows, fields.canal, fields.monto, "sum").slice(0, 10) : [];
    const sellerRanking = fields.vendedor ? groupAndAgg(rows, fields.vendedor, fields.monto, "sum").slice(0, 10) : [];

    const leadTemperature: ChartPoint[] = fields.temperaturaLead
        ? Object.entries(groupByField(rows, fields.temperaturaLead)).map(([name, value]) => ({ name, value }))
        : [];

    const riskDistribution = buildRiskDistribution(rows);

    // Monthly conversion rate
    const conversionRateMonthly: ChartPoint[] = stats.monthlyCohorts.map((c) => ({
        name: c.month,
        value: c.conversion,
    }));

    // Invoices required vs sent
    const invoicesRequiredVsSent = buildInvoicesRequiredVsSent(rows);

    // Monto vs probabilidad
    const montosVsProbabilidad = buildMontosVsProbabilidad(rows);

    // City vs Channel heatmap data
    const cityVsChannel: Array<{ ciudad: string; canal: string; count: number }> = [];
    if (fields.ciudad && fields.canal) {
        const map: Record<string, number> = {};
        for (const row of rows) {
            const city: string = String(row[fields.ciudad!] ?? "Sin ciudad").trim() || "Sin ciudad";
            const channel: string = String(row[fields.canal!] ?? "Sin canal").trim() || "Sin canal";
            const key = `${city}|||${channel}`;
            map[key] = (map[key] ?? 0) + 1;
        }
        for (const [key, count] of Object.entries(map)) {
            const [ciudad, canal] = key.split("|||");
            cityVsChannel.push({ ciudad, canal, count });
        }
    }

    const campaignRanking = stats.rankings.topCampaignsByRevenue;

    const charts: DashboardCharts = {
        revenueByMonth,
        statusDistribution,
        revenueByChannel,
        sellerRanking,
        pipelineFunnel: buildPipelineFunnel(rows),
        leadTemperature,
        riskDistribution,
        conversionRateMonthly,
        invoicesRequiredVsSent,
        montosVsProbabilidad,
        cityVsChannel,
        campaignRanking,
    };

    // Executive Summary — Concesionario
    const summary: ExecutiveSummaryItem[] = [];

    const totalRows = rows.length;
    const estadoField = fields.estado;
    const wonCount = estadoField ? rows.filter((r) => isWinStatus(String(r[estadoField] ?? ""))).length : 0;
    const lostCount = estadoField ? rows.filter((r) => isLostStatus(String(r[estadoField] ?? ""))).length : 0;
    const conversionRate = totalRows > 0 ? wonCount / totalRows : 0;
    const totalRevenue = amounts.reduce((a, b) => a + b, 0);
    const pipelineAmount = estadoField
        ? rows
              .filter((r) => !isWinStatus(String(r[estadoField] ?? "")) && !isLostStatus(String(r[estadoField] ?? "")))
              .reduce((sum, r) => {
                  const m = fields.monto ? extractNumericValue(r[fields.monto]) : null;
                  return m !== null ? sum + m : sum;
              }, 0)
        : 0;

    const fmtCur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const fmtPct = new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: 1 });

    // Tasa de cierre
    summary.push({
        text: `La tasa de cierre actual es ${fmtPct.format(conversionRate)}, ${conversionRate >= 0.25 ? "por encima" : "por debajo"} del benchmark del 25%.`,
        tone: conversionRate >= 0.25 ? "good" : "warning",
    });

    if (pipelineAmount > 0) {
        summary.push({ text: `El pipeline abierto representa ${fmtCur.format(pipelineAmount)} en oportunidades activas.`, tone: "neutral" });
    }

    // Top asesor
    const topSeller = stats.rankings.topSellersByRevenue[0];
    if (topSeller) {
        summary.push({ text: `El asesor con mayor volumen de ventas es ${topSeller.name} (${fmtCur.format(topSeller.value)}).`, tone: "good" });
    }

    // Top sucursal
    const topBranch = stats.rankings.topSellersByRevenue[0]; // Reuse or create branch ranking if available
    // For now use top seller as proxy or skip if no branch ranking

    // Top marca
    if (fields.marca && fields.monto) {
        const brandMap: Record<string, number> = {};
        for (const row of rows) {
            const brand = String(row[fields.marca] ?? "").trim() || "Sin marca";
            const m = extractNumericValue(row[fields.monto]);
            if (m !== null) brandMap[brand] = (brandMap[brand] ?? 0) + m;
        }
        const topBrandEntry = Object.entries(brandMap).sort((a, b) => b[1] - a[1])[0];
        if (topBrandEntry) {
            summary.push({ text: `La marca con mayor facturación estimada es ${topBrandEntry[0]} (${fmtCur.format(topBrandEntry[1])}).`, tone: "good" });
        }
    }

    // Top modelo
    if (fields.modelo && fields.monto) {
        const modelMap: Record<string, number> = {};
        for (const row of rows) {
            const model = String(row[fields.modelo] ?? "").trim() || "Sin modelo";
            const m = extractNumericValue(row[fields.monto]);
            if (m !== null) modelMap[model] = (modelMap[model] ?? 0) + m;
        }
        const topModelEntry = Object.entries(modelMap).sort((a, b) => b[1] - a[1])[0];
        if (topModelEntry) {
            summary.push({ text: `El modelo con mayor demanda es ${topModelEntry[0]} (${fmtCur.format(topModelEntry[1])}).`, tone: "good" });
        }
    }

    // Canal
    const topChannel = revenueByChannel[0];
    if (topChannel) {
        summary.push({ text: `El canal que más oportunidades genera es ${topChannel.name} (${fmtCur.format(topChannel.value)}).`, tone: "good" });
    }

    // Pipeline ponderado
    const weightedPipeline = pipelineAmount > 0 ? stats.amounts.avg ?? 0 : 0; // Approx
    // Use actual weighted from metrics if available; here we approximate
    summary.push({ text: `El pipeline ponderado actual es ${fmtCur.format(pipelineAmount)} en oportunidades activas.`, tone: "neutral" });

    // Facturas
    if (invoicesRequiredVsSent.length > 0) {
        const pending = Math.max(0, invoicesRequiredVsSent[0]?.value ?? 0 - (invoicesRequiredVsSent[1]?.value ?? 0));
        summary.push({ text: `Hay ${pending} facturas pendientes de envío.`, tone: pending > 0 ? "warning" : "good" });
    }

    // Financiamiento
    if (fields.financiamiento) {
        let financingCount = 0;
        for (const row of rows) {
            const fin = extractBooleanValue(row[fields.financiamiento]);
            if (fin === true) financingCount++;
        }
        if (financingCount > 0) {
            summary.push({ text: `${financingCount} oportunidades requieren financiamiento.`, tone: "neutral" });
        }
    }

    // Banco más usado
    if (fields.bancoFinanciador) {
        const bankMap: Record<string, number> = {};
        for (const row of rows) {
            const bank = String(row[fields.bancoFinanciador] ?? "").trim();
            if (bank) bankMap[bank] = (bankMap[bank] ?? 0) + 1;
        }
        const topBankEntry = Object.entries(bankMap).sort((a, b) => b[1] - a[1])[0];
        if (topBankEntry) {
            summary.push({ text: `El banco más usado para financiamiento es ${topBankEntry[0]} (${topBankEntry[1]} operaciones).`, tone: "good" });
        }
    }

    // Riesgo alto
    if (fields.riesgoChurn) {
        let highRiskCount = 0;
        for (const row of rows) {
            const risk = String(row[fields.riesgoChurn] ?? "").trim().toLowerCase();
            if (risk.includes("alto") || risk.includes("high") || risk.includes("critico")) highRiskCount++;
        }
        if (highRiskCount > 0) {
            summary.push({ text: `Hay ${highRiskCount} oportunidades con riesgo alto de pérdida.`, tone: highRiskCount > 5 ? "danger" : "warning" });
        }
    }

    // Test drives
    if (fields.testDrive) {
        let tdCount = 0;
        for (const row of rows) {
            const td = extractBooleanValue(row[fields.testDrive]);
            if (td === true) tdCount++;
        }
        if (tdCount > 0) {
            summary.push({ text: `Se han realizado ${tdCount} test drives.`, tone: "good" });
        }
    }

    // SLA
    if (stats.time.avgResponseMin !== null) {
        const withinSla = stats.time.avgResponseMin <= 60;
        summary.push({ text: `El tiempo promedio de respuesta es ${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(stats.time.avgResponseMin)} min, ${withinSla ? "dentro" : "fuera"} del SLA comercial.`, tone: withinSla ? "good" : "danger" });
    }

    if (stats.time.slaCompliancePct !== null) {
        summary.push({ text: `El cumplimiento SLA comercial es ${fmtPct.format(stats.time.slaCompliancePct)}.`, tone: stats.time.slaCompliancePct >= 0.9 ? "good" : stats.time.slaCompliancePct >= 0.7 ? "warning" : "danger" });
    }

    if (lostCount > wonCount) {
        summary.push({ text: `Se han perdido más operaciones (${lostCount}) de las ganadas (${wonCount}). Revisar motivos de pérdida.`, tone: "danger" });
    }

    if (stats.margin.lowCount > 0) {
        summary.push({ text: `${stats.margin.lowCount} operaciones tienen un margen bruto inferior a $500, lo que representa un riesgo de rentabilidad.`, tone: "warning" });
    }

    return { stats, charts, summary };
}
