import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  const mesas = await prisma.mesa.findMany({
    orderBy: { numero: "asc" },
    include: {
      comandas: {
        where: { fechadaEm: null },
        take: 1,
      },
    },
  });
  return NextResponse.json(mesas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).papel !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { numero } = await req.json();
  if (!numero) return NextResponse.json({ error: "Número é obrigatório" }, { status: 400 });

  const existe = await prisma.mesa.findUnique({ where: { numero } });
  if (existe) return NextResponse.json({ error: "Mesa já existe" }, { status: 409 });

  const mesaUrl = `${APP_URL}/mesa/${numero}`;
  const qrCodeUrl = await QRCode.toDataURL(mesaUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
  });

  const mesa = await prisma.mesa.create({ data: { numero, qrCodeUrl } });
  return NextResponse.json(mesa, { status: 201 });
}
