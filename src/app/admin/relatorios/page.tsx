"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { formatCurrency, CATEGORIA_LABELS, CATEGORIA_EMOJI } from "@/lib/utils";

type Relatorio = {
  data: string;
  totalNoite: number;
  totalComandas: number;
  produtosMaisVendidos: {
    produto: { nome: string; categoria: string };
    quantidade: number;
    total: number;
  }[];
};

export default function RelatoriosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.papel !== "ADMIN") router.push("/painel");
  }, [status, session, router]);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/relatorios?data=${dataSelecionada}`);
      setRelatorio(await res.json());
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") carregar();
  }, [status, dataSelecionada]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">Relatórios</h1>
          <div className="ml-auto">
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {carregando && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        )}

        {relatorio && !carregando && (
          <>
            {/* Cards de resumo */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" /> Total da noite
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(relatorio.totalNoite)}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <ShoppingBag className="w-4 h-4" /> Comandas fechadas
                </div>
                <p className="text-2xl font-bold text-blue-400">{relatorio.totalComandas}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" /> Itens diferentes
                </div>
                <p className="text-2xl font-bold text-amber-400">
                  {relatorio.produtosMaisVendidos.length}
                </p>
              </div>
            </div>

            {/* Ranking de produtos */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Produtos mais vendidos
                </h2>
              </div>
              {relatorio.produtosMaisVendidos.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Nenhuma venda registrada nesta data.</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {relatorio.produtosMaisVendidos.map((v, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-700 w-8 text-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{v.produto.nome}</p>
                        <p className="text-xs text-gray-500">
                          {CATEGORIA_EMOJI[v.produto.categoria]}{" "}
                          {CATEGORIA_LABELS[v.produto.categoria]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-400">{v.quantidade}x</p>
                        <p className="text-xs text-gray-400">{formatCurrency(v.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
