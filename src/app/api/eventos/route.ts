import { NextRequest } from "next/server";
import { sseEmitter } from "@/lib/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Envia keep-alive imediatamente
      controller.enqueue(encoder.encode(": keep-alive\n\n"));

      const unsubscribe = sseEmitter.subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          unsubscribe();
        }
      });

      // Keep-alive a cada 25s para evitar timeout de proxies
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 25_000);

      // Limpeza quando o cliente desconectar
      _req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
