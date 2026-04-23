"use client";

import { useFocco } from "@/hooks/use-focco";
import { Apontamento } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { ApontamentoCard } from "@/components/apontamento-card";
import { useSettings } from "@/lib/settings-store";

const EMB_SLUGS = ["emb-01", "emb-02", "emb-03", "emb-04", "emb-05"] as const;

function EmbCard({ slug, index, meta, primaryColor }: {
  slug: typeof EMB_SLUGS[number];
  index: number;
  meta: number;
  primaryColor: string;
}) {
  const { data, isLoading } = useFocco<Apontamento>(slug, 5000);
  const value = data[0]?.numero ?? 0;

  return (
    <ApontamentoCard
      label={`EMBALAGEM ${index + 1}`}
      value={value}
      meta={meta}
      isLoading={isLoading}
      primaryColor={primaryColor}
    />
  );
}

export default function ApontamentoPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col h-full" style={{ background: "#0B0F1A" }}>
      <PageHeader title={settings.title} logoUrl={settings.logoUrl} />

      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-sm font-semibold mb-4 text-center" style={{ color: "#94A3B8" }}>
          CONTROLE DE EMBALAGEM — KING HOUSE
        </h2>
        <div className="grid grid-cols-5 gap-4 h-full max-h-[520px]">
          {EMB_SLUGS.map((slug, i) => (
            <EmbCard
              key={slug}
              slug={slug}
              index={i}
              meta={settings.embMetas[i] ?? 100}
              primaryColor={settings.primaryColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
