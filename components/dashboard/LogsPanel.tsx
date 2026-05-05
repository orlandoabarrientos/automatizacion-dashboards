"use client";

import { Terminal } from "lucide-react";
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
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-(--accent)" />
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-(--muted-foreground)">Logs de sincronización</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {logs.length === 0 ? (
                    <p className="text-sm text-(--muted-foreground)">Aún no hay eventos registrados.</p>
                ) : (
                    logs.slice(0, 50).map((log, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-2xl border border-(--border) bg-(--panel) p-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                                <Badge tone={tone(log.status)}>{log.status}</Badge>
                                <span>{formatDate(log.createdAt)}</span>
                                <span className="font-medium text-(--foreground)">{log.event}</span>
                            </div>
                            <p className="text-sm text-(--foreground)">{sanitizeText(log.message, 200)}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
