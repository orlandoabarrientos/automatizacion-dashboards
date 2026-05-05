"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { extractNumericValue, sanitizeText } from "@/lib/dashboard/formatting";
import type { ParsedRow } from "@/lib/dashboard/types";
import JsonViewerModal from "./JsonViewerModal";

const getCellValue = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return sanitizeText(value, 80) || "-";
    }
    return sanitizeText(JSON.stringify(value), 80) || "-";
};

type DataTableProps = {
    rows: ParsedRow[];
    columns: string[];
};

type SortDirection = "asc" | "desc";

type SortState = {
    field: string;
    direction: SortDirection;
};

export default function DataTable({ rows, columns }: DataTableProps) {
    const [search, setSearch] = useState("");
    const [filterField, setFilterField] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [sortState, setSortState] = useState<SortState>({
        field: columns[0] || "",
        direction: "asc",
    });
    const [selectedRow, setSelectedRow] = useState<ParsedRow | null>(null);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filterKey = filterField.trim();
        const filterQuery = filterValue.trim().toLowerCase();

        return rows
            .filter((row) => {
                if (query) {
                    const haystack = Object.values(row)
                        .map((v) => String(v ?? ""))
                        .join(" ")
                        .toLowerCase();
                    if (!haystack.includes(query)) return false;
                }
                if (filterKey && filterQuery) {
                    const textValue = String(row[filterKey] ?? "").toLowerCase();
                    if (!textValue.includes(filterQuery)) return false;
                }
                return true;
            })
            .sort((a, b) => {
                const direction = sortState.direction === "asc" ? 1 : -1;
                const field = sortState.field;

                const getValue = (row: ParsedRow) => {
                    const raw = row[field];
                    const numeric = extractNumericValue(raw);
                    if (numeric !== null) return numeric;
                    return String(raw ?? "").toLowerCase();
                };

                const valueA = getValue(a);
                const valueB = getValue(b);

                if (typeof valueA === "number" && typeof valueB === "number") {
                    return (valueA - valueB) * direction;
                }
                return String(valueA).localeCompare(String(valueB)) * direction;
            });
    }, [rows, search, filterField, filterValue, sortState]);

    const toggleSort = (field: string) => {
        setSortState((prev) => {
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }
            return { field, direction: "asc" };
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl border border-(--border) bg-(--panel) p-4 md:grid-cols-[2fr_1fr_1fr]">
                <Input
                    placeholder="Buscar por cualquier campo..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <Select value={filterField} onChange={(event) => setFilterField(event.target.value)}>
                    <option value="">Filtrar por columna</option>
                    {columns.map((column) => (
                        <option key={column} value={column}>
                            {column}
                        </option>
                    ))}
                </Select>
                <Input
                    placeholder="Valor del filtro"
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                />
            </div>

            <div className="rounded-3xl border border-(--border) bg-(--panel) overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-(--border) px-4 py-3 text-sm text-(--muted-foreground) md:flex-row md:items-center md:justify-between">
                    <p>
                        Mostrando <span className="text-(--foreground)">{filteredRows.length}</span> de {rows.length}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">Orden: {sortState.field || "-"}</Badge>
                        <Badge tone="neutral">{sortState.direction === "asc" ? "Asc" : "Desc"}</Badge>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead
                                        key={column}
                                        className="cursor-pointer whitespace-nowrap"
                                        onClick={() => toggleSort(column)}
                                    >
                                        {column}
                                    </TableHead>
                                ))}
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="py-10 text-center text-sm text-(--muted-foreground)">
                                        No hay resultados para mostrar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell key={`${index}-${column}`} className="whitespace-nowrap">
                                                {getCellValue(row[column])}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedRow(row)}>
                                                Ver JSON
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <JsonViewerModal open={Boolean(selectedRow)} row={selectedRow} onClose={() => setSelectedRow(null)} />
        </div>
    );
}
