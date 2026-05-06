import { NextResponse } from "next/server";
import { loadInventorySnapshot } from "@/lib/inventory/store";
import {
  parseMovements,
  buildVehicles,
  calculateMetrics,
  extractFilterOptions,
} from "@/lib/inventory/calculations";
import type { InventoryDataResponse } from "@/lib/inventory/types";

export async function GET() {
  try {
    const snapshot = await loadInventorySnapshot();

    if (!snapshot) {
      const emptyResponse: InventoryDataResponse = {
        ok: true,
        vehicles: [],
        metrics: {
          totalUnidades: 0,
          unidadesDisponibles: 0,
          unidadesVendidas: 0,
          valorTotalInventario: 0,
          valorDisponible: 0,
          margenPotencial: 0,
          marcasDisponibles: 0,
          modelosDisponibles: 0,
          unidadesPorSucursal: {},
          unidadesPorMarca: {},
          unidadesPorCategoria: {},
          ticketPromedioInventario: 0,
          vehiculoMasCaro: null,
          vehiculoMasEconomico: null,
        },
        filters: {
          marcas: [],
          modelos: [],
          anos: [],
          categorias: [],
          sucursales: [],
          colores: [],
          condiciones: [],
          estados: ["Disponible", "Vendido", "Bajo stock"],
        },
        lastSync: null,
      };
      return NextResponse.json(emptyResponse);
    }

    const movements = parseMovements(snapshot.inventoryMovements);
    const vehicles = buildVehicles(snapshot.inventoryMaster, movements);
    const metrics = calculateMetrics(vehicles);
    const filters = extractFilterOptions(vehicles);

    const response: InventoryDataResponse = {
      ok: true,
      vehicles,
      metrics,
      filters,
      lastSync: snapshot.receivedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json(
      {
        ok: false,
        message: msg,
        vehicles: [],
        metrics: {
          totalUnidades: 0,
          unidadesDisponibles: 0,
          unidadesVendidas: 0,
          valorTotalInventario: 0,
          valorDisponible: 0,
          margenPotencial: 0,
          marcasDisponibles: 0,
          modelosDisponibles: 0,
          unidadesPorSucursal: {},
          unidadesPorMarca: {},
          unidadesPorCategoria: {},
          ticketPromedioInventario: 0,
          vehiculoMasCaro: null,
          vehiculoMasEconomico: null,
        },
        filters: {
          marcas: [],
          modelos: [],
          anos: [],
          categorias: [],
          sucursales: [],
          colores: [],
          condiciones: [],
          estados: ["Disponible", "Vendido", "Bajo stock"],
        },
        lastSync: null,
      } satisfies InventoryDataResponse,
      { status: 500 }
    );
  }
}
