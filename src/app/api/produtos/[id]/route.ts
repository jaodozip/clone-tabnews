import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).papel !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nome, descricao, preco, categoria, imagemUrl, disponivel, ordem } = body;

  const produto = await prisma.produto.update({
    where: { id: params.id },
    data: {
      nome,
      descricao,
      preco: preco !== undefined ? Number(preco) : undefined,
      categoria,
      imagemUrl,
      disponivel,
      ordem,
    },
  });

  return NextResponse.json(produto);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).papel !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.produto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
