import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.FOCCO_BASE_URL!;
const APT = process.env.FOCCO_APONTAMENTO_URL!;
const CHAVE = process.env.FOCCO_CHAVE!;

type RouteConfig = { url: string; params: Record<string, string> };

function buildConfig(slug: string): RouteConfig | null {
  const p = (extra?: Record<string, string>): Record<string, string> => ({
    chave: CHAVE,
    ...extra,
  });

  switch (slug) {
    case "pend-zp-1":
      return { url: `${BASE}/api_qtde_pend_zp`, params: p({ EMPR_ID: "1" }) };
    case "pend-zp-301":
      return { url: `${BASE}/api_qtde_pend_zp`, params: p({ EMPR_ID: "301" }) };
    case "pend-king":
      return { url: `${BASE}/api_qtde_pend_king`, params: p({ EMPR_ID: "601" }) };
    case "sofa-1":
      return { url: `${BASE}/prod_entrega_sofa`, params: p({ EMPR_ID: "1" }) };
    case "sofa-601":
      return { url: `${BASE}/prod_entrega_sofa`, params: p({ EMPR_ID: "601" }) };
    case "cab-1":
      return { url: `${BASE}/prod_entrega_cab`, params: p({ EMPR_ID: "1" }) };
    case "cab-601":
      return { url: `${BASE}/prod_entrega_cab`, params: p({ EMPR_ID: "601" }) };
    case "entrega-201":
      return { url: `${BASE}/api_entrega_producao`, params: p({ EMPR_ID: "201" }) };
    case "entrega-351":
      return { url: `${BASE}/api_entrega_producao`, params: p({ EMPR_ID: "351" }) };
    case "qtde-geral":
      return { url: `${BASE}/api_qtde_geral_zp_kh`, params: p() };
    case "pedidos-pendentes":
      return { url: `${BASE}/api_pedidos_pendentes`, params: p() };
    case "tb-div-1":
      return { url: `${BASE}/gw_com_tb_d_1`, params: p() };
    case "tb-div-201":
      return { url: `${BASE}/gw_com_tb_d_201`, params: p() };
    case "tb-div-301":
      return { url: `${BASE}/gw_com_tb_d_301`, params: p() };
    case "tb-div-351":
      return { url: `${BASE}/gw_com_tb_d_351`, params: p() };
    case "tb-div-801":
      return { url: `${BASE}/gw_com_tb_d_801`, params: p() };
    case "emb-01":
    case "emb-02":
    case "emb-03":
    case "emb-04":
    case "emb-05": {
      const n = slug.split("-")[1];
      return {
        url: `${APT}/indicadores`,
        params: { celula: `EMB${n}` },
      };
    }
    default:
      return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const config = buildConfig(params.slug);
  if (!config) {
    return NextResponse.json({ error: "Unknown slug" }, { status: 404 });
  }

  const qs = new URLSearchParams(config.params).toString();
  const url = `${config.url}?${qs}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { value: [], succeeded: false, errorMessage: message },
      { status: 200 }
    );
  }
}
