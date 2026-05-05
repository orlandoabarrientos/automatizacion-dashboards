import { NextResponse } from "next/server";
import { z } from "zod";
import { setDataset, upsertRow, addLog } from "@/lib/sheets-store";

const MAX_STRING_LENGTH = 5000;
const MAX_ARRAY_LENGTH = 50_000;
const MAX_KEY_LENGTH = 120;

const RowSchema = z.record(
    z.string().min(1).max(MAX_KEY_LENGTH),
    z.union([z.string().max(MAX_STRING_LENGTH), z.number(), z.boolean(), z.null()])
);

const SyncPayloadSchema = z.object({
    event: z.string().min(1).max(120),
    source: z.string().min(1).max(120),
    sheetName: z.string().min(1).max(120),
    totalRows: z.number().int().min(0),
    totalColumns: z.number().int().min(0),
    columns: z.array(z.string().min(1).max(MAX_KEY_LENGTH)).max(200),
    rows: z.array(RowSchema).max(MAX_ARRAY_LENGTH),
    updatedAt: z.string().datetime(),
    hash: z.string().min(1).max(120),
    datasetType: z.string().min(1).max(120),
}).refine((data) => data.rows.length > 0 || data.totalRows === 0, {
    message: "El array rows no debe estar vacío si totalRows > 0",
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
        setDataset({
            rows: data.rows,
            columns: data.columns,
            updatedAt: data.updatedAt,
            hash: data.hash,
            totalRows: data.totalRows,
            totalColumns: data.totalColumns,
            sheetName: data.sheetName,
            datasetType: data.datasetType,
            source: data.source,
        });

        addLog({
            event: data.event,
            status: "success",
            message: `Recibido ${data.rows.length} filas, ${data.columns.length} columnas desde ${data.source}`,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, message: "Datos sincronizados", receivedRows: data.rows.length });
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
