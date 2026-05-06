"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, Columns, ArrowUpDown, ArrowUp, ArrowDown, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ParsedRow } from "@/lib/dashboard/types";
import { extractNumericValue, formatCurrency, formatDate, formatPercent, sanitizeText } from "@/lib/dashboard/formatting";
import { detectAllFields } from "@/lib/dashboard/field-detection";

function detectColumnType(column: string): "date" | "currency" | "percent" | "number" | "text" {
    const lower = column.toLowerCase();
    if (lower.includes("fecha") || lower.includes("date") || lower.includes("sync")) return "date";
    if (lower.includes("monto") || lower.includes("amount") || lower.includes("usd") || lower.includes("bs") || lower.includes("precio") || lower.includes("costo") || lower.includes("margen_usd")) return "currency";
    if (lower.includes("pct") || lower.includes("percent") || lower.includes("probabilidad") || lower.includes("conversion") || lower.includes("tasa")) return "percent";
    if (lower.includes("num") || lower.includes("count") || lower.includes("cantidad") || lower.includes("dias") || lower.includes("llamadas") || lower.includes("mensajes") || lower.includes("tiempo")) return "number";
    return "text";
}

function getBadgeTone(column: string, value: unknown): "success" | "warning" | "danger" | "neutral" | "info" {
    const str = String(value ?? "").trim().toLowerCase();
    const lowerCol = column.toLowerCase();

    if (lowerCol.includes("estado")) {
        if (["ganado", "win", "won", "completado", "paid", "pagado", "facturado"].some((k) => str.includes(k))) return "success";
        if (["perdido", "lost", "cancelado", "rechazado"].some((k) => str.includes(k))) return "danger";
        if (["abierto", "open", "en proceso", "proceso", "pendiente", "nuevo"].some((k) => str.includes(k))) return "info";
        return "neutral";
    }

    if (lowerCol.includes("prioridad")) {
        if (["alta", "high", "critica", "urgente"].some((k) => str.includes(k))) return "danger";
        if (["media", "medium", "normal"].some((k) => str.includes(k))) return "warning";
        if (["baja", "low"].some((k) => str.includes(k))) return "success";
        return "neutral";
    }

    if (lowerCol.includes("riesgo") || lowerCol.includes("risk")) {
        if (["alto", "high", "critico"].some((k) => str.includes(k))) return "danger";
        if (["medio", "medium", "moderado"].some((k) => str.includes(k))) return "warning";
        if (["bajo", "low", "minimo"].some((k) => str.includes(k))) return "success";
        return "neutral";
    }

    if (lowerCol.includes("sla") || lowerCol.includes("cumplimiento")) {
        if (["true", "1", "si", "yes", "completo", "cumple"].some((k) => str.includes(k))) return "success";
        if (["false", "0", "no", "incumple"].some((k) => str.includes(k))) return "danger";
        return "neutral";
    }

    if (lowerCol.includes("temperatura") || lowerCol.includes("temp")) {
        if (["caliente", "hot", "alta"].some((k) => str.includes(k))) return "danger";
        if (["tibio", "warm", "media"].some((k) => str.includes(k))) return "warning";
        if (["frio", "cold", "baja"].some((k) => str.includes(k))) return "info";
        return "neutral";
    }

    return "neutral";
}

function formatCell(column: string, value: unknown): string {
    const type = detectColumnType(column);
    if (value === null || value === undefined) return "—";
    if (type === "currency") {
        const num = extractNumericValue(value);
        return num !== null ? formatCurrency(num) : String(value);
    }
    if (type === "percent") {
        const num = extractNumericValue(value);
        if (num !== null) {
            return formatPercent(num > 1 ? num / 100 : num);
        }
        return String(value);
    }
    if (type === "date") {
        return formatDate(String(value));
    }
    if (type === "number") {
        const num = extractNumericValue(value);
        return num !== null ? num.toLocaleString("es-ES", { maximumFractionDigits: 2 }) : String(value);
    }
    return sanitizeText(String(value), 80) || "—";
}

type DataTableProps = {
    rows: ParsedRow[];
    columns: string[];
};

export default function DataTable({ rows, columns }: DataTableProps) {
    const [globalSearch, setGlobalSearch] = useState("");
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.slice(0, 12));
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [selectedRow, setSelectedRow] = useState<ParsedRow | null>(null);

    // Reset page when rows change significantly
    // But we won't use effect to avoid loops; user can reset manually or we accept staying on same page

    const fields = useMemo(() => detectAllFields(columns), [columns]);

    const filteredRows = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();
        let data = rows;
        if (query) {
            data = data.filter((row) =>
                Object.values(row)
                    .map((v) => String(v ?? ""))
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            );
        }
        if (sortField) {
            data = [...data].sort((a, b) => {
                const dir = sortDir === "asc" ? 1 : -1;
                const type = detectColumnType(sortField);
                let valA = a[sortField];
                let valB = b[sortField];

                if (type === "number" || type === "currency" || type === "percent") {
                    const numA = extractNumericValue(valA);
                    const numB = extractNumericValue(valB);
                    if (numA !== null && numB !== null) return (numA - numB) * dir;
                    if (numA !== null) return -1 * dir;
                    if (numB !== null) return 1 * dir;
                }
                return String(valA ?? "").localeCompare(String(valB ?? "")) * dir;
            });
        }
        return data;
    }, [rows, globalSearch, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, totalPages - 1);
    const paginatedRows = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const toggleColumn = (col: string) => {
        setVisibleColumns((prev) => {
            if (prev.includes(col)) return prev.filter((c) => c !== col);
            return [...prev, col];
        });
    };

    const handleSort = (col: string) => {
        if (sortField === col) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(col);
            setSortDir("asc");
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-(--border) bg-(--panel) p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar en todas las columnas..."
                        value={globalSearch}
                        onChange={(e) => {
                            setGlobalSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowColumnSelector((s) => !s)} className="gap-1">
                        <Columns className="h-3.5 w-3.5" />
                        Columnas
                    </Button>
                    <span className="text-xs text-(--muted-foreground)">
                        Mostrando {filteredRows.length.toLocaleString("es-ES")} de {rows.length.toLocaleString("es-ES")}
                    </span>
                </div>
            </div>

            {/* Column selector */}
            {showColumnSelector && (
                <div className="rounded-2xl border border-(--border) bg-(--panel) p-4">
                    <p className="mb-2 text-xs font-medium text-(--muted-foreground)">Seleccionar columnas visibles</p>
                    <div className="flex flex-wrap gap-2">
                        {columns.map((col) => {
                            const active = visibleColumns.includes(col);
                            return (
                                <button
                                    key={col}
                                    type="button"
                                    onClick={() => toggleColumn(col)}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${
                                        active
                                            ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                                            : "border-(--border) bg-(--background) text-(--muted-foreground)"
                                    }`}
                                >
                                    {active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                    {col}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-3xl border border-(--border) bg-(--panel) overflow-hidden">
                <ScrollArea className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.map((col) => (
                                    <TableHead key={col} className="cursor-pointer whitespace-nowrap" onClick={() => handleSort(col)}>
                                        <div className="flex items-center gap-1">
                                            {col}
                                            {sortField === col ? (
                                                sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 opacity-30" />
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-20">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={visibleColumns.length + 1} className="py-12 text-center text-sm text-(--muted-foreground)">
                                        No hay resultados para mostrar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-(--muted)/50">
                                        {visibleColumns.map((col) => {
                                            const val = row[col];
                                            const tone = getBadgeTone(col, val);
                                            const isBadgeCol =
                                                col.toLowerCase().includes("estado") ||
                                                col.toLowerCase().includes("prioridad") ||
                                                col.toLowerCase().includes("riesgo") ||
                                                col.toLowerCase().includes("sla") ||
                                                col.toLowerCase().includes("temperatura") ||
                                                col.toLowerCase().includes("cumplimiento");
                                            return (
                                                <TableCell key={col} className="whitespace-nowrap text-sm">
                                                    {isBadgeCol ? (
                                                        <Badge tone={tone === "info" ? "neutral" : tone}>{formatCell(col, val)}</Badge>
                                                    ) : (
                                                        formatCell(col, val)
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedRow(row)} className="gap-1 px-2">
                                                <FileJson className="h-3.5 w-3.5" />
                                                <span className="sr-only">Ver</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-(--border) px-4 py-3 sm:flex-row">
                    <div className="flex items-center gap-2 text-xs text-(--muted-foreground)">
                        <span>Página {currentPage + 1} de {totalPages}</span>
                        <span>|</span>
                        <SelectPageSize value={pageSize} onChange={(v) => { setPageSize(v); setPage(0); }} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedRow} onClose={() => setSelectedRow(null)}>
                <DialogHeader>
                    <DialogTitle>Detalle de oportunidad</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    {selectedRow && <DealershipDetail row={selectedRow} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DealershipDetail({ row }: { row: ParsedRow }) {
    const sections: { title: string; fields: string[] }[] = [
        {
            title: "Cliente",
            fields: ["cliente_nombre", "cliente_id", "tipo_cliente", "segmento", "ciudad", "estado_region"],
        },
        {
            title: "Vehículo / operación",
            fields: ["producto_categoria", "marca", "modelo", "año_vehiculo", "tipo_operacion", "cantidad"],
        },
        {
            title: "Comercial",
            fields: ["vendedor", "equipo_ventas", "sucursal", "canal", "campaña", "etapa_pipeline", "estado", "prioridad", "temperatura_lead", "probabilidad_cierre", "dias_en_pipeline"],
        },
        {
            title: "Financiero",
            fields: ["precio_lista_usd", "descuento_usd", "monto", "costo_estimado_usd", "margen_usd", "margen_pct", "monto_bs", "tasa_usdt", "metodo_pago", "financiamiento", "banco_financiador"],
        },
        {
            title: "Operación",
            fields: ["test_drive", "factura_requerida", "factura_enviada", "cumplimiento_sla", "tiempo_respuesta_min", "llamadas_realizadas", "mensajes_enviados"],
        },
        {
            title: "Postventa / seguimiento",
            fields: ["satisfaccion_cliente", "riesgo_churn", "responsable_postventa", "proxima_accion", "observaciones"],
        },
    ];

    return (
        <div className="space-y-4">
            {sections.map((section) => {
                const entries: [string, unknown][] = section.fields
                    .map((f): [string, unknown] => [f, row[f]])
                    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
                if (entries.length === 0) return null;
                return (
                    <div key={section.title}>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--accent)">{section.title}</h4>
                        <div className="space-y-1.5">
                            {entries.map(([key, value]) => (
                                <div key={key} className="flex justify-between gap-4 rounded-lg border border-(--border) px-3 py-2">
                                    <span className="text-xs font-medium text-(--muted-foreground)">{key}</span>
                                    <span className="text-right text-sm text-(--foreground)">{formatCell(key, value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SelectPageSize({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="rounded-md border border-(--border) bg-(--background) px-2 py-1 text-xs text-(--foreground) outline-none"
        >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
        </select>
    );
}
