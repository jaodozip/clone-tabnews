"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart, Plus, Minus, Send, ChevronDown, ChevronUp,
  Beer, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, CATEGORIA_LABELS, CATEGORIA_EMOJI } from "@/lib/utils";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  imagemUrl: string | null;
  disponivel: boolean;
};

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
  observacao: string;
};

const ORDEM_CATEGORIAS = ["CHOPP", "CERVEJA", "BEBIDA", "ESPETINHO", "PORCAO"];

export default function MesaPage() {
  const params = useParams();
  const mesaNumero = Number(params.numero);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Map<string, ItemCarrinho>>(new Map());
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("CHOPP");
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetch("/api/produtos")
      .then((r) => r.json())
      .then((data) => setProdutos(data.filter((p: Produto) => p.disponivel)));
  }, []);

  const categorias = ORDEM_CATEGORIAS.filter((cat) =>
    produtos.some((p) => p.categoria === cat)
  );

  const produtosPorCategoria = (categoria: string) =>
    produtos.filter((p) => p.categoria === categoria);

  const totalCarrinho = Array.from(carrinho.values()).reduce(
    (acc, item) => acc + Number(item.produto.preco) * item.quantidade,
    0
  );

  const qtdTotal = Array.from(carrinho.values()).reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  const adicionar = useCallback((produto: Produto) => {
    setCarrinho((prev) => {
      const next = new Map(prev);
      const existente = next.get(produto.id);
      if (existente) {
        next.set(produto.id, { ...existente, quantidade: existente.quantidade + 1 });
      } else {
        next.set(produto.id, { produto, quantidade: 1, observacao: "" });
      }
      return next;
    });
  }, []);

  const remover = useCallback((produtoId: string) => {
    setCarrinho((prev) => {
      const next = new Map(prev);
      const existente = next.get(produtoId);
      if (!existente) return prev;
      if (existente.quantidade === 1) {
        next.delete(produtoId);
      } else {
        next.set(produtoId, { ...existente, quantidade: existente.quantidade - 1 });
      }
      return next;
    });
  }, []);

  const enviarPedido = async () => {
    if (carrinho.size === 0) return;
    setEnviando(true);
    setErro(null);

    const itens = Array.from(carrinho.values()).map((item) => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
      observacao: observacoes.get(item.produto.id) || undefined,
    }));

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaNumero, itens }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar pedido");
      }

      setCarrinho(new Map());
      setObservacoes(new Map());
      setCarrinhoAberto(false);
      setPedidoEnviado(true);
      setTimeout(() => setPedidoEnviado(false), 4000);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoEnviado) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido enviado!</h2>
          <p className="text-gray-600 mb-1">Mesa <strong>{mesaNumero}</strong></p>
          <p className="text-gray-500 text-sm">
            Seu pedido foi recebido. Em breve nossos atendentes cuidarão de tudo!
          </p>
          <Button
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => setPedidoEnviado(false)}
          >
            Fazer mais pedidos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-32">
      {/* Header */}
      <header className="bg-amber-800 text-white sticky top-0 z-40 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beer className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg leading-none">Estação do Chopp</p>
                <p className="text-amber-200 text-xs">Mesa {mesaNumero}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de categoria */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-3 pb-3 min-w-max">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoriaAtiva === cat
                    ? "bg-white text-amber-800"
                    : "text-amber-100 hover:bg-amber-700"
                }`}
              >
                {CATEGORIA_EMOJI[cat]} {CATEGORIA_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="px-4 py-4">
        <h2 className="text-lg font-bold text-amber-900 mb-3">
          {CATEGORIA_EMOJI[categoriaAtiva]} {CATEGORIA_LABELS[categoriaAtiva]}
        </h2>

        <div className="flex flex-col gap-3">
          {produtosPorCategoria(categoriaAtiva).map((produto) => {
            const itemCarrinho = carrinho.get(produto.id);
            return (
              <div
                key={produto.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex"
              >
                {produto.imagemUrl && (
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    <Image
                      src={produto.imagemUrl}
                      alt={produto.nome}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{produto.nome}</p>
                    {produto.descricao && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{produto.descricao}</p>
                    )}
                    <p className="text-amber-700 font-bold text-sm mt-1">
                      {formatCurrency(produto.preco)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end mt-2">
                    {itemCarrinho ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => remover(produto.id)}
                          className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-amber-800 w-5 text-center">
                          {itemCarrinho.quantidade}
                        </span>
                        <button
                          onClick={() => adicionar(produto)}
                          className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => adicionar(produto)}
                        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Carrinho flutuante */}
      {qtdTotal > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Painel do carrinho */}
          {carrinhoAberto && (
            <div className="bg-white border-t shadow-2xl max-h-[70vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 text-base">Seu pedido</h3>
                  <button onClick={() => setCarrinhoAberto(false)}>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {Array.from(carrinho.values()).map((item) => (
                  <div key={item.produto.id} className="mb-4 pb-4 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-800">{item.produto.nome}</p>
                      <p className="text-amber-700 font-semibold text-sm">
                        {formatCurrency(Number(item.produto.preco) * item.quantidade)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => remover(item.produto.id)}
                        className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantidade}</span>
                      <button
                        onClick={() => adicionar(item.produto)}
                        className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-400 ml-1">
                        × {formatCurrency(item.produto.preco)}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Observação (opcional)"
                      className="mt-2 text-xs min-h-[40px] h-[40px] resize-none"
                      value={observacoes.get(item.produto.id) ?? ""}
                      onChange={(e) =>
                        setObservacoes((prev) => {
                          const next = new Map(prev);
                          next.set(item.produto.id, e.target.value);
                          return next;
                        })
                      }
                    />
                  </div>
                ))}

                {erro && (
                  <p className="text-red-500 text-sm mb-3 text-center">{erro}</p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="font-bold text-amber-700 text-lg">
                    {formatCurrency(totalCarrinho)}
                  </span>
                </div>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-base font-bold"
                  onClick={enviarPedido}
                  disabled={enviando}
                >
                  {enviando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar pedido — Mesa {mesaNumero}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Botão do carrinho */}
          <button
            onClick={() => setCarrinhoAberto(!carrinhoAberto)}
            className="w-full bg-amber-500 text-white flex items-center justify-between px-5 py-4 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-white text-amber-700 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {qtdTotal}
                </span>
              </div>
              <span className="font-semibold">Ver carrinho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatCurrency(totalCarrinho)}</span>
              {carrinhoAberto ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
