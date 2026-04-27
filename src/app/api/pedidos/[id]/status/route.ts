import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseEmitter } from "@/lib/sse";

const TRANSICOES_VALIDAS: Record<string, string> = {
  RECEBIDO: "EM_PREPARO",
  EM_PREPARO: "ENTREGUE",
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { status } = await req.json();

  const item = await prisma.itemPedido.findUnique({
    where: { id: params.id },
    include: { comanda: { include: { mesa: true } } },
  });

  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

  if (status === "CANCELADO") {
    const updated = await prisma.itemPedido.update({
      where: { id: params.id },
      data: { status: "CANCELADO" },
      include: { produto: true, comanda: { include: { mesa: true } } },
    });
    sseEmitter.emit("status-atualizado", updated);
    return NextResponse.json(updated);
  }

  const proximoStatus = TRANSICOES_VALIDAS[item.status];
  if (!proximoStatus) {
    return NextResponse.json({ error: "Transição inválida" }, { status: 400 });
  }

  const updated = await prisma.itemPedido.update({
    where: { id: params.id },
    data: { status: proximoStatus as any },
    include: { produto: true, comanda: { include: { mesa: true } } },
  });

  sseEmitter.emit("status-atualizado", updated);
  return NextResponse.json(updated);
}
