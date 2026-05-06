"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, User, Phone, Bot, Loader2 } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  createdAt: number;
};

function generateSessionId() {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "chatbot:session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = generateSessionId();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function SalesChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showCapture, setShowCapture] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const addMessage = useCallback((role: ChatMessage["role"], text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}_${Math.random()}`, role, text, createdAt: Date.now() }]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      addMessage("user", text);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chatbot-sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: getSessionId(),
            telefono: telefono || "0000000000",
            nombre: nombre || "Invitado",
            mensaje: text,
            canal: "web",
          }),
        });

        const data = (await res.json()) as { ok: boolean; response?: { respuesta?: string; message?: string }; error?: string };

        if (!data.ok) {
          addMessage("bot", data.error ?? "Error al contactar al asesor.");
        } else {
          const reply =
            (data.response && typeof data.response === "object" && "respuesta" in data.response && typeof data.response.respuesta === "string")
              ? data.response.respuesta
              : (data.response && typeof data.response === "object" && "message" in data.response && typeof data.response.message === "string")
              ? data.response.message
              : "Respuesta recibida.";
          addMessage("bot", reply);
        }
      } catch {
        addMessage("bot", "Error de red. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [addMessage, nombre, telefono]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!nombre || !telefono) {
        setShowCapture(true);
        return;
      }
      sendMessage(input);
    },
    [input, nombre, telefono, sendMessage]
  );

  const handleCaptureSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!nombre.trim() || !telefono.trim()) return;
      setShowCapture(false);
      sendMessage(input);
    },
    [input, nombre, telefono, sendMessage]
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105",
          open ? "bg-(--muted) text-(--foreground)" : "bg-(--accent) text-(--accent-foreground)"
        )}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-80 flex-col overflow-hidden rounded-3xl border border-(--border) bg-(--panel) shadow-2xl sm:w-96">
          <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted) px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--accent)">
              <Bot className="h-5 w-5 text-(--accent-foreground)" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Asesor de ventas</p>
              <p className="text-xs text-(--muted-foreground)">Disponible</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto p-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Bot className="h-8 w-8 text-(--muted-foreground)" />
                <p className="text-sm text-(--muted-foreground)">
                  ¡Hola! Soy tu asesor virtual. Pregúntame por disponibilidad, precios o recomendaciones.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "mb-3 flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-(--accent) text-(--accent-foreground)"
                      : "bg-(--muted) text-(--foreground)"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-(--muted) px-3 py-2 text-sm text-(--muted-foreground)">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Asesor escribiendo...
                </div>
              </div>
            )}
          </div>

          {showCapture ? (
            <form onSubmit={handleCaptureSubmit} className="border-t border-(--border) p-3">
              <p className="mb-2 text-xs text-(--muted-foreground)">
                Para continuar, indícanos tu nombre y teléfono.
              </p>
              <div className="mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-(--muted-foreground)" />
                <Input
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-(--muted-foreground)" />
                <Input
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <Button type="submit" size="sm" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Continuar
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-(--border) p-3">
              <Input
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-10 flex-1 text-sm"
              />
              <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-10 w-10 p-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
