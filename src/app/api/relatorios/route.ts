import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).papel !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data"); // YYYY-MM-DD

  const inicio = data ? new Date(`${data}T00:00:00`) : new Date(new Date().setHours(0, 0, 0, 0));
  const fim = data ? new Date(`${data}T23:59:59`) : new Date(new Date().setHours(23, 59, 59, 999));

  // Itens entregues no período
  const itens = await prisma.itemPedido.findMany({
    where: {
      status: "ENTREGUE",
      criadoEm: { gte: inicio, lte: fim },
    },
    include: { produto: true },
  });

  // Agrupa por produto
  const mapaVendas = new Map<
    string,
    { produto: { nome: string; categoria: string }; quantidade: number; total: number }
  >();

  for (const item of itens) {
    const key = item.produtoId;
    const existing = mapaVendas.get(key);
    const subtotal = Number(item.precoUnitario) * item.quantidade;
    if (existing) {
      existing.quantidade += item.quantidade;
      existing.total += subtotal;
    } else {
      mapaVendas.set(key, {
        produto: { nome: item.produto.nome, categoria: item.produto.categoria },
        quantidade: item.quantidade,
        total: subtotal,
      });
    }
  }

  const ranking = Array.from(mapaVendas.values()).sort((a, b) => b.quantidade - a.quantidade);
  const totalNoite = ranking.reduce((acc, v) => acc + v.total, 0);

  // Comandas fechadas no período
  const comandasFechadas = await prisma.comanda.findMany({
    where: { fechadaEm: { gte: inicio, lte: fim } },
    include: { mesa: true },
  });

  return NextResponse.json({
    data: inicio.toISOString().split("T")[0],
    totalNoite,
    totalComandas: comandasFechadas.length,
    produtosMaisVendidos: ranking.slice(0, 10),
  });
}
