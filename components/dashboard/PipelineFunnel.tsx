"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCharts } from "@/lib/dashboard/types";
import { formatCurrency, formatPercent } from "@/lib/dashboard/formatting";

const tooltipStyle = {
    backgroundColor: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
};

const COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1"];

const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex h-[260px] items-center justify-center text-sm text-(--muted-foreground)">{message}</div>
);

export default function PipelineFunnel({ charts }: { charts: DashboardCharts }) {
    const data = charts.pipelineFunnel;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Embudo comercial del concesionario</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data} layout="vertical" barSize={28} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                            <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} width={120} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value, name) => {
                                    if (name === "count") return [`${value} oportunidades`, "Cantidad"];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => {
                                    const item = data.find((d) => d.stage === label);
                                    if (!item) return label;
                                    return `${label} — ${formatCurrency(item.amount)} | Conversión: ${formatPercent(item.conversion)} | ${formatPercent(item.percentOfTotal)} del total`;
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart message="No hay datos de pipeline." />
                )}
            </CardContent>
        </Card>
    );
}
