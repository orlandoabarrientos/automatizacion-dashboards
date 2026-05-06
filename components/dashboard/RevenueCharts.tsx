"use client";

import { useState, useMemo } from "react";
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
    ScatterChart,
    Scatter,
    ZAxis,
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

function MoneyProbabilityChart({ data }: { data: DashboardCharts["montosVsProbabilidad"] }) {
    const [filterEstado, setFilterEstado] = useState<string>("Todos");
    const [filterVendedor, setFilterVendedor] = useState<string>("Todos");
    const [filterCanal, setFilterCanal] = useState<string>("Todos");

    const estados = useMemo(
        () => Array.from(new Set(data.map((d) => d.estado).filter(Boolean))),
        [data]
    );
    const vendedores = useMemo(
        () => Array.from(new Set(data.map((d) => d.vendedor).filter(Boolean))),
        [data]
    );
    const canales = useMemo(
        () => Array.from(new Set(data.map((d) => d.canal).filter(Boolean))),
        [data]
    );

    const filtered = useMemo(() => {
        let out = data;
        if (filterEstado !== "Todos") out = out.filter((d) => d.estado === filterEstado);
        if (filterVendedor !== "Todos") out = out.filter((d) => d.vendedor === filterVendedor);
        if (filterCanal !== "Todos") out = out.filter((d) => d.canal === filterCanal);
        return out.slice(0, 500);
    }, [data, filterEstado, filterVendedor, filterCanal]);

    if (filtered.length === 0) {
        return <EmptyChart message="No hay datos de probabilidad vs monto." />;
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="rounded-md border border-(--border) bg-(--panel) px-2 py-1 text-xs text-(--foreground)"
                >
                    <option value="Todos">Todos los estados</option>
                    {estados.map((e) => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
                <select
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    className="rounded-md border border-(--border) bg-(--panel) px-2 py-1 text-xs text-(--foreground)"
                >
                    <option value="Todos">Todos los vendedores</option>
                    {vendedores.map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                <select
                    value={filterCanal}
                    onChange={(e) => setFilterCanal(e.target.value)}
                    className="rounded-md border border-(--border) bg-(--panel) px-2 py-1 text-xs text-(--foreground)"
                >
                    <option value="Todos">Todos los canales</option>
                    {canales.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <span className="self-center text-xs text-(--muted-foreground)">
                    {filtered.length} oportunidades
                </span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 24, bottom: 10, left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis
                        type="number"
                        dataKey="probabilidad"
                        name="Probabilidad"
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                        type="number"
                        dataKey="monto"
                        name="Monto"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        width={60}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <ZAxis range={[30, 120]} />
                    <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const item = payload[0].payload as {
                                cliente: string;
                                id: string;
                                monto: number;
                                probabilidad: number;
                                estado: string;
                                vendedor: string;
                            };
                            return (
                                <div
                                    className="rounded-xl border p-3 text-sm shadow-xl"
                                    style={{
                                        backgroundColor: "var(--panel)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    <p className="font-semibold">{item.cliente || item.id}</p>
                                    <p>Monto: {formatCurrency(item.monto)}</p>
                                    <p>Probabilidad: {item.probabilidad.toFixed(0)}%</p>
                                    <p className="text-(--muted-foreground)">Estado: {item.estado || "N/A"}</p>
                                    <p className="text-(--muted-foreground)">Vendedor: {item.vendedor || "N/A"}</p>
                                </div>
                            );
                        }}
                    />
                    <Scatter
                        name="Oportunidades"
                        data={filtered}
                        fill="var(--accent)"
                        fillOpacity={0.55}
                        stroke="none"
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function RevenueCharts({ charts }: { charts: DashboardCharts }) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Ingresos por mes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Ventas estimadas por mes</CardTitle>
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
                        <EmptyChart message="No hay suficientes datos de ventas por mes." />
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

            {/* Monto vs Probabilidad — ScatterChart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Monto vs Probabilidad de cierre</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.montosVsProbabilidad.length > 0 ? (
                        <MoneyProbabilityChart data={charts.montosVsProbabilidad} />
                    ) : (
                        <EmptyChart message="No hay datos de probabilidad vs monto." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
