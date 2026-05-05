export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type ParsedRow = Record<string, string | number | boolean | null>;

export type LogEntry = {
    event: string;
    status: "success" | "error" | "info";
    message: string;
    createdAt: string;
};

export type StatusBucket = {
    status: string;
    count: number;
};

export type DateSeriesPoint = {
    date: string;
    count: number;
};

export type AmountSeriesPoint = {
    date: string;
    amount: number;
};

export type DashboardMetrics = {
    totalRows: number;
    activeRows: number | null;
    totalAmount: number | null;
    lastSync: string | null;
    lastDate: string | null;
    statusField: string | null;
    amountField: string | null;
    dateField: string | null;
    statusBreakdown: StatusBucket[];
    byDate: DateSeriesPoint[];
    byAmountDate: AmountSeriesPoint[];
    recentLogs: number;
};

export type DashboardDataResponse = {
    ok: boolean;
    rows: ParsedRow[];
    columns: string[];
    metrics: DashboardMetrics;
    charts: {
        byStatus: StatusBucket[];
        byDate: DateSeriesPoint[];
    };
    logs: LogEntry[];
    lastSync: string | null;
    lastFetchedAt: string;
};
