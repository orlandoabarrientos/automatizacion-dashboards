"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/dashboard/types";

const tooltipStyle = {
    backgroundColor: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
};

const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex h-[240px] items-center justify-center text-sm text-(--muted-foreground)">
        {message}
    </div>
);

type DashboardChartsProps = {
    charts: {
        byStatus: { status: string; count: number }[];
        byDate: { date: string; count: number }[];
    };
    metrics: DashboardMetrics;
};

export default function DashboardCharts({ charts, metrics }: DashboardChartsProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">
                        Distribución por estado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.byStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={charts.byStatus} barSize={28}>
                                <XAxis
                                    dataKey="status"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                    width={32}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="count" fill="var(--accent)" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Aún no hay estados suficientes para graficar." />
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">
                        Registros por fecha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.byDate.length > 1 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={charts.byDate}>
                                <defs>
                                    <linearGradient id="dateGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                    width={32}
                                />
                                <Tooltip
                                    cursor={{ stroke: "var(--border)" }}
                                    contentStyle={tooltipStyle}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--accent)"
                                    fill="url(#dateGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Aún no hay suficientes datos para la línea de tiempo." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
