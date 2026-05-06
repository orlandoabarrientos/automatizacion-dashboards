export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type InventoryRow = Record<string, JsonValue>;

export type InventoryMovement = {
  movement_id: string;
  vehicle_id: string;
  qty_delta: number;
  movement_type: string;
  fecha: string;
  related_order_id?: string | null;
  related_lead_id?: string | null;
};

export type InventoryVehicle = {
  vehicle_id: string;
  vin: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  version: string;
  color: string;
  categoria: string;
  condicion: string;
  sucursal: string;
  precio_usd: number;
  costo_usd: number;
  stock_inicial: number;
  movimientos: InventoryMovement[];
  stock_disponible: number;
  estado_inventario: "Disponible" | "Vendido" | "Bajo stock";
};

export type InventoryMetrics = {
  totalUnidades: number;
  unidadesDisponibles: number;
  unidadesVendidas: number;
  valorTotalInventario: number;
  valorDisponible: number;
  margenPotencial: number;
  marcasDisponibles: number;
  modelosDisponibles: number;
  unidadesPorSucursal: Record<string, number>;
  unidadesPorMarca: Record<string, number>;
  unidadesPorCategoria: Record<string, number>;
  ticketPromedioInventario: number;
  vehiculoMasCaro: { vehicle_id: string; marca: string; modelo: string; precio_usd: number } | null;
  vehiculoMasEconomico: { vehicle_id: string; marca: string; modelo: string; precio_usd: number } | null;
};

export type InventoryFilters = {
  search: string;
  marca: string | null;
  modelo: string | null;
  ano: string | null;
  categoria: string | null;
  sucursal: string | null;
  color: string | null;
  condicion: string | null;
  estadoInventario: string | null;
  precioMin: number | null;
  precioMax: number | null;
};

export type InventorySnapshot = {
  inventoryMaster: InventoryRow[];
  inventoryMovements: InventoryRow[];
  receivedAt: string;
  source: string;
};

export type InventoryDataResponse = {
  ok: boolean;
  vehicles: InventoryVehicle[];
  metrics: InventoryMetrics;
  filters: {
    marcas: string[];
    modelos: string[];
    anos: string[];
    categorias: string[];
    sucursales: string[];
    colores: string[];
    condiciones: string[];
    estados: string[];
  };
  lastSync: string | null;
  message?: string;
};

export type ChatbotSalesPayload = {
  session_id: string;
  telefono: string;
  nombre: string;
  mensaje: string;
  canal: "web";
};
