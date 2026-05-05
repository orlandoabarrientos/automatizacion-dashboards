"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KpiItem } from "@/lib/dashboard/types";

const statusColors: Record<KpiItem["status"], string> = {
    good: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    neutral: "bg-(--muted) text-(--foreground)",
};

const statusBorder: Record<KpiItem["status"], string> = {
    good: "border-emerald-500/20",
    warning: "border-amber-500/20",
    danger: "border-rose-500/20",
    neutral: "border-(--border)",
};

export function KpiCard({ kpi }: { kpi: KpiItem }) {
    return (
        <Card className={`${statusBorder[kpi.status]} transition hover:shadow-md`}>
            <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                    <Badge tone={kpi.status === "good" ? "success" : kpi.status === "warning" ? "warning" : kpi.status === "danger" ? "danger" : "neutral"} className="text-[10px] uppercase tracking-wider">
                        {kpi.category}
                    </Badge>
                    {kpi.trend !== null && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${kpi.trend >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                            {kpi.trend > 0 ? <TrendingUp className="h-3 w-3" /> : kpi.trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {kpi.trendLabel}
                        </span>
                    )}
                </div>
                <p className="text-sm font-medium text-(--muted-foreground)">{kpi.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-(--foreground)">{kpi.formattedValue}</p>
                <p className="mt-2 text-xs text-(--muted-foreground) leading-relaxed">{kpi.description}</p>
            </CardContent>
        </Card>
    );
}

export function KpiGrid({ kpis }: { kpis: KpiItem[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
            ))}
        </div>
    );
}
