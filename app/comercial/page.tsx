"use client";

import { useState } from "react";
import { useFocco } from "@/hooks/use-focco";
import { PendenciaCarga, PendenciaKing } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { PendenciaTable } from "@/components/pendencia-table";
import { useSettings } from "@/lib/settings-store";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "zp", label: "ZP BICAIO", slug: "pend-zp-1" as const, color: "#6366F1" },
  { id: "hellen", label: "HELLEN", slug: "entrega-201" as const, color: "#10B981" },
  { id: "king", label: "KING HOUSE", slug: "pend-king" as const, color: "#F59E0B" },
  { id: "konfort", label: "KING KONFORT", slug: "entrega-351" as const, color: "#8B5CF6" },
  { id: "siniflex", label: "SINIFLEX", slug: "pend-zp-301" as const, color: "#06B6D4" },
];

function TabContent({
  slug,
  color,
}: {
  slug: typeof TABS[number]["slug"];
  color: string;
}) {
  const { data, isLoading } = useFocco<PendenciaCarga | PendenciaKing>(slug, 30000);

  const totalPendente = data.reduce((s, r) => s + r.qtde_pendente, 0);
  const atrasados = data.filter((r) => r.atraso === "SIM").length;
  const pctAtraso = data.length ? Math.round((atrasados / data.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total de Lotes", value: data.length, mono: true },
          { label: "Qtde. Pendente", value: totalPendente.toLocaleString("pt-BR") + " un", mono: true },
          {
            label: "% Atrasados",
            value: `${atrasados} lotes (${pctAtraso}%)`,
            mono: false,
            warn: atrasados > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl p-3 border"
            style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "#94A3B8" }}>{s.label}</p>
            <p
              className={cn("font-semibold text-lg", s.mono && "font-mono")}
              style={{ color: s.warn ? "#EF4444" : "#F8FAFC" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <PendenciaTable
          data={data as PendenciaCarga[]}
          isLoading={isLoading}
          showDescricao
        />
      </div>
    </div>
  );
}

export default function ComercialPage() {
  const { settings } = useSettings();
  const [active, setActive] = useState("zp");

  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0B0F1A" }}>
      <PageHeader title={settings.title} logoUrl={settings.logoUrl} />

      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border",
                active === tab.id
                  ? "border-transparent text-white"
                  : "hover:bg-white/5"
              )}
              style={
                active === tab.id
                  ? { background: tab.color, borderColor: "transparent", color: "#fff" }
                  : { background: "#1A2234", borderColor: "rgba(255,255,255,0.06)", color: "#94A3B8" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0">
          <TabContent slug={activeTab.slug} color={activeTab.color} />
        </div>
      </div>
    </div>
  );
}
