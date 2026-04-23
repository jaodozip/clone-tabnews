import { FoccoResponse } from "./types";

export type FoccoSlug =
  | "pend-zp-1"
  | "pend-zp-301"
  | "pend-king"
  | "sofa-1"
  | "sofa-601"
  | "cab-1"
  | "cab-601"
  | "entrega-201"
  | "entrega-351"
  | "qtde-geral"
  | "pedidos-pendentes"
  | "tb-div-1"
  | "tb-div-201"
  | "tb-div-301"
  | "tb-div-351"
  | "tb-div-801"
  | "emb-01"
  | "emb-02"
  | "emb-03"
  | "emb-04"
  | "emb-05";

export async function fetchFocco<T>(slug: FoccoSlug): Promise<FoccoResponse<T>> {
  const res = await fetch(`/api/focco/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
