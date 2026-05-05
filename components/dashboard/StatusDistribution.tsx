"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCharts } from "@/lib/dashboard/types";

const tooltipStyle = {
    backgroundColor: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
};

const COLORS = ["#0f766e", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#64748b"];

const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex h-[240px] items-center justify-center text-sm text-(--muted-foreground)">{message}</div>
);

export default function StatusDistribution({ charts }: { charts: DashboardCharts }) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Estados */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Distribución por estado</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={charts.statusDistribution.slice(0, 8)} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={32} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Sin datos de estado." />
                    )}
                </CardContent>
            </Card>

            {/* Temperatura Lead */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Temperatura de lead</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.leadTemperature.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={charts.leadTemperature} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                    {charts.leadTemperature.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend verticalAlign="bottom" height={24} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Sin datos de temperatura." />
                    )}
                </CardContent>
            </Card>

            {/* Riesgo Churn */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Riesgo de churn</CardTitle>
                </CardHeader>
                <CardContent>
                    {charts.riskDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={charts.riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                    {charts.riskDistribution.map((_, index) => (
                                        <Cell key={`cell-risk-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend verticalAlign="bottom" height={24} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Sin datos de riesgo." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
