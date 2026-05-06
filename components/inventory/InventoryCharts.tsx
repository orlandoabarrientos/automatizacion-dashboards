import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { InventoryMetrics, InventoryVehicle } from "@/lib/inventory/types";

const COLORS = ["#0f766e", "#2dd4bf", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899"];

export function InventoryCharts({
  metrics,
  vehicles,
}: {
  metrics: InventoryMetrics;
  vehicles: InventoryVehicle[];
}) {
  const brandData = Object.entries(metrics.unidadesPorMarca).map(([name, value]) => ({
    name,
    value,
  }));

  const categoryData = Object.entries(metrics.unidadesPorCategoria).map(([name, value]) => ({
    name,
    value,
  }));

  const branchData = Object.entries(metrics.unidadesPorSucursal).map(([name, value]) => ({
    name,
    value,
  }));

  const availableValueByBrand: Record<string, number> = {};
  for (const v of vehicles) {
    if (v.stock_disponible > 0) {
      availableValueByBrand[v.marca] = (availableValueByBrand[v.marca] ?? 0) + v.precio_usd * v.stock_disponible;
    }
  }
  const valueByBrandData = Object.entries(availableValueByBrand).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const soldVsAvailable = [
    { name: "Disponible", value: metrics.unidadesDisponibles },
    { name: "Vendido", value: metrics.unidadesVendidas },
  ];

  const recentMovements = vehicles
    .flatMap((v) => v.movimientos.map((m) => ({ ...m, vehicle: `${v.marca} ${v.modelo}` })))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 10)
    .map((m) => ({
      name: m.vehicle,
      value: m.qty_delta,
    }));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Unidades por marca">
        <BarChart data={brandData} height={250}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {brandData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Unidades por categoría">
        <PieChart height={250}>
          <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
            {categoryData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title="Unidades por sucursal">
        <BarChart data={branchData} height={250}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {branchData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Valor disponible por marca">
        <BarChart data={valueByBrandData} height={250}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : String(v)} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {valueByBrandData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Vendidos vs disponibles">
        <PieChart height={250}>
          <Pie data={soldVsAvailable} dataKey="value" nameKey="name" outerRadius={80}>
            {soldVsAvailable.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title="Movimientos recientes">
        <BarChart data={recentMovements} height={250}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {recentMovements.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
