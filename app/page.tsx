"use client";

import { useFocco } from "@/hooks/use-focco";
import { QtdeGauge, QtdeGeral, PendenciaCarga } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { GaugeCard } from "@/components/gauge-card";
import { PendenciaTable } from "@/components/pendencia-table";
import { StatCard } from "@/components/stat-card";
import { useSettings } from "@/lib/settings-store";
import { Package, Layers, TrendingUp, AlertTriangle } from "lucide-react";

export default function OperacaoPage() {
  const { settings } = useSettings();

  const sofa1 = useFocco<QtdeGauge>("sofa-1", 5000);
  const sofa601 = useFocco<QtdeGauge>("sofa-601", 5000);
  const cab1 = useFocco<QtdeGauge>("cab-1", 5000);
  const cab601 = useFocco<QtdeGauge>("cab-601", 5000);
  const qtdeGeral = useFocco<QtdeGeral>("qtde-geral", 5000);
  const pendZp1 = useFocco<PendenciaCarga>("pend-zp-1", 5000);
  const pend301 = useFocco<PendenciaCarga>("pend-zp-301", 5000);
  const pendKing = useFocco<{ empr_id: number; num_lote_pro: number; qtde_pendente: number; atraso: "SIM" | "NAO" }>("pend-king", 5000);
  const entrega201 = useFocco<PendenciaCarga>("entrega-201", 5000);
  const entrega351 = useFocco<PendenciaCarga>("entrega-351", 5000);

  const sofaTotal = (sofa1.data[0]?.qtde ?? 0) + (sofa601.data[0]?.qtde ?? 0);
  const cabTotal = (cab1.data[0]?.qtde ?? 0) + (cab601.data[0]?.qtde ?? 0);
  const geralTotal = qtdeGeral.data[0]?.qtde_geral ?? 0;

  const sofaMetaTotal = settings.sofaMeta1 + settings.sofaMeta601;

  const totalZp = pendZp1.data.reduce((s, r) => s + r.qtde_pendente, 0);
  const total301 = pend301.data.reduce((s, r) => s + r.qtde_pendente, 0);
  const totalKing = pendKing.data.reduce((s, r) => s + r.qtde_pendente, 0);
  const total201 = entrega201.data.reduce((s, r) => s + r.qtde_pendente, 0);
  const total351 = entrega351.data.reduce((s, r) => s + r.qtde_pendente, 0);

  const atrasadosZp = pendZp1.data.filter((r) => r.atraso === "SIM").length;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0B0F1A" }}>
      <PageHeader title={settings.title} logoUrl={settings.logoUrl} />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Linha 1: Gauges */}
        <div className="grid grid-cols-3 gap-4">
          <GaugeCard
            title="SOFÁ Total"
            value={sofaTotal}
            max={sofaMetaTotal}
            unit="un"
            subtitle={`ZP: ${sofa1.data[0]?.qtde ?? 0} | King: ${sofa601.data[0]?.qtde ?? 0}`}
            isLoading={sofa1.isLoading || sofa601.isLoading}
          />
          <GaugeCard
            title="CABECEIRA Total"
            value={cabTotal}
            max={settings.cabMeta}
            unit="un"
            subtitle={`ZP: ${cab1.data[0]?.qtde ?? 0} | King: ${cab601.data[0]?.qtde ?? 0}`}
            isLoading={cab1.isLoading || cab601.isLoading}
          />
          <GaugeCard
            title="Produção Geral"
            value={geralTotal}
            max={sofaMetaTotal + settings.cabMeta}
            unit="un"
            subtitle="Total ZP + King House"
            isLoading={qtdeGeral.isLoading}
          />
        </div>

        {/* Linha 2: Tabela + Mini-cards */}
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: "400px" }}>
          <div className="col-span-8 min-h-0">
            <PendenciaTable
              title="Pendências ZP BICAIO"
              data={pendZp1.data}
              isLoading={pendZp1.isLoading}
              showDescricao
            />
          </div>

          <div className="col-span-4 grid grid-cols-2 gap-3 content-start">
            <StatCard
              title="ZP BICAIO"
              value={totalZp}
              unit="un"
              icon={Package}
              color="#6366F1"
              isLoading={pendZp1.isLoading}
              className="col-span-2"
            />
            {atrasadosZp > 0 && (
              <StatCard
                title="Atrasados ZP"
                value={atrasadosZp}
                unit="lotes"
                icon={AlertTriangle}
                color="#EF4444"
                className="col-span-2"
              />
            )}
            <StatCard
              title="SINIFLEX"
              value={total301}
              unit="un"
              icon={Layers}
              color="#06B6D4"
              isLoading={pend301.isLoading}
            />
            <StatCard
              title="KING"
              value={totalKing}
              unit="un"
              icon={Package}
              color="#F59E0B"
              isLoading={pendKing.isLoading}
            />
            <StatCard
              title="HELLEN"
              value={total201}
              unit="un"
              icon={TrendingUp}
              color="#10B981"
              isLoading={entrega201.isLoading}
            />
            <StatCard
              title="KING KONFORT"
              value={total351}
              unit="un"
              icon={Package}
              color="#8B5CF6"
              isLoading={entrega351.isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
