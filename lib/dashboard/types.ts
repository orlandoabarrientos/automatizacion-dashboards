export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type ParsedRow = Record<string, JsonValue>;

export type LogEntry = {
    event: string;
    status: "success" | "error" | "info";
    message: string;
    createdAt: string;
};

export type KpiStatus = "good" | "warning" | "danger" | "neutral";
export type KpiCategory = "revenue" | "sales" | "operations" | "risk" | "customer" | "pipeline";
export type DashboardStatus = "connected" | "empty" | "error";

export type KpiItem = {
    id: string;
    label: string;
    value: number | null;
    formattedValue: string;
    description: string;
    trend: number | null; // positive/negative change if comparable
    trendLabel: string | null;
    status: KpiStatus;
    category: KpiCategory;
};

export type DashboardFilters = {
    dateFrom: string | null;
    dateTo: string | null;
    mes: string | null;
    estado: string | null;
    canal: string | null;
    vendedor: string | null;
    ciudad: string | null;
    sucursal: string | null;
    campana: string | null;
    productoCategoria: string | null;
    temperaturaLead: string | null;
    prioridad: string | null;
    riesgoChurn: string | null;
    facturaEnviada: string | null; // "true" | "false" | null
    cumplimientoSla: string | null; // "true" | "false" | null
    montoMin: number | null;
    montoMax: number | null;
};

export type ChartPoint = {
    name: string;
    value: number;
    [key: string]: JsonValue;
};

export type FunnelStage = {
    stage: string;
    count: number;
    amount: number;
    conversion: number; // % vs previous stage
    percentOfTotal: number;
};

export type CohortMonth = {
    month: string;
    registros: number;
    ganadas: number;
    ingresos: number;
    conversion: number;
    margen: number;
    ticketPromedio: number;
};

export type RankingItem = {
    name: string;
    value: number;
    count: number;
};

export type StatsAmount = {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
    p25: number | null;
    p75: number | null;
    stdDev: number | null;
    sum: number | null;
    count: number;
};

export type StatsMargin = {
    avg: number | null;
    min: number | null;
    max: number | null;
    lowCount: number;
    highCount: number;
};

export type StatsTime = {
    avgResponseMin: number | null;
    minResponseMin: number | null;
    maxResponseMin: number | null;
    slaCompliancePct: number | null;
    avgDaysInPipeline: number | null;
};

export type DistributionItem = {
    label: string;
    count: number;
    percent: number;
};

export type ExecutiveSummaryItem = {
    text: string;
    tone: KpiStatus;
};

export type DashboardCharts = {
    revenueByMonth: ChartPoint[];
    statusDistribution: ChartPoint[];
    revenueByChannel: ChartPoint[];
    sellerRanking: ChartPoint[];
    pipelineFunnel: FunnelStage[];
    leadTemperature: ChartPoint[];
    riskDistribution: ChartPoint[];
    conversionRateMonthly: ChartPoint[];
    invoicesRequiredVsSent: ChartPoint[];
    montosVsProbabilidad: Array<{
        id: string;
        cliente: string;
        monto: number;
        probabilidad: number;
        estado: string;
        vendedor: string;
        canal: string;
    }>;
    cityVsChannel: Array<{ ciudad: string; canal: string; count: number }>;
    campaignRanking: RankingItem[];
};

export type DashboardStatistics = {
    amounts: StatsAmount;
    margin: StatsMargin;
    time: StatsTime;
    distributions: Record<string, DistributionItem[]>;
    rankings: {
        topSellersByRevenue: RankingItem[];
        topSellersByConversion: RankingItem[];
        topChannelsByRevenue: RankingItem[];
        topCitiesByRevenue: RankingItem[];
        topCampaignsByRevenue: RankingItem[];
        topProductsByRevenue: RankingItem[];
        topClientsByAmount: RankingItem[];
    };
    funnel: FunnelStage[];
    monthlyCohorts: CohortMonth[];
};

export type DashboardDataResponse = {
    ok: boolean;
    rows: ParsedRow[];
    columns: string[];
    metrics: {
        totalRows: number;
        conversionRate: number | null;
        totalRevenue: number | null;
        averageTicket: number | null;
    };
    kpis: KpiItem[];
    statistics: DashboardStatistics;
    charts: DashboardCharts;
    executiveSummary: ExecutiveSummaryItem[];
    logs: LogEntry[];
    lastSync: string | null;
    hash: string | null;
    lastFetchedAt: string;
    message?: string;
    diagnostics?: {
        totalRows: number;
        invoicesRequiredVsSentCount: number;
        montosVsProbabilidadCount: number;
        riskDistributionCount: number;
        pipelineFunnelCount: number;
        sampleRow: ParsedRow | undefined;
    };
};

export type SyncPayload = {
    event: string;
    source: string;
    sheetName: string;
    totalRows: number;
    totalColumns: number;
    columns: string[];
    rows: ParsedRow[];
    updatedAt: string;
    hash: string;
    datasetType: string;
};
