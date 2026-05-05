"use client";

import { useMemo } from "react";
import { Filter, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardFilters, ParsedRow } from "@/lib/dashboard/types";
import { detectAllFields } from "@/lib/dashboard/field-detection";
import { getFilterOptions } from "@/lib/dashboard/filters";
import { exportRowsToCsv, downloadCsv } from "@/lib/dashboard/export";

type Props = {
    rows: ParsedRow[];
    columns: string[];
    filters: DashboardFilters;
    onChange: (filters: DashboardFilters) => void;
};

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string | null;
    options: string[];
    onChange: (v: string | null) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-(--muted-foreground)">{label}</label>
            <Select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
                <option value="">Todos</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </Select>
        </div>
    );
}

export default function FiltersPanel({ rows, columns, filters, onChange }: Props) {
    const fields = useMemo(() => detectAllFields(columns), [columns]);

    const options = useMemo(() => {
        return {
            mes: getFilterOptions(rows, fields.mes),
            estado: getFilterOptions(rows, fields.estado),
            canal: getFilterOptions(rows, fields.canal),
            vendedor: getFilterOptions(rows, fields.vendedor),
            ciudad: getFilterOptions(rows, fields.ciudad),
            sucursal: getFilterOptions(rows, fields.sucursal),
            campana: getFilterOptions(rows, fields.campana),
            producto: getFilterOptions(rows, fields.productoCategoria),
            temperatura: getFilterOptions(rows, fields.temperaturaLead),
            prioridad: getFilterOptions(rows, fields.prioridad),
            riesgo: getFilterOptions(rows, fields.riesgoChurn),
        };
    }, [rows, fields]);

    const handleClear = () => {
        onChange({
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
    };

    const handleExport = () => {
        const csv = exportRowsToCsv(rows, columns);
        if (csv) downloadCsv(csv, `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const hasFilters = Object.values(filters).some((v) => v !== null && v !== "");

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-(--accent)" />
                        <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Filtros avanzados</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1 text-rose-600">
                                <X className="h-3.5 w-3.5" />
                                Limpiar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                            <Download className="h-3.5 w-3.5" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Desde</label>
                        <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || null })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Hasta</label>
                        <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => onChange({ ...filters, dateTo: e.target.value || null })} />
                    </div>
                    <FilterSelect label="Mes" value={filters.mes} options={options.mes} onChange={(v) => onChange({ ...filters, mes: v })} />
                    <FilterSelect label="Estado" value={filters.estado} options={options.estado} onChange={(v) => onChange({ ...filters, estado: v })} />
                    <FilterSelect label="Canal" value={filters.canal} options={options.canal} onChange={(v) => onChange({ ...filters, canal: v })} />
                    <FilterSelect label="Vendedor" value={filters.vendedor} options={options.vendedor} onChange={(v) => onChange({ ...filters, vendedor: v })} />
                    <FilterSelect label="Ciudad" value={filters.ciudad} options={options.ciudad} onChange={(v) => onChange({ ...filters, ciudad: v })} />
                    <FilterSelect label="Sucursal" value={filters.sucursal} options={options.sucursal} onChange={(v) => onChange({ ...filters, sucursal: v })} />
                    <FilterSelect label="Campaña" value={filters.campana} options={options.campana} onChange={(v) => onChange({ ...filters, campana: v })} />
                    <FilterSelect label="Producto" value={filters.productoCategoria} options={options.producto} onChange={(v) => onChange({ ...filters, productoCategoria: v })} />
                    <FilterSelect label="Temperatura lead" value={filters.temperaturaLead} options={options.temperatura} onChange={(v) => onChange({ ...filters, temperaturaLead: v })} />
                    <FilterSelect label="Prioridad" value={filters.prioridad} options={options.prioridad} onChange={(v) => onChange({ ...filters, prioridad: v })} />
                    <FilterSelect label="Riesgo churn" value={filters.riesgoChurn} options={options.riesgo} onChange={(v) => onChange({ ...filters, riesgoChurn: v })} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Factura enviada</label>
                        <Select value={filters.facturaEnviada ?? ""} onChange={(e) => onChange({ ...filters, facturaEnviada: e.target.value || null })}>
                            <option value="">Todos</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Cumple SLA</label>
                        <Select value={filters.cumplimientoSla ?? ""} onChange={(e) => onChange({ ...filters, cumplimientoSla: e.target.value || null })}>
                            <option value="">Todos</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Monto mínimo (USD)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={filters.montoMin ?? ""}
                            onChange={(e) => onChange({ ...filters, montoMin: e.target.value ? Number(e.target.value) : null })}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Monto máximo (USD)</label>
                        <Input
                            type="number"
                            placeholder="Sin límite"
                            value={filters.montoMax ?? ""}
                            onChange={(e) => onChange({ ...filters, montoMax: e.target.value ? Number(e.target.value) : null })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
