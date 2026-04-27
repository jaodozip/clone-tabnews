import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const produtos = await prisma.produto.findMany({
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { nome: "asc" }],
  });
  return NextResponse.json(produtos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).papel !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nome, descricao, preco, categoria, imagemUrl, disponivel, ordem } = body;

  if (!nome || !preco || !categoria) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const produto = await prisma.produto.create({
    data: { nome, descricao, preco: Number(preco), categoria, imagemUrl, disponivel, ordem: ordem ?? 0 },
  });

  return NextResponse.json(produto, { status: 201 });
}
