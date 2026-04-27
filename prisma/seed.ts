import { PrismaClient, Categoria, Papel } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const prisma = new PrismaClient();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Usuários ───────────────────────────────────────────────────────────────
  const usuarios = [
    {
      nome: "Admin",
      email: "admin@estacaodochopp.com",
      senha: await bcrypt.hash("admin123", 10),
      papel: Papel.ADMIN,
    },
    {
      nome: "João Atendente",
      email: "atendente@estacaodochopp.com",
      senha: await bcrypt.hash("atendente123", 10),
      papel: Papel.ATENDENTE,
    },
    {
      nome: "Maria Cozinha",
      email: "cozinha@estacaodochopp.com",
      senha: await bcrypt.hash("cozinha123", 10),
      papel: Papel.COZINHA,
    },
  ];

  for (const u of usuarios) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log("✅ Usuários criados");

  // ─── Produtos ───────────────────────────────────────────────────────────────
  // Limpa e recria para o seed ser idempotente
  await prisma.produto.deleteMany({});

  const produtos = [
    // Chopps
    { nome: "Chopp Pilsen 300ml", descricao: "Chopp gelado estilo Pilsen, leve e refrescante", preco: 9.9, categoria: Categoria.CHOPP, imagemUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", ordem: 1 },
    { nome: "Chopp Pilsen 500ml", descricao: "Chopp gelado estilo Pilsen no copo 500ml", preco: 14.9, categoria: Categoria.CHOPP, imagemUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", ordem: 2 },
    { nome: "Chopp Escuro 300ml", descricao: "Chopp escuro com notas de caramelo e malte torrado", preco: 11.9, categoria: Categoria.CHOPP, imagemUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400", ordem: 3 },
    { nome: "Chopp Escuro 500ml", descricao: "Chopp escuro encorpado no copo 500ml", preco: 17.9, categoria: Categoria.CHOPP, imagemUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400", ordem: 4 },
    { nome: "Chopp IPA 300ml", descricao: "Chopp artesanal estilo IPA, lupulado e aromático", preco: 13.9, categoria: Categoria.CHOPP, imagemUrl: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400", ordem: 5 },
    // Cervejas
    { nome: "Heineken Long Neck", descricao: "Cerveja holandesa premium 330ml", preco: 12.9, categoria: Categoria.CERVEJA, imagemUrl: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400", ordem: 1 },
    { nome: "Budweiser Long Neck", descricao: "A cerveja americana original 330ml", preco: 11.9, categoria: Categoria.CERVEJA, imagemUrl: "https://images.unsplash.com/photo-1566633806827-42e9e27cc824?w=400", ordem: 2 },
    { nome: "Corona Extra", descricao: "Cerveja mexicana refrescante 355ml", preco: 14.9, categoria: Categoria.CERVEJA, imagemUrl: "https://images.unsplash.com/photo-1532634741-c3e5bc62c85d?w=400", ordem: 3 },
    { nome: "Stella Artois 600ml", descricao: "Cerveja belga premium garrafa 600ml", preco: 19.9, categoria: Categoria.CERVEJA, imagemUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400", ordem: 4 },
    { nome: "Brahma 600ml", descricao: "A cerveja do Brasil, garrafa 600ml", preco: 13.9, categoria: Categoria.CERVEJA, imagemUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=400", ordem: 5 },
    // Bebidas
    { nome: "Água Mineral 500ml", descricao: "Água mineral sem gás", preco: 4.5, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", ordem: 1 },
    { nome: "Coca-Cola 350ml", descricao: "Refrigerante lata gelada", preco: 6.9, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400", ordem: 2 },
    { nome: "Suco de Laranja", descricao: "Suco de laranja natural 400ml", preco: 9.9, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400", ordem: 3 },
    { nome: "Caipirinha de Limão", descricao: "Caipirinha tradicional de cachaça com limão", preco: 18.9, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400", ordem: 4 },
    { nome: "Caipiroska de Morango", descricao: "Caipiroska de vodka com morango fresco", preco: 22.9, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400", ordem: 5 },
    { nome: "Red Bull 250ml", descricao: "Energético Red Bull lata 250ml", preco: 14.9, categoria: Categoria.BEBIDA, imagemUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400", ordem: 6 },
    // Espetinhos
    { nome: "Espetinho de Frango", descricao: "Espetinho de frango temperado, grelhado na brasa (2 unidades)", preco: 16.9, categoria: Categoria.ESPETINHO, imagemUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400", ordem: 1 },
    { nome: "Espetinho de Picanha", descricao: "Espetinho de picanha com alho e sal grosso (2 unidades)", preco: 24.9, categoria: Categoria.ESPETINHO, imagemUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400", ordem: 2 },
    { nome: "Espetinho Misto", descricao: "Espetinho misto de frango e linguiça (2 unidades)", preco: 19.9, categoria: Categoria.ESPETINHO, imagemUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400", ordem: 3 },
    { nome: "Espetinho de Coração", descricao: "Espetinho de coração de frango temperado (3 unidades)", preco: 14.9, categoria: Categoria.ESPETINHO, imagemUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400", ordem: 4 },
    // Porções
    { nome: "Batata Frita", descricao: "Porção de batata frita crocante com ketchup e maionese", preco: 29.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400", ordem: 1 },
    { nome: "Mandioca Frita", descricao: "Porção de mandioca frita com molho de alho e limão", preco: 27.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1578021041697-9e5e4ec3f8b5?w=400", ordem: 2 },
    { nome: "Iscas de Frango", descricao: "Iscas de frango empanado crocante com molho barbecue", preco: 39.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400", ordem: 3 },
    { nome: "Calabresa Acebolada", descricao: "Porção de calabresa fatiada com cebola e pimentão (serve 2)", preco: 34.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1544025162-d76538147574?w=400", ordem: 4 },
    { nome: "Tábua de Frios", descricao: "Tábua com salame, presunto, queijo, torradas e azeitonas (serve 3-4)", preco: 64.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400", ordem: 5 },
    { nome: "Carne Seca com Mandioca", descricao: "Porção de carne seca desfiada com mandioca cozida (serve 2-3)", preco: 54.9, categoria: Categoria.PORCAO, imagemUrl: "https://images.unsplash.com/photo-1544025162-d76538147574?w=400", ordem: 6 },
  ];

  await prisma.produto.createMany({ data: produtos });
  console.log(`✅ ${produtos.length} produtos criados`);

  // ─── Mesas ──────────────────────────────────────────────────────────────────
  // Fecha todas as comandas abertas antes de recriar
  await prisma.comanda.updateMany({
    where: { fechadaEm: null },
    data: { fechadaEm: new Date(), total: 0 },
  });
  await prisma.mesa.deleteMany({});

  const totalMesas = 15;
  for (let numero = 1; numero <= totalMesas; numero++) {
    const mesaUrl = `${APP_URL}/mesa/${numero}`;
    const qrCodeUrl = await QRCode.toDataURL(mesaUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });
    await prisma.mesa.create({ data: { numero, qrCodeUrl, status: "FECHADA" } });
  }

  console.log(`✅ ${totalMesas} mesas criadas com QR codes`);
  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin:      admin@estacaodochopp.com     / admin123");
  console.log("   Atendente:  atendente@estacaodochopp.com / atendente123");
  console.log("   Cozinha:    cozinha@estacaodochopp.com   / cozinha123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
