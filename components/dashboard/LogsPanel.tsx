"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, sanitizeText } from "@/lib/dashboard/formatting";
import type { LogEntry } from "@/lib/dashboard/types";

type Props = {
    logs: LogEntry[];
};

const tone = (status: string) => {
    const n = status.toLowerCase();
    if (n === "success" || n === "ok") return "success";
    if (n === "error" || n === "fallo") return "danger";
    return "neutral";
};

export default function LogsPanel({ logs }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">
                    Logs de n8n
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {logs.length === 0 ? (
                    <p className="text-sm text-(--muted-foreground)">Aún no hay eventos.</p>
                ) : (
                    logs.slice(0, 30).map((log, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-2xl border border-(--border) bg-(--panel) p-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                                <Badge tone={tone(log.status)}>{log.status}</Badge>
                                <span>{formatDate(log.createdAt)}</span>
                                <span className="font-medium">{log.event}</span>
                            </div>
                            <p className="text-sm text-(--foreground)">{sanitizeText(log.message, 200)}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
