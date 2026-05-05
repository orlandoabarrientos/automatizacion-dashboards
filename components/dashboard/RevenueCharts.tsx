"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";
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

const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex h-[240px] items-center justify-center text-sm text-(--muted-foreground)">{message}</div>
);

export default function RevenueCharts({ charts }: { charts: DashboardCharts }) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Ingresos por mes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Ingresos por mes</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.revenueByMonth.length > 1 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={charts.revenueByMonth}>
                                <defs>
                                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                                <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#revGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No hay suficientes datos de ingresos por mes." />
                    )}
                </CardContent>
            </Card>

            {/* Tasa de conversión mensual */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Conversión mensual</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.conversionRateMonthly.length > 1 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={charts.conversionRateMonthly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={40} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatPercent(Number(v))} />
                                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No hay datos suficientes para conversión mensual." />
                    )}
                </CardContent>
            </Card>

            {/* Facturas requeridas vs enviadas */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Facturas requeridas vs enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.invoicesRequiredVsSent.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={charts.invoicesRequiredVsSent} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={40} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Bar dataKey="value" fill="var(--accent)" radius={[10, 10, 0, 0]} name="Cantidad" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No hay datos de facturas." />
                    )}
                </CardContent>
            </Card>

            {/* Monto vs Probabilidad */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Monto vs Probabilidad de cierre</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.montosVsProbabilidad.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={charts.montosVsProbabilidad.map((d, i) => ({ ...d, index: i }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="probabilidad" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} name="Probabilidad" type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(_v, _n, props) => [`${formatCurrency(Number(props?.payload?.monto ?? 0))}`, `Canal: ${String(props?.payload?.canal ?? "")}`]} />
                                <Area type="monotone" dataKey="monto" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No hay datos de probabilidad vs monto." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
