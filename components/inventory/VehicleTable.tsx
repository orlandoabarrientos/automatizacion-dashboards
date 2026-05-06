import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryVehicle } from "@/lib/inventory/types";
import { Eye } from "lucide-react";

export function VehicleTable({
  vehicles,
  onView,
}: {
  vehicles: InventoryVehicle[];
  onView: (v: InventoryVehicle) => void;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--panel) overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead>Precio USD</TableHead>
            <TableHead>Stock inicial</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.vehicle_id}>
              <TableCell className="font-mono text-xs">{v.vehicle_id}</TableCell>
              <TableCell>{v.marca}</TableCell>
              <TableCell>{v.modelo}</TableCell>
              <TableCell>{v.ano}</TableCell>
              <TableCell>{v.color}</TableCell>
              <TableCell>{v.sucursal}</TableCell>
              <TableCell>${v.precio_usd.toLocaleString()}</TableCell>
              <TableCell>{v.stock_inicial}</TableCell>
              <TableCell>{v.stock_disponible}</TableCell>
              <TableCell>
                <Badge
                  tone={
                    v.estado_inventario === "Disponible"
                      ? "success"
                      : v.estado_inventario === "Bajo stock"
                      ? "warning"
                      : "danger"
                  }
                >
                  {v.estado_inventario}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onView(v)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
