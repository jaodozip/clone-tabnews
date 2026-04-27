"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Beer, LogOut, RefreshCw, Wifi, WifiOff,
  Clock, CheckCheck, ChefHat, Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS,
  CATEGORIAS_BAR, CATEGORIAS_COZINHA,
} from "@/lib/utils";

type Produto = { id: string; nome: string; categoria: string };
type Mesa = { id: string; numero: number };
type Comanda = { id: string; mesa: Mesa };

type ItemPedido = {
  id: string;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  observacao: string | null;
  status: string;
  criadoEm: string;
  comanda: Comanda;
};

type ComandaComItens = {
  id: string;
  mesa: Mesa;
  abertaEm: string;
  itensPedido: ItemPedido[];
};

function ItemCard({ item, onAvancar }: { item: ItemPedido; onAvancar: (id: string) => void }) {
  const podeAvancar = item.status === "RECEBIDO" || item.status === "EM_PREPARO";

  const proximoLabel: Record<string, string> = {
    RECEBIDO: "Iniciar preparo",
    EM_PREPARO: "Marcar entregue",
  };

  return (
    <div className={`rounded-lg border p-3 text-sm transition-all ${STATUS_COLORS[item.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{item.produto.nome}</p>
          <p className="text-xs opacity-80">Qtd: {item.quantidade} · {formatCurrency(item.precoUnitario)}/un</p>
          {item.observacao && (
            <p className="text-xs mt-1 italic opacity-70">"{item.observacao}"</p>
          )}
          <p className="text-xs opacity-60 mt-1">{formatDateTime(item.criadoEm)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60">
            {STATUS_LABELS[item.status]}
          </span>
          {podeAvancar && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-white/70 border-current"
              onClick={() => onAvancar(item.id)}
            >
              {proximoLabel[item.status]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MesaCard({
  comanda,
  onAvancar,
  onFechar,
  categorias,
}: {
  comanda: ComandaComItens;
  onAvancar: (id: string) => void;
  onFechar: (comandaId: string) => void;
  categorias: string[];
}) {
  const itensFiltrados = comanda.itensPedido.filter(
    (i) => categorias.includes(i.produto.categoria) && i.status !== "ENTREGUE" && i.status !== "CANCELADO"
  );

  const totalMesa = comanda.itensPedido
    .filter((i) => i.status !== "CANCELADO")
    .reduce((acc, i) => acc + Number(i.precoUnitario) * i.quantidade, 0);

  if (itensFiltrados.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-amber-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4" />
          <span className="font-bold">Mesa {comanda.mesa.numero}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-200 text-xs">{formatCurrency(totalMesa)}</span>
          <Badge className="text-xs bg-amber-600 text-white border-amber-500">
            {itensFiltrados.length} item(s)
          </Badge>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {itensFiltrados.map((item) => (
          <ItemCard key={item.id} item={item} onAvancar={onAvancar} />
        ))}
      </div>
    </div>
  );
}

export default function PainelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comandas, setComandas] = useState<ComandaComItens[]>([]);
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [notificacoes, setNotificacoes] = useState<string[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const carregarComandas = useCallback(async () => {
    try {
      const res = await fetch("/api/comandas");
      const data = await res.json();
      setComandas(data);
    } finally {
      setCarregando(false);
    }
  }, []);

  const avancarStatus = useCallback(async (itemId: string) => {
    await fetch(`/api/pedidos/${itemId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await carregarComandas();
  }, [carregarComandas]);

  const fecharMesa = useCallback(async (comandaId: string) => {
    if (!confirm("Fechar comanda desta mesa?")) return;
    await fetch(`/api/comandas/${comandaId}/fechar`, { method: "POST" });
    await carregarComandas();
  }, [carregarComandas]);

  const tocarSom = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  // SSE
  useEffect(() => {
    if (status !== "authenticated") return;

    carregarComandas();

    const es = new EventSource("/api/eventos");

    es.onopen = () => setConectado(true);
    es.onerror = () => setConectado(false);

    es.addEventListener("novo-pedido", (e) => {
      const data = JSON.parse(e.data);
      tocarSom();
      setNotificacoes((prev) => [
        `🍺 Novo pedido — Mesa ${data.mesaNumero}`,
        ...prev.slice(0, 4),
      ]);
      carregarComandas();
    });

    es.addEventListener("status-atualizado", () => carregarComandas());
    es.addEventListener("mesa-fechada", (e) => {
      const data = JSON.parse(e.data);
      setNotificacoes((prev) => [
        `✅ Mesa ${data.mesaNumero} fechada`,
        ...prev.slice(0, 4),
      ]);
      carregarComandas();
    });

    return () => es.close();
  }, [status, carregarComandas, tocarSom]);

  const papel = (session?.user as any)?.papel;

  if (status === "loading" || carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const mesasAtivas = comandas.filter((c) => c.itensPedido.some(
    (i) => i.status !== "ENTREGUE" && i.status !== "CANCELADO"
  ));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beer className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-amber-400">Estação do Chopp</p>
              <p className="text-gray-400 text-xs">Painel Operacional</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {conectado ? (
                <><Wifi className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs hidden sm:block">Conectado</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs hidden sm:block">Desconectado</span></>
              )}
            </div>
            {papel === "ADMIN" && (
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white text-xs" onClick={() => router.push("/admin")}>
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => signOut()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Notificações */}
      {notificacoes.length > 0 && (
        <div className="bg-amber-900/40 border-b border-amber-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto">
            {notificacoes.map((n, i) => (
              <span key={i} className="text-amber-300 text-sm whitespace-nowrap bg-amber-900/60 px-3 py-1 rounded-full">
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue={papel === "COZINHA" ? "cozinha" : "bar"}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList className="bg-gray-800">
              {papel !== "COZINHA" && (
                <TabsTrigger value="bar" className="data-[state=active]:bg-amber-700 data-[state=active]:text-white text-gray-300">
                  <Beer className="w-4 h-4 mr-1" /> Bar
                </TabsTrigger>
              )}
              {papel !== "ATENDENTE" && (
                <TabsTrigger value="cozinha" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white text-gray-300">
                  <ChefHat className="w-4 h-4 mr-1" /> Cozinha
                </TabsTrigger>
              )}
              <TabsTrigger value="mesas" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-gray-300">
                <Table2 className="w-4 h-4 mr-1" /> Mesas ({comandas.length})
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300" onClick={carregarComandas}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Atualizar
            </Button>
          </div>

          {/* Aba Bar */}
          <TabsContent value="bar">
            <div className="mb-3 flex items-center gap-2">
              <Beer className="w-5 h-5 text-amber-400" />
              <h2 className="text-amber-400 font-semibold">Bar — Chopps, Cervejas e Bebidas</h2>
            </div>
            {mesasAtivas.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <CheckCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum pedido pendente no bar</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mesasAtivas.map((c) => (
                  <MesaCard key={c.id} comanda={c} onAvancar={avancarStatus} onFechar={fecharMesa} categorias={CATEGORIAS_BAR} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba Cozinha */}
          <TabsContent value="cozinha">
            <div className="mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400" />
              <h2 className="text-orange-400 font-semibold">Cozinha — Espetinhos e Porções</h2>
            </div>
            {mesasAtivas.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <CheckCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum pedido pendente na cozinha</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mesasAtivas.map((c) => (
                  <MesaCard key={c.id} comanda={c} onAvancar={avancarStatus} onFechar={fecharMesa} categorias={CATEGORIAS_COZINHA} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba Mesas */}
          <TabsContent value="mesas">
            <div className="mb-3 flex items-center gap-2">
              <Table2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-blue-400 font-semibold">Resumo por Mesa</h2>
            </div>
            {comandas.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Table2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma mesa aberta</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comandas.map((c) => {
                  const total = c.itensPedido
                    .filter((i) => i.status !== "CANCELADO")
                    .reduce((acc, i) => acc + Number(i.precoUnitario) * i.quantidade, 0);
                  const pendentes = c.itensPedido.filter(
                    (i) => i.status === "RECEBIDO" || i.status === "EM_PREPARO"
                  ).length;

                  return (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Table2 className="w-5 h-5 text-amber-400" />
                          <span className="text-lg font-bold text-white">Mesa {c.mesa.numero}</span>
                        </div>
                        <Badge className="bg-blue-900 text-blue-300 border-blue-700">
                          {c.itensPedido.length} pedido(s)
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {c.itensPedido
                          .filter((i) => i.status !== "CANCELADO")
                          .map((i) => (
                            <div key={i.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300 truncate max-w-[60%]">
                                {i.quantidade}x {i.produto.nome}
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[i.status]}`}
                                >
                                  {STATUS_LABELS[i.status]}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">Total consumido</p>
                          <p className="text-white font-bold">{formatCurrency(total)}</p>
                          {pendentes > 0 && (
                            <p className="text-amber-400 text-xs mt-0.5">{pendentes} pendente(s)</p>
                          )}
                        </div>
                        {papel !== "COZINHA" && (
                          <Button
                            size="sm"
                            className="bg-red-700 hover:bg-red-600 text-white text-xs"
                            onClick={() => fecharMesa(c.id)}
                          >
                            Fechar mesa
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
