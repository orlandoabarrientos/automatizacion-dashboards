"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardStatistics } from "@/lib/dashboard/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/dashboard/formatting";

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-(--border) bg-(--background) px-4 py-3">
            <p className="text-xs text-(--muted-foreground)">{label}</p>
            <p className="mt-1 text-sm font-semibold text-(--foreground)">{value}</p>
        </div>
    );
}

export default function StatisticalReport({ stats }: { stats: DashboardStatistics }) {
    return (
        <div className="space-y-6">
            {/* Estadísticas de montos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Estadísticas de montos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatBox label="Mínimo" value={formatCurrency(stats.amounts.min)} />
                        <StatBox label="Máximo" value={formatCurrency(stats.amounts.max)} />
                        <StatBox label="Promedio" value={formatCurrency(stats.amounts.avg)} />
                        <StatBox label="Mediana" value={formatCurrency(stats.amounts.median)} />
                        <StatBox label="P25" value={formatCurrency(stats.amounts.p25)} />
                        <StatBox label="P75" value={formatCurrency(stats.amounts.p75)} />
                        <StatBox label="Desv. estándar" value={formatCurrency(stats.amounts.stdDev)} />
                        <StatBox label="Suma total" value={formatCurrency(stats.amounts.sum)} />
                        <StatBox label="Cantidad" value={formatNumber(stats.amounts.count)} />
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas de margen */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Estadísticas de margen</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatBox label="Margen promedio" value={formatCurrency(stats.margin.avg)} />
                        <StatBox label="Margen mínimo" value={formatCurrency(stats.margin.min)} />
                        <StatBox label="Margen máximo" value={formatCurrency(stats.margin.max)} />
                        <StatBox label="Margen bajo" value={formatNumber(stats.margin.lowCount)} />
                        <StatBox label="Margen alto" value={formatNumber(stats.margin.highCount)} />
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas de tiempo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Estadísticas de tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatBox label="Tiempo resp. promedio" value={`${formatNumber(stats.time.avgResponseMin)} min`} />
                        <StatBox label="Menor tiempo" value={`${formatNumber(stats.time.minResponseMin)} min`} />
                        <StatBox label="Mayor tiempo" value={`${formatNumber(stats.time.maxResponseMin)} min`} />
                        <StatBox label="Dentro SLA" value={formatPercent(stats.time.slaCompliancePct)} />
                        <StatBox label="Días promedio pipeline" value={`${formatNumber(stats.time.avgDaysInPipeline)} días`} />
                    </div>
                </CardContent>
            </Card>

            {/* Distribuciones */}
            {Object.entries(stats.distributions).map(([key, items]) =>
                items.length > 0 ? (
                    <Card key={key}>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Distribución: {key}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[240px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.label}>
                                                <TableCell>{item.label}</TableCell>
                                                <TableCell className="text-right">{item.count}</TableCell>
                                                <TableCell className="text-right">{formatPercent(item.percent)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : null
            )}

            {/* Cohortes mensuales */}
            {stats.monthlyCohorts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Cohortes por mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mes</TableHead>
                                        <TableHead className="text-right">Registros</TableHead>
                                        <TableHead className="text-right">Ganadas</TableHead>
                                        <TableHead className="text-right">Ingresos</TableHead>
                                        <TableHead className="text-right">Conversión</TableHead>
                                        <TableHead className="text-right">Margen</TableHead>
                                        <TableHead className="text-right">Ticket promedio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.monthlyCohorts.map((c) => (
                                        <TableRow key={c.month}>
                                            <TableCell className="font-medium">{c.month}</TableCell>
                                            <TableCell className="text-right">{c.registros}</TableCell>
                                            <TableCell className="text-right">{c.ganadas}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(c.ingresos)}</TableCell>
                                            <TableCell className="text-right">{formatPercent(c.conversion)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(c.margen)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(c.ticketPromedio)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
