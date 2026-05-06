import type { ChartPoint, FunnelStage } from "./types";

export function normalizeKey(key: unknown) {
    return String(key || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function getFieldValue(row: Record<string, unknown>, candidates: string[]) {
    const normalizedRow = new Map<string, unknown>();

    for (const [key, value] of Object.entries(row)) {
        normalizedRow.set(normalizeKey(key), value);
    }

    for (const candidate of candidates) {
        const key = normalizeKey(candidate);

        if (normalizedRow.has(key)) {
            return normalizedRow.get(key);
        }
    }

    return undefined;
}

export function parseBooleanFlexible(value: unknown) {
    const normalized = String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return [
        "si",
        "sí",
        "true",
        "1",
        "yes",
        "y",
        "enviada",
        "requerida",
        "cumplido",
        "completado"
    ].includes(normalized);
}

export function parseNumberFlexible(value: unknown) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    let raw = String(value ?? "").trim();

    if (!raw) return null;

    raw = raw
        .replace(/usd/gi, "")
        .replace(/us\$/gi, "")
        .replace(/\$/g, "")
        .replace(/\s/g, "");

    if (raw.includes(",") && raw.includes(".")) {
        if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
            raw = raw.replace(/\./g, "").replace(",", ".");
        } else {
            raw = raw.replace(/,/g, "");
        }
    } else if (raw.includes(",")) {
        raw = raw.replace(",", ".");
    }

    const num = Number(raw);

    return Number.isFinite(num) ? num : null;
}

export function parseProbabilityFlexible(value: unknown) {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
        if (value <= 1) return value * 100;
        return value;
    }

    const raw = String(value).trim().replace("%", "");
    const number = parseNumberFlexible(raw);

    if (number === null) return null;
    if (number <= 1) return number * 100;

    return number;
}

export function buildInvoicesRequiredVsSent(rows: Record<string, unknown>[]) {
    const hasRequiredField = rows.some((row) =>
        getFieldValue(row, [
            "factura_requerida",
            "facturas_requeridas",
            "requiere_factura",
            "invoice_required"
        ]) !== undefined
    );

    const hasSentField = rows.some((row) =>
        getFieldValue(row, [
            "factura_enviada",
            "facturas_enviadas",
            "invoice_sent"
        ]) !== undefined
    );

    if (!hasRequiredField && !hasSentField) return [];

    let required = 0;
    let sent = 0;

    for (const row of rows) {
        const requiredValue = getFieldValue(row, [
            "factura_requerida",
            "facturas_requeridas",
            "requiere_factura",
            "invoice_required"
        ]);

        const sentValue = getFieldValue(row, [
            "factura_enviada",
            "facturas_enviadas",
            "invoice_sent"
        ]);

        if (parseBooleanFlexible(requiredValue)) required++;
        if (parseBooleanFlexible(sentValue)) sent++;
    }

    return [
        { name: "Requeridas", value: required },
        { name: "Enviadas", value: sent },
        { name: "Pendientes", value: Math.max(required - sent, 0) }
    ];
}

export function buildMontosVsProbabilidad(rows: Record<string, unknown>[]) {
    type Item = {
        id: string;
        cliente: string;
        monto: number;
        probabilidad: number;
        estado: string;
        vendedor: string;
        canal: string;
    };

    return rows
        .map((row): Item | null => {
            const monto = parseNumberFlexible(
                getFieldValue(row, [
                    "monto",
                    "monto_usd",
                    "amount",
                    "total",
                    "revenue",
                    "ingreso"
                ])
            );

            const probabilidadRaw = parseProbabilityFlexible(
                getFieldValue(row, [
                    "probabilidad_cierre",
                    "probabilidad",
                    "probabilidad de cierre",
                    "probability",
                    "close_probability"
                ])
            );

            if (monto === null || probabilidadRaw === null) return null;

            // Dejar en escala 0-100 para el eje X del ScatterChart
            const probabilidad = probabilidadRaw;

            return {
                id: String(getFieldValue(row, ["id", "opp_id", "opportunity_id", "codigo"]) || row.row_number || ""),
                cliente: String(getFieldValue(row, ["cliente_nombre", "cliente", "customer_name", "nombre_cliente"]) || ""),
                monto,
                probabilidad,
                estado: String(getFieldValue(row, ["estado", "status", "state"]) || ""),
                vendedor: String(getFieldValue(row, ["vendedor", "seller", "asesor", "sales_rep"]) || ""),
                canal: String(getFieldValue(row, ["canal", "channel", "origen_lead", "canal_venta"]) || "Sin canal"),
            };
        })
        .filter((item): item is Item => item !== null)
        .slice(0, 500);
}

export function buildRiskDistribution(rows: Record<string, unknown>[]) {
    const map = new Map<string, number>();

    for (const row of rows) {
        const raw = getFieldValue(row, [
            "riesgo_churn",
            "riesgo",
            "risk",
            "churn_risk"
        ]);

        const label = String(raw || "").trim() || "Sin dato";

        map.set(label, (map.get(label) || 0) + 1);
    }

    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

export function buildPipelineFunnel(rows: Record<string, unknown>[]): FunnelStage[] {
    const map = new Map<string, { count: number; amount: number }>();

    for (const row of rows) {
        const raw = getFieldValue(row, [
            "etapa_pipeline",
            "pipeline",
            "etapa",
            "stage",
            "pipeline_stage"
        ]);

        const label = String(raw || "").trim() || "Sin etapa";

        if (!map.has(label)) {
            map.set(label, { count: 0, amount: 0 });
        }

        const item = map.get(label)!;
        item.count += 1;

        const monto = parseNumberFlexible(
            getFieldValue(row, [
                "monto",
                "monto_usd",
                "amount",
                "total",
                "revenue"
            ])
        );

        if (monto !== null) {
            item.amount += monto;
        }
    }

    const entries = Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
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
