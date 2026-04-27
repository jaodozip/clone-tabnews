import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sseEmitter } from "@/lib/sse";

// POST /api/pedidos  → cliente envia pedido
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mesaNumero, itens } = body as {
    mesaNumero: number;
    itens: { produtoId: string; quantidade: number; observacao?: string }[];
  };

  if (!mesaNumero || !itens?.length) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const mesa = await prisma.mesa.findUnique({ where: { numero: mesaNumero } });
  if (!mesa) return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });

  // Garante que há uma comanda aberta para a mesa
  let comanda = await prisma.comanda.findFirst({
    where: { mesaId: mesa.id, fechadaEm: null },
  });

  if (!comanda) {
    comanda = await prisma.comanda.create({ data: { mesaId: mesa.id } });
    await prisma.mesa.update({ where: { id: mesa.id }, data: { status: "ABERTA" } });
  }

  // Busca preços atuais dos produtos
  const produtoIds = itens.map((i) => i.produtoId);
  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds }, disponivel: true },
  });

  if (produtos.length !== produtoIds.length) {
    return NextResponse.json({ error: "Um ou mais produtos não disponíveis" }, { status: 400 });
  }

  const precoMap = new Map(produtos.map((p) => [p.id, p.preco]));

  const itensCriados = await prisma.$transaction(
    itens.map((item) =>
      prisma.itemPedido.create({
        data: {
          comandaId: comanda!.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: precoMap.get(item.produtoId)!,
          observacao: item.observacao,
          status: "RECEBIDO",
        },
        include: { produto: true },
      })
    )
  );

  // Notifica o painel via SSE
  sseEmitter.emit("novo-pedido", {
    mesaNumero,
    comandaId: comanda.id,
    itens: itensCriados,
  });

  return NextResponse.json({ ok: true, comandaId: comanda.id, itens: itensCriados }, { status: 201 });
}
