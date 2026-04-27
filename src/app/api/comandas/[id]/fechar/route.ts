import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseEmitter } from "@/lib/sse";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const comanda = await prisma.comanda.findUnique({
    where: { id: params.id },
    include: { itensPedido: true, mesa: true },
  });

  if (!comanda || comanda.fechadaEm) {
    return NextResponse.json({ error: "Comanda não encontrada ou já fechada" }, { status: 404 });
  }

  const total = comanda.itensPedido.reduce(
    (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
    0
  );

  const [comandaFechada] = await prisma.$transaction([
    prisma.comanda.update({
      where: { id: params.id },
      data: { fechadaEm: new Date(), total },
    }),
    prisma.mesa.update({
      where: { id: comanda.mesaId },
      data: { status: "FECHADA" },
    }),
  ]);

  sseEmitter.emit("mesa-fechada", { mesaId: comanda.mesaId, mesaNumero: comanda.mesa.numero });

  return NextResponse.json(comandaFechada);
}
