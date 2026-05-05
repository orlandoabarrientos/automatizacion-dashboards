import type { ParsedRow, ChartPoint, RankingItem } from "@/lib/dashboard/types";
import { extractNumericValue } from "./formatting";

type AggType = "sum" | "count" | "avg";

export function groupByField(rows: ParsedRow[], field: string | null): Record<string, number> {
    if (!field) return {};
    const map: Record<string, number> = {};
    for (const row of rows) {
        const key = String(row[field] ?? "Sin dato").trim() || "Sin dato";
        map[key] = (map[key] ?? 0) + 1;
    }
    return map;
}

export function groupAndAgg(
    rows: ParsedRow[],
    groupField: string | null,
    valueField: string | null,
    agg: AggType
): ChartPoint[] {
    if (!groupField || !valueField) return [];
    const map: Record<string, { sum: number; count: number }> = {};

    for (const row of rows) {
        const key = String(row[groupField] ?? "Sin dato").trim() || "Sin dato";
        const raw = row[valueField];
        const numeric = extractNumericValue(raw);
        if (!map[key]) map[key] = { sum: 0, count: 0 };
        if (numeric !== null) {
            map[key].sum += numeric;
            map[key].count += 1;
        }
    }

    const result = Object.entries(map).map(([name, { sum, count }]) => {
        const value = agg === "count" ? count : agg === "avg" ? (count > 0 ? sum / count : 0) : sum;
        return { name, value };
    });

    return result.sort((a, b) => b.value - a.value);
}

export function buildRanking(
    rows: ParsedRow[],
    nameField: string | null,
    valueField: string | null,
    limit = 10
): RankingItem[] {
    if (!nameField || !valueField) return [];
    const map: Record<string, { value: number; count: number }> = {};

    for (const row of rows) {
        const name = String(row[nameField] ?? "Sin dato").trim() || "Sin dato";
        const numeric = extractNumericValue(row[valueField]);
        if (!map[name]) map[name] = { value: 0, count: 0 };
        if (numeric !== null) {
            map[name].value += numeric;
            map[name].count += 1;
        }
    }

    return Object.entries(map)
        .map(([name, { value, count }]) => ({ name, value, count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}

export function buildCountRanking(
    rows: ParsedRow[],
    nameField: string | null,
    limit = 10
): RankingItem[] {
    if (!nameField) return [];
    const map: Record<string, number> = {};
    for (const row of rows) {
        const name = String(row[nameField] ?? "Sin dato").trim() || "Sin dato";
        map[name] = (map[name] ?? 0) + 1;
    }
    return Object.entries(map)
        .map(([name, count]) => ({ name, value: count, count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}

export function buildConversionRanking(
    rows: ParsedRow[],
    nameField: string | null,
    statusField: string | null,
    winStatuses: string[],
    limit = 10
): RankingItem[] {
    if (!nameField || !statusField) return [];
    const map: Record<string, { total: number; won: number }> = {};

    for (const row of rows) {
        const name = String(row[nameField] ?? "Sin dato").trim() || "Sin dato";
        const status = String(row[statusField] ?? "").trim().toLowerCase();
        if (!map[name]) map[name] = { total: 0, won: 0 };
        map[name].total += 1;
        if (winStatuses.some((ws) => status.includes(ws))) {
            map[name].won += 1;
        }
    }

    return Object.entries(map)
        .map(([name, { total, won }]) => ({
            name,
            value: total > 0 ? won / total : 0,
            count: total,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}
