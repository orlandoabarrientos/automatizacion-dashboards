import { NextResponse } from "next/server";
import { z } from "zod";

const ChatbotPayloadSchema = z.object({
  session_id: z.string().min(1),
  telefono: z.string().min(1),
  nombre: z.string().min(1),
  mensaje: z.string().min(1),
  canal: z.literal("web").optional().default("web"),
});

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_CHATBOT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "N8N_CHATBOT_WEBHOOK_URL no está definida" },
      { status: 500 }
    );
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ ok: false, message: "No se pudo leer el body" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const result = ChatbotPayloadSchema.safeParse(parsed);
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
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const text = await response.text();
    let n8nData: unknown;
    try {
      n8nData = JSON.parse(text);
    } catch {
      n8nData = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "n8n rechazó el mensaje del chatbot",
          status: response.status,
          details: n8nData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Mensaje enviado al chatbot",
      response: n8nData,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error de red";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
