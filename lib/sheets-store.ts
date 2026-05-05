import type { ParsedRow } from "@/lib/dashboard/types";

type LogEntry = {
    event: string;
    status: "success" | "error" | "info";
    message: string;
    createdAt: string;
};

type StoreState = {
    rows: ParsedRow[];
    columns: string[];
    logs: LogEntry[];
    lastSync: string | null;
};

let state: StoreState = {
    rows: [],
    columns: [],
    logs: [],
    lastSync: null,
};

export function setRows(rows: ParsedRow[], updatedAt: string) {
    const cols = rows.length > 0 ? Object.keys(rows[0]) : state.columns;
    state = {
        rows,
        columns: cols,
        logs: state.logs,
        lastSync: updatedAt,
    };
}

export function upsertRow(row: ParsedRow, updatedAt: string) {
    const idKey = Object.keys(row).find((k) => /^id$/i.test(k));
    const idValue = idKey ? row[idKey] : null;

    let rows = [...state.rows];
    if (idValue !== null && idValue !== undefined) {
        const idx = rows.findIndex((r) => {
            const rk = Object.keys(r).find((k) => /^id$/i.test(k));
            return rk && r[rk] === idValue;
        });
        if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...row };
        } else {
            rows.push(row);
        }
    } else {
        rows.push(row);
    }

    const cols = rows.length > 0 ? Object.keys(rows[0]) : state.columns;
    state = {
        rows,
        columns: cols,
        logs: state.logs,
        lastSync: updatedAt,
    };
}

export function addLog(log: LogEntry) {
    state.logs.unshift(log);
    if (state.logs.length > 100) {
        state.logs = state.logs.slice(0, 100);
    }
}

export function getState(): Readonly<StoreState> {
    return state;
}
