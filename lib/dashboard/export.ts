import type { ParsedRow } from "@/lib/dashboard/types";
import { sanitizeText } from "./formatting";

export function exportRowsToCsv(rows: ParsedRow[], columns: string[]): string {
    if (!rows.length || !columns.length) return "";
    const escape = (str: string) => {
        const s = sanitizeText(str, 5000);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    const lines: string[] = [columns.map(escape).join(",")];
    for (const row of rows) {
        lines.push(columns.map((col) => escape(String(row[col] ?? ""))).join(","));
    }
    return lines.join("\n");
}

export function downloadCsv(csv: string, filename: string) {
    if (typeof window === "undefined") return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
