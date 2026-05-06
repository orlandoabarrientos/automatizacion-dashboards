import { Card, CardContent } from "@/components/ui/card";
import type { InventoryMetrics } from "@/lib/inventory/types";
import {
  Car,
  CheckCircle2,
  XCircle,
  DollarSign,
  Tag,
  Store,
} from "lucide-react";

export function KpiCards({ metrics }: { metrics: InventoryMetrics }) {
  const items = [
    {
      label: "Total unidades",
      value: metrics.totalUnidades,
      icon: Car,
      tone: "info" as const,
    },
    {
      label: "Disponibles",
      value: metrics.unidadesDisponibles,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Vendidas",
      value: metrics.unidadesVendidas,
      icon: XCircle,
      tone: "danger" as const,
    },
    {
      label: "Valor disponible USD",
      value: `$${Math.round(metrics.valorDisponible).toLocaleString()}`,
      icon: DollarSign,
      tone: "info" as const,
    },
    {
      label: "Marcas activas",
      value: metrics.marcasDisponibles,
      icon: Tag,
      tone: "neutral" as const,
    },
    {
      label: "Sucursales con stock",
      value: Object.keys(metrics.unidadesPorSucursal).length,
      icon: Store,
      tone: "neutral" as const,
    },
  ];

  const toneClasses: Record<string, string> = {
    info: "text-sky-500",
    success: "text-emerald-500",
    danger: "text-rose-500",
    neutral: "text-(--muted-foreground)",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="flex items-center gap-4 p-4">
          <div className={cn("rounded-xl bg-(--muted) p-3", toneClasses[item.tone])}>
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-(--muted-foreground)">{item.label}</p>
            <p className="text-xl font-semibold tracking-tight">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
