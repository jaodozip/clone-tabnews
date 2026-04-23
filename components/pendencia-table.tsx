"use client";

import { PendenciaCarga, PendenciaKing } from "@/lib/types";
import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type AnyPendencia = PendenciaCarga | PendenciaKing;

interface PendenciaTableProps {
  data: AnyPendencia[];
  isLoading?: boolean;
  showDescricao?: boolean;
  title?: string;
  maxRows?: number;
}

function isCarga(item: AnyPendencia): item is PendenciaCarga {
  return "carga" in item;
}

export function PendenciaTable({
  data,
  isLoading,
  showDescricao = true,
  title,
  maxRows,
}: PendenciaTableProps) {
  const sorted = [...data].sort((a, b) => {
    if (a.atraso === b.atraso) return 0;
    return a.atraso === "SIM" ? -1 : 1;
  });

  const rows = maxRows ? sorted.slice(0, maxRows) : sorted;

  const totalPendente = data.reduce((s, r) => s + r.qtde_pendente, 0);
  const totalAtrasados = data.filter((r) => r.atraso === "SIM").length;
  const pctAtraso = data.length ? Math.round((totalAtrasados / data.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full rounded-xl border overflow-hidden" style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{title}</h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: "#94A3B8" }}>
            <span>{data.length} lotes</span>
            <span className="font-mono">{totalPendente.toLocaleString("pt-BR")} un</span>
            {totalAtrasados > 0 && (
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                {totalAtrasados} atrasado{totalAtrasados > 1 ? "s" : ""} ({pctAtraso}%)
              </span>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#6366F1" }} />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center" style={{ color: "#475569" }}>
          <p className="text-sm">Sem dados</p>
        </div>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Atraso</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Lote</th>
                {isCarga(rows[0]) && (
                  <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Carga</th>
                )}
                <th className="text-right px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Pendente</th>
                {showDescricao && isCarga(rows[0]) && (
                  <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Descrição</th>
                )}
                {isCarga(rows[0]) && "dt_preparacao" in rows[0] && (
                  <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "#94A3B8" }}>Data</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => {
                const atrasado = item.atraso === "SIM";
                return (
                  <tr
                    key={`${item.num_lote_pro}-${i}`}
                    className={cn(
                      "border-b transition-colors hover:bg-white/[0.03]",
                      atrasado && "atraso-pulse"
                    )}
                    style={{
                      borderColor: "rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <td className="px-4 py-2.5">
                      {atrasado ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#EF4444" }}>
                          <AlertCircle size={12} />SIM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#10B981" }}>
                          <CheckCircle2 size={12} />NÃO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "#F8FAFC" }}>
                      {item.num_lote_pro}
                    </td>
                    {isCarga(item) && (
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "#94A3B8" }}>
                        {item.carga}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: "#F8FAFC" }}>
                      {item.qtde_pendente.toLocaleString("pt-BR")}
                    </td>
                    {showDescricao && isCarga(item) && (
                      <td className="px-4 py-2.5 max-w-xs truncate text-xs" style={{ color: "#94A3B8" }}>
                        {item.descricao || item.desc_carga || "—"}
                      </td>
                    )}
                    {isCarga(item) && item.dt_preparacao && (
                      <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "#475569" }}>
                        {new Date(item.dt_preparacao).toLocaleDateString("pt-BR")}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
