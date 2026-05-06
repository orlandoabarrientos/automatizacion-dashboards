import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { InventoryVehicle } from "@/lib/inventory/types";
import { Car, DollarSign, Package, TrendingUp, Calendar, MessageSquare } from "lucide-react";

export function VehicleDetail({
  vehicle,
  open,
  onClose,
}: {
  vehicle: InventoryVehicle | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!vehicle) return null;

  const margen = vehicle.precio_usd - vehicle.costo_usd;
  const margenPct = vehicle.costo_usd > 0 ? (margen / vehicle.costo_usd) * 100 : 0;

  const lastSale = vehicle.movimientos
    .filter((m) => m.qty_delta < 0)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

  const relatedOrder = lastSale?.related_order_id;
  const relatedLead = lastSale?.related_lead_id;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--muted)">
            <Car className="h-5 w-5 text-(--muted-foreground)" />
          </div>
          <div>
            <DialogTitle>
              {vehicle.marca} {vehicle.modelo} {vehicle.ano}
            </DialogTitle>
            <DialogDescription>
              {vehicle.version} · {vehicle.color} · {vehicle.condicion}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <DialogContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoItem icon={Package} label="VIN" value={vehicle.vin || "—"} />
          <InfoItem icon={Package} label="Placa" value={vehicle.placa || "—"} />
          <InfoItem icon={Package} label="Categoría" value={vehicle.categoria || "—"} />
          <InfoItem icon={Package} label="Sucursal" value={vehicle.sucursal || "—"} />
        </div>

        <div className="rounded-xl border border-(--border) bg-(--muted) p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Precios y margen
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-(--muted-foreground)">Precio</p>
              <p className="font-semibold">${vehicle.precio_usd.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-(--muted-foreground)">Costo</p>
              <p className="font-semibold">${vehicle.costo_usd.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-(--muted-foreground)">Margen</p>
              <p className="font-semibold">
                ${margen.toLocaleString()} ({margenPct.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--muted) p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Stock
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-(--muted-foreground)">Inicial</p>
              <p className="font-semibold">{vehicle.stock_inicial}</p>
            </div>
            <div>
              <p className="text-(--muted-foreground)">Disponible</p>
              <p className="font-semibold">{vehicle.stock_disponible}</p>
            </div>
            <div>
              <p className="text-(--muted-foreground)">Estado</p>
              <Badge
                tone={
                  vehicle.estado_inventario === "Disponible"
                    ? "success"
                    : vehicle.estado_inventario === "Bajo stock"
                    ? "warning"
                    : "danger"
                }
              >
                {vehicle.estado_inventario}
              </Badge>
            </div>
          </div>
        </div>

        {lastSale && (
          <div className="rounded-xl border border-(--border) bg-(--muted) p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
              Última venta
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <InfoItem icon={Calendar} label="Fecha" value={lastSale.fecha} />
              {relatedOrder && <InfoItem icon={TrendingUp} label="Orden" value={relatedOrder} />}
              {relatedLead && <InfoItem icon={MessageSquare} label="Lead" value={relatedLead} />}
            </div>
          </div>
        )}

        {vehicle.movimientos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
              Movimientos recientes
            </p>
            <div className="flex max-h-48 flex-col gap-2 overflow-auto rounded-xl border border-(--border) bg-(--muted) p-2 scrollbar-thin">
              {vehicle.movimientos
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .map((m) => (
                  <div
                    key={m.movement_id}
                    className="flex items-center justify-between rounded-lg bg-(--panel) px-3 py-2 text-xs"
                  >
                    <span className="font-medium">{m.movement_type}</span>
                    <span className={m.qty_delta < 0 ? "text-rose-500" : "text-emerald-500"}>
                      {m.qty_delta > 0 ? "+" : ""}
                      {m.qty_delta}
                    </span>
                    <span className="text-(--muted-foreground)">{m.fecha}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-(--muted-foreground)" />
      <span className="text-(--muted-foreground)">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
