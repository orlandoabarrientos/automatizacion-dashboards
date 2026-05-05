"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCharts } from "@/lib/dashboard/types";

export default function HeatmapTable({ data }: { data: DashboardCharts["cityVsChannel"] }) {
    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Ciudad vs Canal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center text-sm text-(--muted-foreground)">Sin datos de ciudad/canal</div>
                </CardContent>
            </Card>
        );
    }

    const cities = Array.from(new Set(data.map((d) => d.ciudad))).sort();
    const channels = Array.from(new Set(data.map((d) => d.canal))).sort();
    const map = new Map<string, number>();
    let maxVal = 0;
    for (const d of data) {
        const key = `${d.ciudad}|||${d.canal}`;
        map.set(key, d.count);
        if (d.count > maxVal) maxVal = d.count;
    }

    const intensity = (count: number) => {
        if (maxVal === 0) return "bg-(--muted)";
        const ratio = count / maxVal;
        if (ratio > 0.75) return "bg-teal-700 text-white";
        if (ratio > 0.5) return "bg-teal-600 text-white";
        if (ratio > 0.25) return "bg-teal-400 text-white";
        if (ratio > 0) return "bg-teal-200 text-teal-900";
        return "bg-(--muted) text-(--muted-foreground)";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Ciudad vs Canal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-(--panel) p-2 text-left font-medium text-(--muted-foreground)">Ciudad \ Canal</th>
                                {channels.map((ch) => (
                                    <th key={ch} className="p-2 text-left font-medium text-(--muted-foreground)">{ch}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cities.map((city) => (
                                <tr key={city}>
                                    <td className="sticky left-0 bg-(--panel) p-2 font-medium text-(--foreground)">{city}</td>
                                    {channels.map((ch) => {
                                        const count = map.get(`${city}|||${ch}`) ?? 0;
                                        return (
                                            <td key={ch} className={`p-2 text-center transition ${intensity(count)}`}>
                                                {count > 0 ? count : "—"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
