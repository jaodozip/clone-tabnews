export type PendenciaCarga = {
  empr_id: number;
  num_lote_pro: number;
  qtde_pendente: number;
  carga: number;
  descricao?: string;
  desc_carga?: string;
  dt_preparacao: string;
  atraso: "SIM" | "NAO";
  king_house?: "SIM" | "NAO";
};

export type PendenciaKing = {
  empr_id: number;
  num_lote_pro: number;
  qtde_pendente: number;
  atraso: "SIM" | "NAO";
};

export type QtdeGauge = { empr_id: number; qtde: number };
export type QtdeGeral = { qtde_geral: number };

export type PedidoPendente = {
  empr_id: number;
  num_pedido: number;
  cliente: string;
  dt_emis_pdv: string;
  dt_entrega: string;
  dias: number;
  obs: string | null;
  "posição": "PENDENTE" | "FATURADO";
};

export type TabelaDivergente = {
  codigo_tabela_venda: number;
  descricao_tabela_venda: string;
  empresa_base: number;
  codigo_item: string;
  descricao: string;
  mascara: string;
  preco: number;
  preco_divergente: number;
  empresa_divergente: number;
  codigo_tabela_venda_referencia: number;
};

export type Apontamento = { numero: number };

export type FoccoResponse<T> = {
  value: T[];
  succeeded: boolean;
  errorMessage: string;
};

export type DashboardSettings = {
  title: string;
  logoUrl: string;
  primaryColor: string;
  rotationInterval: number;
  sofaMeta1: number;
  sofaMeta601: number;
  cabMeta: number;
  embMetas: number[];
};

export const DEFAULT_SETTINGS: DashboardSettings = {
  title: process.env.NEXT_PUBLIC_APP_TITLE || "Painel de Produção",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#6366F1",
  rotationInterval: 30,
  sofaMeta1: 200,
  sofaMeta601: 650,
  cabMeta: 20,
  embMetas: [100, 100, 100, 100, 100],
};
