import type { ParsedRow, DashboardFilters } from "@/lib/dashboard/types";
import { extractNumericValue, parseDateValue, extractBooleanValue } from "./formatting";
import { detectAllFields } from "./field-detection";

export function applyDashboardFilters(rows: ParsedRow[], filters: DashboardFilters): ParsedRow[] {
    if (!rows.length) return [];
    const columns = Object.keys(rows[0]);
    const fields = detectAllFields(columns);

    return rows.filter((row) => {
        // Date range
        if (filters.dateFrom || filters.dateTo) {
            const dateField = fields.fecha;
            if (dateField) {
                const date = parseDateValue(row[dateField]);
                if (date) {
                    if (filters.dateFrom) {
                        const from = new Date(filters.dateFrom);
                        from.setHours(0, 0, 0, 0);
                        if (date < from) return false;
                    }
                    if (filters.dateTo) {
                        const to = new Date(filters.dateTo);
                        to.setHours(23, 59, 59, 999);
                        if (date > to) return false;
                    }
                }
            }
        }

        // Mes
        if (filters.mes && fields.mes) {
            const val = String(row[fields.mes] ?? "").trim();
            if (!val.toLowerCase().includes(filters.mes.toLowerCase())) return false;
        }

        // Estado
        if (filters.estado && fields.estado) {
            const val = String(row[fields.estado] ?? "").trim().toLowerCase();
            if (!val.includes(filters.estado.toLowerCase())) return false;
        }

        // Canal
        if (filters.canal && fields.canal) {
            const val = String(row[fields.canal] ?? "").trim().toLowerCase();
            if (!val.includes(filters.canal.toLowerCase())) return false;
        }

        // Vendedor
        if (filters.vendedor && fields.vendedor) {
            const val = String(row[fields.vendedor] ?? "").trim().toLowerCase();
            if (!val.includes(filters.vendedor.toLowerCase())) return false;
        }

        // Ciudad
        if (filters.ciudad && fields.ciudad) {
            const val = String(row[fields.ciudad] ?? "").trim().toLowerCase();
            if (!val.includes(filters.ciudad.toLowerCase())) return false;
        }

        // Sucursal
        if (filters.sucursal && fields.sucursal) {
            const val = String(row[fields.sucursal] ?? "").trim().toLowerCase();
            if (!val.includes(filters.sucursal.toLowerCase())) return false;
        }

        // Campaña
        if (filters.campana && fields.campana) {
            const val = String(row[fields.campana] ?? "").trim().toLowerCase();
            if (!val.includes(filters.campana.toLowerCase())) return false;
        }

        // Producto categoría
        if (filters.productoCategoria && fields.productoCategoria) {
            const val = String(row[fields.productoCategoria] ?? "").trim().toLowerCase();
            if (!val.includes(filters.productoCategoria.toLowerCase())) return false;
        }

        // Temperatura lead
        if (filters.temperaturaLead && fields.temperaturaLead) {
            const val = String(row[fields.temperaturaLead] ?? "").trim().toLowerCase();
            if (!val.includes(filters.temperaturaLead.toLowerCase())) return false;
        }

        // Prioridad
        if (filters.prioridad && fields.prioridad) {
            const val = String(row[fields.prioridad] ?? "").trim().toLowerCase();
            if (!val.includes(filters.prioridad.toLowerCase())) return false;
        }

        // Riesgo churn
        if (filters.riesgoChurn && fields.riesgoChurn) {
            const val = String(row[fields.riesgoChurn] ?? "").trim().toLowerCase();
            if (!val.includes(filters.riesgoChurn.toLowerCase())) return false;
        }

        // Factura enviada
        if (filters.facturaEnviada && fields.facturaEnviada) {
            const boolVal = extractBooleanValue(row[fields.facturaEnviada]);
            const filterBool = filters.facturaEnviada === "true";
            if (boolVal === null) return false;
            if (boolVal !== filterBool) return false;
        }

        // Cumplimiento SLA
        if (filters.cumplimientoSla && fields.cumplimientoSla) {
            const boolVal = extractBooleanValue(row[fields.cumplimientoSla]);
            const filterBool = filters.cumplimientoSla === "true";
            if (boolVal === null) return false;
            if (boolVal !== filterBool) return false;
        }

        // Monto min/max
        if (fields.monto) {
            const numeric = extractNumericValue(row[fields.monto]);
            if (numeric !== null) {
                if (filters.montoMin !== null && numeric < filters.montoMin) return false;
                if (filters.montoMax !== null && numeric > filters.montoMax) return false;
            }
        }

        return true;
    });
}

export function getFilterOptions(rows: ParsedRow[], fieldName: string | null): string[] {
    if (!fieldName || !rows.length) return [];
    const values = new Set<string>();
    for (const row of rows) {
        const val = row[fieldName];
        if (val !== null && val !== undefined && String(val).trim()) {
            values.add(String(val).trim());
        }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
}
