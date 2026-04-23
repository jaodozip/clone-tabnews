"use client";

import { TabelaDivergente } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DivergenciaTableProps {
  data: TabelaDivergente[];
  isLoading?: boolean;
}

export function DivergenciaTable({ data, isLoading }: DivergenciaTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#6366F1" }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm" style={{ color: "#475569" }}>
        Sem divergências
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Tabela", "Item", "Descrição", "Máscara", "Preço Base", "Preço Div.", "Diferença", "%"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 font-medium" style={{ color: "#94A3B8" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const diff = row.preco_divergente - row.preco;
            const pct = row.preco > 0 ? ((diff / row.preco) * 100).toFixed(1) : "—";
            const positive = diff > 0;
            const diffColor = diff === 0 ? "#94A3B8" : positive ? "#10B981" : "#EF4444";

            return (
              <tr
                key={`${row.codigo_item}-${i}`}
                className="border-b hover:bg-white/[0.03] transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.04)",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <td className="px-3 py-2 font-mono" style={{ color: "#94A3B8" }}>
                  {row.descricao_tabela_venda}
                </td>
                <td className="px-3 py-2 font-mono" style={{ color: "#F8FAFC" }}>
                  {row.codigo_item}
                </td>
                <td className="px-3 py-2 max-w-[200px] truncate" style={{ color: "#94A3B8" }}>
                  {row.descricao}
                </td>
                <td className="px-3 py-2 font-mono" style={{ color: "#475569" }}>
                  {row.mascara}
                </td>
                <td className="px-3 py-2 font-mono text-right" style={{ color: "#F8FAFC" }}>
                  {row.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-3 py-2 font-mono text-right" style={{ color: "#F8FAFC" }}>
                  {row.preco_divergente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-3 py-2 font-mono text-right">
                  <span className="inline-flex items-center gap-1" style={{ color: diffColor }}>
                    {diff > 0 ? <TrendingUp size={12} /> : diff < 0 ? <TrendingDown size={12} /> : null}
                    {diff.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-right font-semibold" style={{ color: diffColor }}>
                  {pct !== "—" ? `${positive ? "+" : ""}${pct}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
