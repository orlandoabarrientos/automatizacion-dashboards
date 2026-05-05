"use client";

import { Lightbulb, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveSummaryItem } from "@/lib/dashboard/types";

const toneIcons: Record<ExecutiveSummaryItem["tone"], React.ReactNode> = {
    good: <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-300" />,
    neutral: <Lightbulb className="h-4 w-4 text-(--muted-foreground)" />,
};

const toneBorder: Record<ExecutiveSummaryItem["tone"], string> = {
    good: "border-l-4 border-l-emerald-500",
    warning: "border-l-4 border-l-amber-500",
    danger: "border-l-4 border-l-rose-500",
    neutral: "border-l-4 border-l-(--muted-strong)",
};

export default function ExecutiveSummary({ items }: { items: ExecutiveSummaryItem[] }) {
    if (!items.length) return null;
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-(--accent)" />
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Reporte ejecutivo automático</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-xl bg-(--panel) p-4 ${toneBorder[item.tone]}`}>
                        <div className="mt-0.5 shrink-0">{toneIcons[item.tone]}</div>
                        <p className="text-sm leading-relaxed text-(--foreground)">{item.text}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
