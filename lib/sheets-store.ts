import type { ParsedRow, LogEntry } from "@/lib/dashboard/types";

type StoreState = {
    rows: ParsedRow[];
    columns: string[];
    logs: LogEntry[];
    lastSync: string | null;
    hash: string | null;
    totalRows: number;
    totalColumns: number;
    sheetName: string | null;
    datasetType: string | null;
    source: string | null;
};

let state: StoreState = {
    rows: [],
    columns: [],
    logs: [],
    lastSync: null,
    hash: null,
    totalRows: 0,
    totalColumns: 0,
    sheetName: null,
    datasetType: null,
    source: null,
};

export function setDataset(payload: {
    rows: ParsedRow[];
    columns: string[];
    updatedAt: string;
    hash: string;
    totalRows: number;
    totalColumns: number;
    sheetName: string;
    datasetType: string;
    source: string;
}) {
    state = {
        rows: payload.rows,
        columns: payload.columns,
        logs: state.logs,
        lastSync: payload.updatedAt,
        hash: payload.hash,
        totalRows: payload.totalRows,
        totalColumns: payload.totalColumns,
        sheetName: payload.sheetName,
        datasetType: payload.datasetType,
        source: payload.source,
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

    state = {
        ...state,
        rows,
        lastSync: updatedAt,
    };
}

export function addLog(log: LogEntry) {
    state.logs.unshift(log);
    if (state.logs.length > 200) {
        state.logs = state.logs.slice(0, 200);
    }
}

export function clearDataset() {
    state = {
        rows: [],
        columns: [],
        logs: state.logs,
        lastSync: null,
        hash: null,
        totalRows: 0,
        totalColumns: 0,
        sheetName: null,
        datasetType: null,
        source: null,
    };
}

export function getState(): Readonly<StoreState> {
    return state;
}

export function getDataset() {
    return {
        rows: state.rows,
        columns: state.columns,
        lastSync: state.lastSync,
        hash: state.hash,
        totalRows: state.totalRows,
        totalColumns: state.totalColumns,
        sheetName: state.sheetName,
        datasetType: state.datasetType,
        source: state.source,
    };
}

export function getRows(): Readonly<ParsedRow[]> {
    return state.rows;
}

export function getColumns(): Readonly<string[]> {
    return state.columns;
}

export function getLastSync(): string | null {
    return state.lastSync;
}

export function getLogs(): Readonly<LogEntry[]> {
    return state.logs;
}
