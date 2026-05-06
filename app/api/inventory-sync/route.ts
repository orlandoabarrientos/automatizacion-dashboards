import { NextResponse } from "next/server";
import { z } from "zod";
import { saveInventorySnapshot } from "@/lib/inventory/store";

const MAX_ARRAY_LENGTH = 50_000;
const MAX_KEY_LENGTH = 120;
const MAX_STRING_LENGTH = 5000;

const RowSchema = z.record(
  z.string().min(1).max(MAX_KEY_LENGTH),
  z.union([z.string().max(MAX_STRING_LENGTH), z.number(), z.boolean(), z.null()])
);

const SyncPayloadSchema = z.object({
  inventoryMaster: z.array(RowSchema).max(MAX_ARRAY_LENGTH),
  inventoryMovements: z.array(RowSchema).max(MAX_ARRAY_LENGTH),
  receivedAt: z.string().datetime(),
  source: z.string().min(1).max(120),
});

const unauthorized = () =>
  NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

export async function POST(req: Request) {
  const secret = req.headers.get("x-inventory-secret");
  const expected = process.env.N8N_INVENTORY_SECRET || process.env.N8N_DASHBOARD_SECRET;

  if (!expected || !secret || secret !== expected) {
    return unauthorized();
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ ok: false, message: "No se pudo leer el body" }, { status: 400 });
  }

  if (!rawBody) {
    return NextResponse.json({ ok: false, message: "Body vacío" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const result = SyncPayloadSchema.safeParse(parsed);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload inválido",
        errors: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 422 }
    );
  }

  const data = result.data;

  try {
    await saveInventorySnapshot({
      inventoryMaster: data.inventoryMaster,
      inventoryMovements: data.inventoryMovements,
      receivedAt: data.receivedAt,
      source: data.source,
    });

    return NextResponse.json({
      ok: true,
      message: "Snapshot de inventario sincronizado",
      receivedMasterRows: data.inventoryMaster.length,
      receivedMovementRows: data.inventoryMovements.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Método no permitido" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
