import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.N8N_INVENTORY_REFRESH_WEBHOOK_URL;
  const refreshSecret = process.env.N8N_INVENTORY_REFRESH_SECRET;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "N8N_INVENTORY_REFRESH_WEBHOOK_URL no está definida" },
      { status: 500 }
    );
  }

  if (!refreshSecret) {
    return NextResponse.json(
      { ok: false, error: "N8N_INVENTORY_REFRESH_SECRET no está definida" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-refresh-secret": refreshSecret,
      },
      body: JSON.stringify({
        event: "inventory_refresh_requested",
        source: "dashboard_inventory",
        requestedAt: new Date().toISOString(),
        refreshSecret,
        secret: refreshSecret,
      }),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "n8n rechazó la actualización de inventario",
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Actualización de inventario solicitada a n8n",
      n8n: data,
      requestedAt: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error de red";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
