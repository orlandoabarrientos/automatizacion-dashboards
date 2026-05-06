import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryVehicle } from "@/lib/inventory/types";
import { Eye, Car } from "lucide-react";

export function VehicleCard({
  vehicle,
  onView,
}: {
  vehicle: InventoryVehicle;
  onView: (v: InventoryVehicle) => void;
}) {
  const badgeTone =
    vehicle.estado_inventario === "Disponible"
      ? "success"
      : vehicle.estado_inventario === "Bajo stock"
      ? "warning"
      : "danger";

  return (
    <Card className="flex flex-col gap-3 p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--muted)">
            <Car className="h-5 w-5 text-(--muted-foreground)" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {vehicle.marca} {vehicle.modelo} {vehicle.ano}
            </p>
            <p className="text-xs text-(--muted-foreground)">
              {vehicle.version} · {vehicle.color}
            </p>
          </div>
        </div>
        <Badge tone={badgeTone}>{vehicle.estado_inventario}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-(--muted) px-3 py-2">
          <p className="text-(--muted-foreground)">Sucursal</p>
          <p className="font-medium">{vehicle.sucursal || "—"}</p>
        </div>
        <div className="rounded-lg bg-(--muted) px-3 py-2">
          <p className="text-(--muted-foreground)">Precio</p>
          <p className="font-medium">${vehicle.precio_usd.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-(--muted) px-3 py-2">
          <p className="text-(--muted-foreground)">Stock inicial</p>
          <p className="font-medium">{vehicle.stock_inicial}</p>
        </div>
        <div className="rounded-lg bg-(--muted) px-3 py-2">
          <p className="text-(--muted-foreground)">Disponible</p>
          <p className="font-medium">{vehicle.stock_disponible}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" className="mt-auto w-full gap-2" onClick={() => onView(vehicle)}>
        <Eye className="h-4 w-4" />
        Ver detalle
      </Button>
    </Card>
  );
}
