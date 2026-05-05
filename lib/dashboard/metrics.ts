import { detectAmountField, detectDateField, detectStatusField } from "./field-detection";
import { extractNumericValue, sanitizeText } from "./formatting";
import type { DashboardMetrics, ParsedRow } from "./types";

const ACTIVE_STATUSES = new Set(["activo", "activa", "active", "enabled", "completado", "completed", "pagado", "paid", "confirmado", "confirmed"]);

const toDateKey = (value: unknown) => {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (!str) return null;
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
};

export const buildDashboardMetrics = (
    rows: ParsedRow[],
    columns: string[],
    logCount: number
): DashboardMetrics => {
    const statusField = detectStatusField(columns);
    const amountField = detectAmountField(columns);
    const dateField = detectDateField(columns);

    const statusCounts: Record<string, number> = {};
    const dateSeriesMap: Record<string, number> = {};
    const amountDateMap: Record<string, number> = {};

    let activeRows = 0;
    let totalAmount = 0;
    let amountCount = 0;
    let lastSync: string | null = null;
    let lastDate: string | null = null;

    for (const row of rows) {
        if (statusField) {
            const rawStatus = row[statusField];
            const statusLabel = sanitizeText(rawStatus ?? "Sin estado", 80) || "Sin estado";
            statusCounts[statusLabel] = (statusCounts[statusLabel] ?? 0) + 1;
            const normalized = statusLabel.trim().toLowerCase();
            if (ACTIVE_STATUSES.has(normalized)) {
                activeRows += 1;
            }
        }

        if (amountField) {
            const rawAmount = row[amountField];
            const numericAmount = extractNumericValue(rawAmount);
            if (numericAmount !== null) {
                totalAmount += numericAmount;
                amountCount += 1;
            }
        }

        const rowDate = dateField ? toDateKey(row[dateField]) : null;
        if (rowDate) {
            dateSeriesMap[rowDate] = (dateSeriesMap[rowDate] ?? 0) + 1;
            if (!lastDate || rowDate > lastDate) {
                lastDate = rowDate;
            }

            if (amountField) {
                const numericAmount = extractNumericValue(row[amountField]);
                if (numericAmount !== null) {
                    amountDateMap[rowDate] = (amountDateMap[rowDate] ?? 0) + numericAmount;
                }
            }
        }
    }

    const statusBreakdown = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

    const byDate = Object.entries(dateSeriesMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));

    const byAmountDate = Object.entries(amountDateMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));

    return {
        totalRows: rows.length,
        activeRows: statusField ? activeRows : null,
        totalAmount: amountField && amountCount > 0 ? totalAmount : null,
        lastSync: lastDate,
        lastDate,
        statusField: statusField ?? null,
        amountField: amountField ?? null,
        dateField: dateField ?? null,
        statusBreakdown,
        byDate,
        byAmountDate,
        recentLogs: logCount,
    };
};
