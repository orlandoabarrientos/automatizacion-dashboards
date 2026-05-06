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

function BoolFilter({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-(--muted-foreground)">{label}</label>
            <Select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
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
            etapaPipeline: getFilterOptions(rows, fields.etapaPipeline),
            canal: getFilterOptions(rows, fields.canal),
            vendedor: getFilterOptions(rows, fields.vendedor),
            equipoVentas: getFilterOptions(rows, fields.equipoVentas),
            ciudad: getFilterOptions(rows, fields.ciudad),
            sucursal: getFilterOptions(rows, fields.sucursal),
            campana: getFilterOptions(rows, fields.campana),
            marca: getFilterOptions(rows, fields.marca),
            modelo: getFilterOptions(rows, fields.modelo),
            anoVehiculo: getFilterOptions(rows, fields.anoVehiculo),
            producto: getFilterOptions(rows, fields.productoCategoria),
            tipoOperacion: getFilterOptions(rows, fields.tipoOperacion),
            temperatura: getFilterOptions(rows, fields.temperaturaLead),
            prioridad: getFilterOptions(rows, fields.prioridad),
            riesgo: getFilterOptions(rows, fields.riesgoChurn),
            bancoFinanciador: getFilterOptions(rows, fields.bancoFinanciador),
        };
    }, [rows, fields]);

    const handleClear = () => {
        onChange({
            dateFrom: null,
            dateTo: null,
            mes: null,
            estado: null,
            etapaPipeline: null,
            canal: null,
            vendedor: null,
            equipoVentas: null,
            ciudad: null,
            sucursal: null,
            campana: null,
            marca: null,
            modelo: null,
            anoVehiculo: null,
            productoCategoria: null,
            tipoOperacion: null,
            temperaturaLead: null,
            prioridad: null,
            riesgoChurn: null,
            financiamiento: null,
            bancoFinanciador: null,
            testDrive: null,
            facturaEnviada: null,
            cumplimientoSla: null,
            montoMin: null,
            montoMax: null,
            margenMin: null,
            margenMax: null,
        });
    };

    const handleExport = () => {
        const csv = exportRowsToCsv(rows, columns);
        if (csv) downloadCsv(csv, `concesionario_export_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const hasFilters = Object.values(filters).some((v) => v !== null && v !== "");

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-(--accent)" />
                        <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Filtros de concesionario</CardTitle>
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
                    <FilterSelect label="Estado comercial" value={filters.estado} options={options.estado} onChange={(v) => onChange({ ...filters, estado: v })} />
                    <FilterSelect label="Etapa pipeline" value={filters.etapaPipeline} options={options.etapaPipeline} onChange={(v) => onChange({ ...filters, etapaPipeline: v })} />
                    <FilterSelect label="Canal" value={filters.canal} options={options.canal} onChange={(v) => onChange({ ...filters, canal: v })} />
                    <FilterSelect label="Asesor comercial" value={filters.vendedor} options={options.vendedor} onChange={(v) => onChange({ ...filters, vendedor: v })} />
                    <FilterSelect label="Equipo de ventas" value={filters.equipoVentas} options={options.equipoVentas} onChange={(v) => onChange({ ...filters, equipoVentas: v })} />
                    <FilterSelect label="Ciudad" value={filters.ciudad} options={options.ciudad} onChange={(v) => onChange({ ...filters, ciudad: v })} />
                    <FilterSelect label="Sucursal / showroom" value={filters.sucursal} options={options.sucursal} onChange={(v) => onChange({ ...filters, sucursal: v })} />
                    <FilterSelect label="Campaña comercial" value={filters.campana} options={options.campana} onChange={(v) => onChange({ ...filters, campana: v })} />
                    <FilterSelect label="Marca" value={filters.marca} options={options.marca} onChange={(v) => onChange({ ...filters, marca: v })} />
                    <FilterSelect label="Modelo" value={filters.modelo} options={options.modelo} onChange={(v) => onChange({ ...filters, modelo: v })} />
                    <FilterSelect label="Año vehículo" value={filters.anoVehiculo} options={options.anoVehiculo} onChange={(v) => onChange({ ...filters, anoVehiculo: v })} />
                    <FilterSelect label="Categoría vehículo" value={filters.productoCategoria} options={options.producto} onChange={(v) => onChange({ ...filters, productoCategoria: v })} />
                    <FilterSelect label="Tipo operación" value={filters.tipoOperacion} options={options.tipoOperacion} onChange={(v) => onChange({ ...filters, tipoOperacion: v })} />
                    <FilterSelect label="Temperatura lead" value={filters.temperaturaLead} options={options.temperatura} onChange={(v) => onChange({ ...filters, temperaturaLead: v })} />
                    <FilterSelect label="Prioridad" value={filters.prioridad} options={options.prioridad} onChange={(v) => onChange({ ...filters, prioridad: v })} />
                    <FilterSelect label="Riesgo churn" value={filters.riesgoChurn} options={options.riesgo} onChange={(v) => onChange({ ...filters, riesgoChurn: v })} />
                    <FilterSelect label="Banco financiador" value={filters.bancoFinanciador} options={options.bancoFinanciador} onChange={(v) => onChange({ ...filters, bancoFinanciador: v })} />
                    <BoolFilter label="Financiamiento" value={filters.financiamiento} onChange={(v) => onChange({ ...filters, financiamiento: v })} />
                    <BoolFilter label="Test drive" value={filters.testDrive} onChange={(v) => onChange({ ...filters, testDrive: v })} />
                    <BoolFilter label="Factura enviada" value={filters.facturaEnviada} onChange={(v) => onChange({ ...filters, facturaEnviada: v })} />
                    <BoolFilter label="Cumple SLA" value={filters.cumplimientoSla} onChange={(v) => onChange({ ...filters, cumplimientoSla: v })} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Monto mínimo (USD)</label>
                        <Input type="number" placeholder="0" value={filters.montoMin ?? ""} onChange={(e) => onChange({ ...filters, montoMin: e.target.value ? Number(e.target.value) : null })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Monto máximo (USD)</label>
                        <Input type="number" placeholder="Sin límite" value={filters.montoMax ?? ""} onChange={(e) => onChange({ ...filters, montoMax: e.target.value ? Number(e.target.value) : null })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Margen mínimo (USD)</label>
                        <Input type="number" placeholder="0" value={filters.margenMin ?? ""} onChange={(e) => onChange({ ...filters, margenMin: e.target.value ? Number(e.target.value) : null })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-(--muted-foreground)">Margen máximo (USD)</label>
                        <Input type="number" placeholder="Sin límite" value={filters.margenMax ?? ""} onChange={(e) => onChange({ ...filters, margenMax: e.target.value ? Number(e.target.value) : null })} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
