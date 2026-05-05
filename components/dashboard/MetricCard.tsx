"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
    label: string;
    value: string;
    helper?: string;
};

export default function MetricCard({ label, value, helper }: MetricCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="space-y-3">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-(--muted-foreground)">
                    {label}
                </CardTitle>
                <p className="text-2xl font-semibold text-(--foreground)">{value}</p>
            </CardHeader>
            {helper ? (
                <CardContent className="text-sm text-(--muted-foreground)">
                    {helper}
                </CardContent>
            ) : null}
        </Card>
    );
}

