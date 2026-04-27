import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/comandas?mesaNumero=7  → comanda aberta da mesa
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mesaNumero = searchParams.get("mesaNumero");

  if (mesaNumero) {
    const mesa = await prisma.mesa.findUnique({ where: { numero: Number(mesaNumero) } });
    if (!mesa) return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });

    const comanda = await prisma.comanda.findFirst({
      where: { mesaId: mesa.id, fechadaEm: null },
      include: {
        itensPedido: {
          include: { produto: true },
          orderBy: { criadoEm: "asc" },
        },
        mesa: true,
      },
    });
    return NextResponse.json(comanda);
  }

  // Sem filtro: retorna todas as comandas abertas (para o painel)
  const comandas = await prisma.comanda.findMany({
    where: { fechadaEm: null },
    include: {
      mesa: true,
      itensPedido: {
        include: { produto: true },
        orderBy: { criadoEm: "desc" },
      },
    },
    orderBy: { abertaEm: "asc" },
  });
  return NextResponse.json(comandas);
}
