import type {
  InventoryRow,
  InventoryVehicle,
  InventoryMovement,
  InventoryMetrics,
  InventoryFilters,
} from "./types";

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, "_");
}

export function getRowValue(row: InventoryRow, key: string): string | number | boolean | null {
  const normalizedTarget = normalizeKey(key);
  const match = Object.keys(row).find((k) => normalizeKey(k) === normalizedTarget);
  if (!match) return null;
  const value = row[match];
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9,.-]/g, "").trim();
  if (!cleaned) return 0;
  let normalized = cleaned;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = cleaned.split(thousandSeparator).join("").replace(decimalSeparator, ".");
  } else if (hasComma) {
    normalized = cleaned.replace(/,/g, ".");
  }
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

export function parseMovements(rows: InventoryRow[]): InventoryMovement[] {
  return rows
    .map((row): InventoryMovement | null => {
      const vehicleId = toStringValue(getRowValue(row, "vehicle_id"));
      if (!vehicleId) return null;
      return {
        movement_id: toStringValue(getRowValue(row, "movement_id")),
        vehicle_id: vehicleId,
        qty_delta: toNumber(getRowValue(row, "qty_delta")),
        movement_type: toStringValue(getRowValue(row, "movement_type")),
        fecha: toStringValue(getRowValue(row, "fecha")),
        related_order_id: toStringValue(getRowValue(row, "related_order_id")) || null,
        related_lead_id: toStringValue(getRowValue(row, "related_lead_id")) || null,
      };
    })
    .filter((m): m is InventoryMovement => m !== null);
}

export function buildVehicles(
  masterRows: InventoryRow[],
  movements: InventoryMovement[]
): InventoryVehicle[] {
  const movementsByVehicle = new Map<string, InventoryMovement[]>();
  for (const m of movements) {
    const list = movementsByVehicle.get(m.vehicle_id) ?? [];
    list.push(m);
    movementsByVehicle.set(m.vehicle_id, list);
  }

  return masterRows
    .map((row) => {
      const vehicleId = toStringValue(getRowValue(row, "vehicle_id"));
      if (!vehicleId) return null;

      const stockInicial = toNumber(getRowValue(row, "stock_inicial"));
      const vehicleMovements = movementsByVehicle.get(vehicleId) ?? [];
      const totalDelta = vehicleMovements.reduce((sum, m) => sum + m.qty_delta, 0);
      const stockDisponible = stockInicial + totalDelta;

      let estado: InventoryVehicle["estado_inventario"] = "Disponible";
      if (stockDisponible <= 0) {
        estado = "Vendido";
      } else if (stockDisponible === 1 && stockInicial > 1) {
        estado = "Bajo stock";
      }

      return {
        vehicle_id: vehicleId,
        vin: toStringValue(getRowValue(row, "vin")),
        placa: toStringValue(getRowValue(row, "placa")),
        marca: toStringValue(getRowValue(row, "marca")),
        modelo: toStringValue(getRowValue(row, "modelo")),
        ano: toNumber(getRowValue(row, "ano")),
        version: toStringValue(getRowValue(row, "version")),
        color: toStringValue(getRowValue(row, "color")),
        categoria: toStringValue(getRowValue(row, "categoria")),
        condicion: toStringValue(getRowValue(row, "condicion")),
        sucursal: toStringValue(getRowValue(row, "sucursal")),
        precio_usd: toNumber(getRowValue(row, "precio_usd")),
        costo_usd: toNumber(getRowValue(row, "costo_usd")),
        stock_inicial: stockInicial,
        movimientos: vehicleMovements,
        stock_disponible: stockDisponible,
        estado_inventario: estado,
      } satisfies InventoryVehicle;
    })
    .filter((v): v is InventoryVehicle => v !== null);
}

export function calculateMetrics(vehicles: InventoryVehicle[]): InventoryMetrics {
  const disponibles = vehicles.filter((v) => v.estado_inventario !== "Vendido");
  const vendidos = vehicles.filter((v) => v.estado_inventario === "Vendido");

  const valorTotalInventario = vehicles.reduce((sum, v) => sum + v.precio_usd * v.stock_inicial, 0);
  const valorDisponible = disponibles.reduce((sum, v) => sum + v.precio_usd * v.stock_disponible, 0);
  const costoDisponible = disponibles.reduce((sum, v) => sum + v.costo_usd * v.stock_disponible, 0);
  const margenPotencial = valorDisponible - costoDisponible;

  const marcasSet = new Set(disponibles.map((v) => v.marca).filter(Boolean));
  const modelosSet = new Set(disponibles.map((v) => v.modelo).filter(Boolean));

  const unidadesPorSucursal: Record<string, number> = {};
  const unidadesPorMarca: Record<string, number> = {};
  const unidadesPorCategoria: Record<string, number> = {};

  for (const v of disponibles) {
    unidadesPorSucursal[v.sucursal] = (unidadesPorSucursal[v.sucursal] ?? 0) + v.stock_disponible;
    unidadesPorMarca[v.marca] = (unidadesPorMarca[v.marca] ?? 0) + v.stock_disponible;
    unidadesPorCategoria[v.categoria] = (unidadesPorCategoria[v.categoria] ?? 0) + v.stock_disponible;
  }

  const totalUnidades = vehicles.reduce((sum, v) => sum + v.stock_inicial, 0);
  const ticketPromedio = disponibles.length > 0
    ? disponibles.reduce((sum, v) => sum + v.precio_usd, 0) / disponibles.length
    : 0;

  let vehiculoMasCaro: InventoryMetrics["vehiculoMasCaro"] = null;
  let vehiculoMasEconomico: InventoryMetrics["vehiculoMasEconomico"] = null;

  for (const v of disponibles) {
    if (!vehiculoMasCaro || v.precio_usd > vehiculoMasCaro.precio_usd) {
      vehiculoMasCaro = { vehicle_id: v.vehicle_id, marca: v.marca, modelo: v.modelo, precio_usd: v.precio_usd };
    }
    if (!vehiculoMasEconomico || v.precio_usd < vehiculoMasEconomico.precio_usd) {
      vehiculoMasEconomico = { vehicle_id: v.vehicle_id, marca: v.marca, modelo: v.modelo, precio_usd: v.precio_usd };
    }
  }

  return {
    totalUnidades,
    unidadesDisponibles: disponibles.reduce((sum, v) => sum + v.stock_disponible, 0),
    unidadesVendidas: vendidos.reduce((sum, v) => sum + v.stock_inicial, 0),
    valorTotalInventario,
    valorDisponible,
    margenPotencial,
    marcasDisponibles: marcasSet.size,
    modelosDisponibles: modelosSet.size,
    unidadesPorSucursal,
    unidadesPorMarca,
    unidadesPorCategoria,
    ticketPromedioInventario: ticketPromedio,
    vehiculoMasCaro,
    vehiculoMasEconomico,
  };
}

export function applyFilters(vehicles: InventoryVehicle[], filters: InventoryFilters): InventoryVehicle[] {
  return vehicles.filter((v) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.placa.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.marca && v.marca !== filters.marca) return false;
    if (filters.modelo && v.modelo !== filters.modelo) return false;
    if (filters.ano && String(v.ano) !== filters.ano) return false;
    if (filters.categoria && v.categoria !== filters.categoria) return false;
    if (filters.sucursal && v.sucursal !== filters.sucursal) return false;
    if (filters.color && v.color !== filters.color) return false;
    if (filters.condicion && v.condicion !== filters.condicion) return false;
    if (filters.estadoInventario && v.estado_inventario !== filters.estadoInventario) return false;
    if (filters.precioMin !== null && v.precio_usd < filters.precioMin) return false;
    if (filters.precioMax !== null && v.precio_usd > filters.precioMax) return false;
    return true;
  });
}

export function extractFilterOptions(vehicles: InventoryVehicle[]) {
  const marcas = Array.from(new Set(vehicles.map((v) => v.marca).filter(Boolean))).sort();
  const modelos = Array.from(new Set(vehicles.map((v) => v.modelo).filter(Boolean))).sort();
  const anos = Array.from(new Set(vehicles.map((v) => String(v.ano)).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  const categorias = Array.from(new Set(vehicles.map((v) => v.categoria).filter(Boolean))).sort();
  const sucursales = Array.from(new Set(vehicles.map((v) => v.sucursal).filter(Boolean))).sort();
  const colores = Array.from(new Set(vehicles.map((v) => v.color).filter(Boolean))).sort();
  const condiciones = Array.from(new Set(vehicles.map((v) => v.condicion).filter(Boolean))).sort();
  const estados = ["Disponible", "Vendido", "Bajo stock"];

  return { marcas, modelos, anos, categorias, sucursales, colores, condiciones, estados };
}
