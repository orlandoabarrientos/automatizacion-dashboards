import { NextResponse } from "next/server";

export async function POST() {
    const webhookUrl = process.env.N8N_REFRESH_WEBHOOK_URL;

    if (!webhookUrl) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    "N8N_REFRESH_WEBHOOK_URL no está configurada. Agrega esta variable al archivo .env.local para habilitar el refresh manual desde n8n.",
            },
            { status: 503 }
        );
    }

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(process.env.N8N_REFRESH_SECRET
                    ? { "x-n8n-secret": process.env.N8N_REFRESH_SECRET }
                    : {}),
            },
            body: JSON.stringify({
                action: "refresh_dashboard",
                requestedAt: new Date().toISOString(),
                source: "dashboard_ui",
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json(
                {
                    ok: false,
                    message: `n8n respondió con error ${res.status}: ${text}`,
                },
                { status: 502 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Solicitud enviada a n8n exitosamente",
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error de red";
        return NextResponse.json(
            {
                ok: false,
                message: `No se pudo contactar a n8n: ${msg}`,
            },
            { status: 502 }
        );
    }
}
