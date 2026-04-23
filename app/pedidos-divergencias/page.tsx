"use client";

import { useState } from "react";
import { useFocco } from "@/hooks/use-focco";
import { PedidoPendente, TabelaDivergente } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { DivergenciaTable } from "@/components/divergencia-table";
import { useSettings } from "@/lib/settings-store";
import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

const PILL_FILTERS = [
  { id: "TODOS", label: "Todos" },
  { id: "PENDENTE", label: "Pendentes" },
  { id: "FATURADO", label: "Faturados" },
] as const;

const DIV_TABS = [
  { id: "1", slug: "tb-div-1" as const, label: "ZP (1)" },
  { id: "201", slug: "tb-div-201" as const, label: "HELLEN (201)" },
  { id: "301", slug: "tb-div-301" as const, label: "SINIFLEX (301)" },
  { id: "351", slug: "tb-div-351" as const, label: "KONFORT (351)" },
  { id: "801", slug: "tb-div-801" as const, label: "Emp. 801" },
];

function diasColor(dias: number): string {
  if (dias > 90) return "#EF4444";
  if (dias > 30) return "#F59E0B";
  return "#94A3B8";
}

function PedidosSection() {
  const [filter, setFilter] = useState<"TODOS" | "PENDENTE" | "FATURADO">("TODOS");
  const { data, isLoading } = useFocco<PedidoPendente>("pedidos-pendentes", 30000);

  const filtered = filter === "TODOS" ? data : data.filter((r) => r["posição"] === filter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Pedidos Pendentes</h2>
        <div className="flex gap-2">
          {PILL_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                filter === f.id ? "text-white" : "hover:bg-white/5"
              )}
              style={
                filter === f.id
                  ? { background: "#6366F1", color: "#fff" }
                  : { background: "#1A2234", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {f.label}
              {f.id !== "TODOS" && (
                <span className="ml-1 opacity-70">
                  ({data.filter((r) => f.id === "TODOS" || r["posição"] === f.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#6366F1" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "#475569" }}>
          Sem pedidos
        </div>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Nº Pedido", "Cliente", "Emissão", "Entrega", "Dias", "Obs", "Status"].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 font-medium" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const dc = diasColor(row.dias);
                const faturado = row["posição"] === "FATURADO";
                return (
                  <tr
                    key={`${row.num_pedido}-${i}`}
                    className="border-b hover:bg-white/[0.03] transition-colors"
                    style={{
                      borderColor: "rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <td className="px-3 py-2 font-mono font-semibold" style={{ color: "#F8FAFC" }}>
                      {row.num_pedido}
                    </td>
                    <td className="px-3 py-2 max-w-[180px] truncate" style={{ color: "#94A3B8" }}>
                      {row.cliente}
                    </td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#475569" }}>
                      {row.dt_emis_pdv}
                    </td>
                    <td className="px-3 py-2 font-mono" style={{ color: "#475569" }}>
                      {row.dt_entrega}
                    </td>
                    <td className="px-3 py-2 font-mono font-bold" style={{ color: dc }}>
                      {row.dias.toLocaleString("pt-BR")}d
                    </td>
                    <td className="px-3 py-2" style={{ color: "#94A3B8" }}>
                      {row.obs || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {faturado ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#10B981" }}>
                          <CheckCircle2 size={11} /> FATURADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#F59E0B" }}>
                          <Clock3 size={11} /> PENDENTE
                        </span>
                      )}
                    </td>
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

function DivergenciasSection() {
  const [active, setActive] = useState("1");
  const activeTab = DIV_TABS.find((t) => t.id === active)!;
  const { data, isLoading } = useFocco<TabelaDivergente>(activeTab.slug, 60000);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Tabelas de Preço Divergentes</h2>
        <div className="flex gap-2">
          {DIV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                active === tab.id ? "text-white" : "hover:bg-white/5"
              )}
              style={
                active === tab.id
                  ? { background: "#6366F1", color: "#fff" }
                  : { background: "#1A2234", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <DivergenciaTable data={data} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default function PedidosDivergenciasPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col h-full" style={{ background: "#0B0F1A" }}>
      <PageHeader title={settings.title} logoUrl={settings.logoUrl} />

      <div className="flex-1 overflow-hidden grid grid-rows-2 gap-0 p-4 gap-4">
        {/* Top half: Pedidos */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <PedidosSection />
        </div>

        {/* Bottom half: Divergências */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <DivergenciasSection />
        </div>
      </div>
    </div>
  );
}
