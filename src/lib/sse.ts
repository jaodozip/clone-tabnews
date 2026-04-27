// SSE in-memory event bus (single-instance; use Redis pub/sub for multi-instance)
type Listener = (data: string) => void;

const listeners = new Set<Listener>();

export const sseEmitter = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    listeners.forEach((fn) => fn(payload));
  },
};
