"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardStatistics } from "@/lib/dashboard/types";
import { formatCurrency, formatPercent } from "@/lib/dashboard/formatting";

const tooltipStyle = {
    backgroundColor: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
};

const COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1", "#f0fdfa"];

function RankingBar({ data, title, format }: { data: { name: string; value: number; count: number }[]; title: string; format: "currency" | "percent" | "number" }) {
    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center text-sm text-(--muted-foreground)">Sin datos</div>
                </CardContent>
            </Card>
        );
    }
    const formatter = (v: number) => {
        if (format === "currency") return formatCurrency(v);
        if (format === "percent") return formatPercent(v);
        return v.toLocaleString("es-ES");
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.slice(0, 7)} layout="vertical" barSize={20} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => (format === "currency" ? `$${(v / 1000).toFixed(0)}k` : String(v))} />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} width={100} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatter(Number(v)), title]} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {data.slice(0, 7).map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function RankingTable({ data, title, format }: { data: { name: string; value: number; count: number }[]; title: string; format: "currency" | "percent" | "number" }) {
    if (!data.length) return null;
    const formatter = (v: number) => {
        if (format === "currency") return formatCurrency(v);
        if (format === "percent") return formatPercent(v);
        return v.toLocaleString("es-ES");
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[300px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(0, 10).map((item, i) => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium text-(--muted-foreground)">{i + 1}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{formatter(item.value)}</TableCell>
                                    <TableCell className="text-right text-(--muted-foreground)">{item.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RankingTables({ stats }: { stats: DashboardStatistics }) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <RankingBar data={stats.rankings.topSellersByRevenue} title="Top vendedores por ingresos" format="currency" />
            <RankingTable data={stats.rankings.topSellersByConversion} title="Top vendedores por conversión" format="percent" />
            <RankingBar data={stats.rankings.topChannelsByRevenue} title="Top canales por ingresos" format="currency" />
            <RankingBar data={stats.rankings.topCitiesByRevenue} title="Top ciudades por ingresos" format="currency" />
            <RankingTable data={stats.rankings.topCampaignsByRevenue} title="Top campañas por ingresos" format="currency" />
            <RankingTable data={stats.rankings.topProductsByRevenue} title="Top productos por ingresos" format="currency" />
            <RankingTable data={stats.rankings.topClientsByAmount} title="Top clientes por monto" format="currency" />
        </div>
    );
}
