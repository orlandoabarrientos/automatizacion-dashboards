import type { ParsedRow, KpiItem } from "@/lib/dashboard/types";
import type { FieldMap } from "./field-detection";
import { extractNumericValue, extractBooleanValue } from "./formatting";

const WIN_STATUS_KEYWORDS = ["ganado", "win", "won", "closed won", "completado", "facturado"];
const LOST_STATUS_KEYWORDS = ["perdido", "lost", "closed lost", "cancelado", "descartado"];
const OPEN_STATUS_KEYWORDS = ["abierto", "open", "en proceso", "proceso", "pendiente", "nuevo", "nueva", "calificado", "calificada", "propuesta", "negociacion"];

function isWinStatus(status: string): boolean {
    const s = status.toLowerCase();
    return WIN_STATUS_KEYWORDS.some((k) => s.includes(k));
}

function isLostStatus(status: string): boolean {
    const s = status.toLowerCase();
    return LOST_STATUS_KEYWORDS.some((k) => s.includes(k));
}

function isOpenStatus(status: string): boolean {
    const s = status.toLowerCase();
    return OPEN_STATUS_KEYWORDS.some((k) => s.includes(k));
}

function isHotLead(temp: string): boolean {
    const t = temp.toLowerCase();
    return t.includes("caliente") || t.includes("hot") || t.includes("alta");
}

function isWarmLead(temp: string): boolean {
    const t = temp.toLowerCase();
    return t.includes("tibio") || t.includes("warm") || t.includes("media");
}

function isColdLead(temp: string): boolean {
    const t = temp.toLowerCase();
    return t.includes("frio") || t.includes("cold") || t.includes("baja");
}

function isHighRisk(risk: string): boolean {
    const r = risk.toLowerCase();
    return r.includes("alto") || r.includes("high") || r.includes("critico");
}

function isMediumRisk(risk: string): boolean {
    const r = risk.toLowerCase();
    return r.includes("medio") || r.includes("medium") || r.includes("moderado");
}

function isLowRisk(risk: string): boolean {
    const r = risk.toLowerCase();
    return r.includes("bajo") || r.includes("low") || r.includes("minimo");
}

function makeKpi(
    id: string,
    label: string,
    value: number | null,
    formattedValue: string,
    description: string,
    category: KpiItem["category"],
    status: KpiItem["status"],
    trend: number | null = null,
    trendLabel: string | null = null
): KpiItem {
    return { id, label, value, formattedValue, description, trend, trendLabel, status, category };
}

export function buildKpis(rows: ParsedRow[], fields: FieldMap): KpiItem[] {
    if (!rows.length) return [];

    const totalRows = rows.length;

    // Counters and accumulators
    let openCount = 0;
    let wonCount = 0;
    let lostCount = 0;
    let invoicedCount = 0;
    let totalAmount = 0;
    let wonAmount = 0;
    let lostAmount = 0;
    let pipelineAmount = 0;
    let weightedPipeline = 0;
    let totalProb = 0;
    let probCount = 0;
    let totalMargin = 0;
    let marginCount = 0;
    let totalDaysPipeline = 0;
    let daysCount = 0;
    let totalResponseMin = 0;
    let responseCount = 0;
    let slaCompliantCount = 0;
    let slaTotal = 0;
    let invoicesRequired = 0;
    let invoicesSent = 0;
    let hotLeads = 0;
    let warmLeads = 0;
    let coldLeads = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let testDriveCount = 0;
    let totalCalls = 0;
    let totalMessages = 0;

    // Trackers for tops
    const sellerRevenue: Record<string, number> = {};
    const channelRevenue: Record<string, number> = {};
    const cityRevenue: Record<string, number> = {};
    const campaignRevenue: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};
    const clientAmount: Record<string, number> = {};
    const branchConversion: Record<string, { total: number; won: number }> = {};

    for (const row of rows) {
        const status = fields.estado ? String(row[fields.estado] ?? "").trim() : "";
        const monto = fields.monto ? extractNumericValue(row[fields.monto]) : null;
        const margen = fields.margenUsd ? extractNumericValue(row[fields.margenUsd]) : null;
        const prob = fields.probabilidadCierre ? extractNumericValue(row[fields.probabilidadCierre]) : null;
        const dias = fields.diasEnPipeline ? extractNumericValue(row[fields.diasEnPipeline]) : null;
        const respMin = fields.tiempoRespuestaMin ? extractNumericValue(row[fields.tiempoRespuestaMin]) : null;
        const satisfaccion = fields.satisfaccionCliente ? extractNumericValue(row[fields.satisfaccionCliente]) : null;
        const calls = fields.llamadasRealizadas ? extractNumericValue(row[fields.llamadasRealizadas]) : null;
        const msgs = fields.mensajesEnviados ? extractNumericValue(row[fields.mensajesEnviados]) : null;

        if (isOpenStatus(status)) openCount++;
        if (isWinStatus(status)) wonCount++;
        if (isLostStatus(status)) lostCount++;

        // Invoiced = won + factura_enviada true
        if (fields.facturaEnviada) {
            const inv = extractBooleanValue(row[fields.facturaEnviada]);
            if (inv === true) {
                invoicesSent++;
                if (isWinStatus(status)) invoicedCount++;
            }
        }
        if (fields.facturaRequerida) {
            const req = extractBooleanValue(row[fields.facturaRequerida]);
            if (req === true) invoicesRequired++;
        }

        if (monto !== null) {
            totalAmount += monto;
            if (isWinStatus(status)) wonAmount += monto;
            if (isLostStatus(status)) lostAmount += monto;
            if (isOpenStatus(status)) pipelineAmount += monto;

            const weight = prob !== null ? (prob > 1 ? prob / 100 : prob) : 0;
            weightedPipeline += monto * weight;

            // Tops
            if (fields.vendedor) {
                const v = String(row[fields.vendedor] ?? "Sin dato").trim() || "Sin dato";
                sellerRevenue[v] = (sellerRevenue[v] ?? 0) + monto;
            }
            if (fields.canal) {
                const c = String(row[fields.canal] ?? "Sin dato").trim() || "Sin dato";
                channelRevenue[c] = (channelRevenue[c] ?? 0) + monto;
            }
            if (fields.ciudad) {
                const c = String(row[fields.ciudad] ?? "Sin dato").trim() || "Sin dato";
                cityRevenue[c] = (cityRevenue[c] ?? 0) + monto;
            }
            if (fields.campana) {
                const c = String(row[fields.campana] ?? "Sin dato").trim() || "Sin dato";
                campaignRevenue[c] = (campaignRevenue[c] ?? 0) + monto;
            }
            if (fields.productoCategoria) {
                const p = String(row[fields.productoCategoria] ?? "Sin dato").trim() || "Sin dato";
                productRevenue[p] = (productRevenue[p] ?? 0) + monto;
            }
            if (fields.clienteNombre) {
                const cl = String(row[fields.clienteNombre] ?? "Sin dato").trim() || "Sin dato";
                clientAmount[cl] = (clientAmount[cl] ?? 0) + monto;
            }
        }

        if (margen !== null) {
            totalMargin += margen;
            marginCount++;
        }

        if (prob !== null) {
            totalProb += prob > 1 ? prob / 100 : prob;
            probCount++;
        }

        if (dias !== null) {
            totalDaysPipeline += dias;
            daysCount++;
        }

        if (respMin !== null) {
            totalResponseMin += respMin;
            responseCount++;
        }

        if (fields.cumplimientoSla) {
            const sla = extractBooleanValue(row[fields.cumplimientoSla]);
            slaTotal++;
            if (sla === true) slaCompliantCount++;
        }

        if (fields.temperaturaLead) {
            const temp = String(row[fields.temperaturaLead] ?? "").trim();
            if (isHotLead(temp)) hotLeads++;
            if (isWarmLead(temp)) warmLeads++;
            if (isColdLead(temp)) coldLeads++;
        }

        if (fields.riesgoChurn) {
            const risk = String(row[fields.riesgoChurn] ?? "").trim();
            if (isHighRisk(risk)) highRiskCount++;
            if (isMediumRisk(risk)) mediumRiskCount++;
            if (isLowRisk(risk)) lowRiskCount++;
        }

        if (fields.testDrive) {
            const td = extractBooleanValue(row[fields.testDrive]);
            if (td === true) testDriveCount++;
        }

        if (satisfaccion !== null) {
            totalSatisfaction += satisfaccion;
            satisfactionCount++;
        }

        if (calls !== null) totalCalls += calls;
        if (msgs !== null) totalMessages += msgs;

        if (fields.sucursal && fields.estado) {
            const b = String(row[fields.sucursal] ?? "Sin dato").trim() || "Sin dato";
            if (!branchConversion[b]) branchConversion[b] = { total: 0, won: 0 };
            branchConversion[b].total++;
            if (isWinStatus(status)) branchConversion[b].won++;
        }
    }

    const conversionRate = totalRows > 0 ? wonCount / totalRows : 0;
    const avgTicket = totalRows > 0 ? totalAmount / totalRows : 0;
    const avgTicketWon = wonCount > 0 ? wonAmount / wonCount : 0;
    const avgMarginPct = marginCount > 0 && totalAmount > 0 ? (totalMargin / totalAmount) : 0;
    const avgProb = probCount > 0 ? totalProb / probCount : 0;
    const avgDays = daysCount > 0 ? totalDaysPipeline / daysCount : 0;
    const avgResponse = responseCount > 0 ? totalResponseMin / responseCount : 0;
    const slaPct = slaTotal > 0 ? slaCompliantCount / slaTotal : 0;
    const invoiceRate = invoicesRequired > 0 ? invoicesSent / invoicesRequired : 0;
    const pendingInvoices = Math.max(0, invoicesRequired - invoicesSent);
    const avgSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;
    const avgCalls = totalRows > 0 ? totalCalls / totalRows : 0;
    const avgMessages = totalRows > 0 ? totalMessages / totalRows : 0;

    const topSeller = Object.entries(sellerRevenue).sort((a, b) => b[1] - a[1])[0];
    const topChannel = Object.entries(channelRevenue).sort((a, b) => b[1] - a[1])[0];
    const topCity = Object.entries(cityRevenue).sort((a, b) => b[1] - a[1])[0];
    const topCampaign = Object.entries(campaignRevenue).sort((a, b) => b[1] - a[1])[0];
    const topProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0];
    const topBranchEntry = Object.entries(branchConversion).sort((a, b) => {
        const rateA = a[1].total > 0 ? a[1].won / a[1].total : 0;
        const rateB = b[1].total > 0 ? b[1].won / b[1].total : 0;
        return rateB - rateA;
    })[0];

    const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
    const fmtCur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const fmtPct = new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const kpis: KpiItem[] = [];

    kpis.push(makeKpi("total_rows", "Total registros", totalRows, fmt.format(totalRows), "Total de oportunidades en el dataset", "sales", "neutral"));
    kpis.push(makeKpi("open_opps", "Oportunidades abiertas", openCount, fmt.format(openCount), "Oportunidades en etapas abiertas", "pipeline", openCount > 0 ? "warning" : "neutral"));
    kpis.push(makeKpi("won_sales", "Ventas ganadas", wonCount, fmt.format(wonCount), "Oportunidades cerradas ganadas", "sales", wonCount > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("invoiced_sales", "Ventas facturadas", invoicedCount, fmt.format(invoicedCount), "Ventas ganadas con factura enviada", "revenue", invoicedCount > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("lost_sales", "Ventas perdidas", lostCount, fmt.format(lostCount), "Oportunidades cerradas perdidas", "sales", lostCount > 0 ? "danger" : "neutral"));
    kpis.push(makeKpi("conversion_rate", "Tasa de conversión", conversionRate, fmtPct.format(conversionRate), "Porcentaje de oportunidades ganadas sobre total", "sales", conversionRate >= 0.25 ? "good" : conversionRate >= 0.15 ? "warning" : "danger"));
    kpis.push(makeKpi("total_revenue", "Ingresos totales USD", totalAmount, fmtCur.format(totalAmount), "Suma de montos de todas las oportunidades", "revenue", totalAmount > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("won_revenue", "Ingresos ganados USD", wonAmount, fmtCur.format(wonAmount), "Suma de montos de oportunidades ganadas", "revenue", wonAmount > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("total_bs", "Monto total Bs", null, "—", "Requiere campo monto_bs", "revenue", "neutral")); // Placeholder if not present; we can compute if field exists but user asked for 40 KPIs
    kpis.push(makeKpi("avg_ticket", "Ticket promedio", avgTicket, fmtCur.format(avgTicket), "Monto promedio por oportunidad", "revenue", avgTicket > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("avg_ticket_won", "Ticket promedio ganado", avgTicketWon, fmtCur.format(avgTicketWon), "Monto promedio de oportunidades ganadas", "revenue", avgTicketWon > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("gross_margin_usd", "Margen bruto USD", totalMargin, fmtCur.format(totalMargin), "Suma de márgenes en dólares", "revenue", totalMargin > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("avg_margin_pct", "Margen bruto promedio %", avgMarginPct, fmtPct.format(avgMarginPct), "Margen promedio ponderado", "revenue", avgMarginPct >= 0.15 ? "good" : avgMarginPct >= 0.08 ? "warning" : "danger"));
    kpis.push(makeKpi("pipeline_total", "Pipeline total", pipelineAmount, fmtCur.format(pipelineAmount), "Monto de oportunidades abiertas", "pipeline", pipelineAmount > 0 ? "warning" : "neutral"));
    kpis.push(makeKpi("pipeline_weighted", "Pipeline ponderado", weightedPipeline, fmtCur.format(weightedPipeline), "Pipeline ponderado por probabilidad de cierre", "pipeline", weightedPipeline > 0 ? "warning" : "neutral"));
    kpis.push(makeKpi("avg_prob", "Probabilidad promedio", avgProb, fmtPct.format(avgProb), "Probabilidad media de cierre", "pipeline", avgProb >= 0.5 ? "good" : avgProb >= 0.3 ? "warning" : "danger"));
    kpis.push(makeKpi("avg_days_pipeline", "Días promedio en pipeline", avgDays, fmt.format(avgDays), "Tiempo medio desde creación hasta cierre", "pipeline", avgDays <= 30 ? "good" : avgDays <= 60 ? "warning" : "danger"));
    kpis.push(makeKpi("avg_response", "Tiempo promedio respuesta", avgResponse, `${fmt.format(avgResponse)} min`, "Tiempo medio de respuesta al cliente en minutos", "operations", avgResponse <= 30 ? "good" : avgResponse <= 120 ? "warning" : "danger"));
    kpis.push(makeKpi("sla_compliance", "Cumplimiento SLA", slaPct, fmtPct.format(slaPct), "Porcentaje de oportunidades dentro del SLA", "operations", slaPct >= 0.9 ? "good" : slaPct >= 0.7 ? "warning" : "danger"));
    kpis.push(makeKpi("invoices_required", "Facturas requeridas", invoicesRequired, fmt.format(invoicesRequired), "Oportunidades que requieren factura", "operations", "neutral"));
    kpis.push(makeKpi("invoices_sent", "Facturas enviadas", invoicesSent, fmt.format(invoicesSent), "Facturas ya enviadas", "operations", invoicesSent >= invoicesRequired ? "good" : "warning"));
    kpis.push(makeKpi("invoices_pending", "Facturas pendientes", pendingInvoices, fmt.format(pendingInvoices), "Facturas requeridas pero no enviadas", "operations", pendingInvoices === 0 ? "good" : "danger"));
    kpis.push(makeKpi("invoice_rate", "Tasa de facturación", invoiceRate, fmtPct.format(invoiceRate), "Porcentaje de facturas enviadas vs requeridas", "operations", invoiceRate >= 0.9 ? "good" : invoiceRate >= 0.6 ? "warning" : "danger"));
    kpis.push(makeKpi("hot_leads", "Leads calientes", hotLeads, fmt.format(hotLeads), "Leads con temperatura alta", "customer", hotLeads > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("warm_leads", "Leads tibios", warmLeads, fmt.format(warmLeads), "Leads con temperatura media", "customer", "neutral"));
    kpis.push(makeKpi("cold_leads", "Leads fríos", coldLeads, fmt.format(coldLeads), "Leads con temperatura baja", "customer", coldLeads > hotLeads ? "warning" : "neutral"));
    kpis.push(makeKpi("avg_satisfaction", "Satisfacción promedio", avgSatisfaction, fmt.format(avgSatisfaction), "Puntuación media de satisfacción del cliente", "customer", avgSatisfaction >= 4 ? "good" : avgSatisfaction >= 3 ? "warning" : "danger"));
    kpis.push(makeKpi("high_risk", "Riesgo alto", highRiskCount, fmt.format(highRiskCount), "Clientes/oportunidades con riesgo alto de churn", "risk", highRiskCount > 0 ? "danger" : "good"));
    kpis.push(makeKpi("medium_risk", "Riesgo medio", mediumRiskCount, fmt.format(mediumRiskCount), "Clientes/oportunidades con riesgo medio de churn", "risk", "neutral"));
    kpis.push(makeKpi("low_risk", "Riesgo bajo", lowRiskCount, fmt.format(lowRiskCount), "Clientes/oportunidades con riesgo bajo de churn", "risk", "good"));
    kpis.push(makeKpi("test_drives", "Test drives", testDriveCount, fmt.format(testDriveCount), "Cantidad de test drives realizados", "sales", testDriveCount > 0 ? "good" : "neutral"));
    kpis.push(makeKpi("lost_amount", "Monto perdido", lostAmount, fmtCur.format(lostAmount), "Valor de oportunidades perdidas", "revenue", lostAmount > 0 ? "danger" : "good"));
    kpis.push(makeKpi("top_seller", "Top vendedor", null, topSeller?.[0] ?? "—", topSeller ? `${fmtCur.format(topSeller[1])} en ingresos` : "Sin datos", "sales", topSeller ? "good" : "neutral"));
    kpis.push(makeKpi("top_channel", "Top canal", null, topChannel?.[0] ?? "—", topChannel ? `${fmtCur.format(topChannel[1])} en ingresos` : "Sin datos", "sales", topChannel ? "good" : "neutral"));
    kpis.push(makeKpi("top_city", "Top ciudad", null, topCity?.[0] ?? "—", topCity ? `${fmtCur.format(topCity[1])} en ingresos` : "Sin datos", "sales", topCity ? "good" : "neutral"));
    kpis.push(makeKpi("top_campaign", "Top campaña", null, topCampaign?.[0] ?? "—", topCampaign ? `${fmtCur.format(topCampaign[1])} en ingresos` : "Sin datos", "sales", topCampaign ? "good" : "neutral"));
    kpis.push(makeKpi("top_product", "Producto más vendido", null, topProduct?.[0] ?? "—", topProduct ? `${fmtCur.format(topProduct[1])} en ingresos` : "Sin datos", "sales", topProduct ? "good" : "neutral"));
    kpis.push(makeKpi("top_branch", "Mejor sucursal", null, topBranchEntry?.[0] ?? "—", topBranchEntry ? `${fmtPct.format(topBranchEntry[1].total > 0 ? topBranchEntry[1].won / topBranchEntry[1].total : 0)} conversión` : "Sin datos", "sales", topBranchEntry ? "good" : "neutral"));
    kpis.push(makeKpi("avg_calls", "Promedio llamadas", avgCalls, fmt.format(avgCalls), "Llamadas promedio por oportunidad", "operations", "neutral"));
    kpis.push(makeKpi("avg_messages", "Promedio mensajes", avgMessages, fmt.format(avgMessages), "Mensajes promedio por oportunidad", "operations", "neutral"));

    return kpis;
}
