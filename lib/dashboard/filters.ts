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

        // Etapa pipeline
        if (filters.etapaPipeline && fields.etapaPipeline) {
            const val = String(row[fields.etapaPipeline] ?? "").trim().toLowerCase();
            if (!val.includes(filters.etapaPipeline.toLowerCase())) return false;
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

        // Equipo ventas
        if (filters.equipoVentas && fields.equipoVentas) {
            const val = String(row[fields.equipoVentas] ?? "").trim().toLowerCase();
            if (!val.includes(filters.equipoVentas.toLowerCase())) return false;
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

        // Marca
        if (filters.marca && fields.marca) {
            const val = String(row[fields.marca] ?? "").trim().toLowerCase();
            if (!val.includes(filters.marca.toLowerCase())) return false;
        }

        // Modelo
        if (filters.modelo && fields.modelo) {
            const val = String(row[fields.modelo] ?? "").trim().toLowerCase();
            if (!val.includes(filters.modelo.toLowerCase())) return false;
        }

        // Año vehículo
        if (filters.anoVehiculo && fields.anoVehiculo) {
            const val = String(row[fields.anoVehiculo] ?? "").trim().toLowerCase();
            if (!val.includes(filters.anoVehiculo.toLowerCase())) return false;
        }

        // Producto categoría
        if (filters.productoCategoria && fields.productoCategoria) {
            const val = String(row[fields.productoCategoria] ?? "").trim().toLowerCase();
            if (!val.includes(filters.productoCategoria.toLowerCase())) return false;
        }

        // Tipo operación
        if (filters.tipoOperacion && fields.tipoOperacion) {
            const val = String(row[fields.tipoOperacion] ?? "").trim().toLowerCase();
            if (!val.includes(filters.tipoOperacion.toLowerCase())) return false;
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

        // Financiamiento
        if (filters.financiamiento && fields.financiamiento) {
            const boolVal = extractBooleanValue(row[fields.financiamiento]);
            const filterBool = filters.financiamiento === "true";
            if (boolVal === null) return false;
            if (boolVal !== filterBool) return false;
        }

        // Banco financiador
        if (filters.bancoFinanciador && fields.bancoFinanciador) {
            const val = String(row[fields.bancoFinanciador] ?? "").trim().toLowerCase();
            if (!val.includes(filters.bancoFinanciador.toLowerCase())) return false;
        }

        // Test drive
        if (filters.testDrive && fields.testDrive) {
            const boolVal = extractBooleanValue(row[fields.testDrive]);
            const filterBool = filters.testDrive === "true";
            if (boolVal === null) return false;
            if (boolVal !== filterBool) return false;
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

        // Margen min/max
        if (fields.margenUsd) {
            const numeric = extractNumericValue(row[fields.margenUsd]);
            if (numeric !== null) {
                if (filters.margenMin !== null && numeric < filters.margenMin) return false;
                if (filters.margenMax !== null && numeric > filters.margenMax) return false;
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
