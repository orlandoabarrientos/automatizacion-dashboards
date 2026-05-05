import { NextResponse } from "next/server";
import { getState } from "@/lib/sheets-store";

export async function GET() {
    const state = getState();
    return NextResponse.json({
        ok: true,
        service: "dashboard",
        source: state.source ?? "n8n",
        totalRows: state.totalRows,
        totalColumns: state.totalColumns,
        lastSync: state.lastSync,
        hasData: state.rows.length > 0,
        timestamp: new Date().toISOString(),
    });
}
