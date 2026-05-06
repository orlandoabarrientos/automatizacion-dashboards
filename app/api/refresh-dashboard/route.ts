import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.N8N_REFRESH_WEBHOOK_URL;
  const refreshSecret = process.env.N8N_REFRESH_SECRET;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "N8N_REFRESH_WEBHOOK_URL no está definida" },
      { status: 500 }
    );
  }

  if (!refreshSecret) {
    return NextResponse.json(
      { ok: false, error: "N8N_REFRESH_SECRET no está definida" },
      { status: 500 }
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-refresh-secret": refreshSecret,
    },
    body: JSON.stringify({
      event: "manual_refresh_requested",
      source: "dashboard",
      requestedAt: new Date().toISOString(),

      // Redundancia por si el header no llega a n8n
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
        error: "n8n rechazó la actualización manual",
        status: response.status,
        details: data,
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Actualización solicitada a n8n",
    n8n: data,
    requestedAt: new Date().toISOString(),
  });
}