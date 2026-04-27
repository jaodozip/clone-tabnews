import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const CATEGORIA_LABELS: Record<string, string> = {
  CHOPP: "Chopps",
  CERVEJA: "Cervejas",
  BEBIDA: "Bebidas",
  ESPETINHO: "Espetinhos",
  PORCAO: "Porções",
};

export const CATEGORIA_EMOJI: Record<string, string> = {
  CHOPP: "🍺",
  CERVEJA: "🍻",
  BEBIDA: "🥤",
  ESPETINHO: "🍢",
  PORCAO: "🍽️",
};

export const STATUS_LABELS: Record<string, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const STATUS_COLORS: Record<string, string> = {
  RECEBIDO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  EM_PREPARO: "bg-blue-100 text-blue-800 border-blue-200",
  ENTREGUE: "bg-green-100 text-green-800 border-green-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
};

// Categorias que vão para a cozinha
export const CATEGORIAS_COZINHA = ["ESPETINHO", "PORCAO"];
// Categorias que ficam no bar
export const CATEGORIAS_BAR = ["CHOPP", "CERVEJA", "BEBIDA"];
