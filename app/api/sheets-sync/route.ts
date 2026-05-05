import { NextResponse } from "next/server";
import { z } from "zod";
import { setRows, upsertRow, addLog } from "@/lib/sheets-store";

export const MAX_PAYLOAD_BYTES = 200_000;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 10_000;
const MAX_RECORD_KEYS = 200;
const MAX_KEY_LENGTH = 120;

const RowSchema = z.record(
    z.string().min(1).max(MAX_KEY_LENGTH),
    z.union([z.string().max(MAX_STRING_LENGTH), z.number(), z.boolean(), z.null()])
);

const SyncPayloadSchema = z.object({
    event: z.string().min(1).max(120),
    row: RowSchema.optional(),
    rows: z.array(RowSchema).max(MAX_ARRAY_LENGTH).optional(),
    updatedAt: z.string().datetime().optional(),
}).refine((data) => data.row !== undefined || data.rows !== undefined, {
    message: "Debe enviar 'row' o 'rows'",
});

const unauthorized = () =>
    NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

export async function POST(req: Request) {
    const secret = req.headers.get("x-dashboard-secret");
    const expected = process.env.N8N_DASHBOARD_SECRET;

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

    const size = new TextEncoder().encode(rawBody).length;
    if (size > MAX_PAYLOAD_BYTES) {
        return NextResponse.json({ ok: false, message: "Payload demasiado grande" }, { status: 413 });
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
    const updatedAt = data.updatedAt ?? new Date().toISOString();

    try {
        if (data.rows) {
            setRows(data.rows, updatedAt);
        } else if (data.row) {
            upsertRow(data.row, updatedAt);
        }

        addLog({
            event: data.event,
            status: "success",
            message: `Recibido: ${data.rows ? data.rows.length + " filas" : "1 fila"}`,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, message: "Datos sincronizados" });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error interno";
        addLog({
            event: data.event,
            status: "error",
            message: msg,
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: false, message: msg }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: false, message: "Método no permitido" }, { status: 405, headers: { Allow: "POST" } });
}
