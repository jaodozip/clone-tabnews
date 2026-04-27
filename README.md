# 🍺 Estação do Chopp — Sistema de Pedidos Digital

Sistema de pedidos por QR Code para bares e choperies. Clientes escaneiam o QR code da mesa, fazem o pedido pelo celular, e os pedidos chegam em tempo real no painel dos atendentes e cozinha.

## Funcionalidades

| Módulo | Rota | Descrição |
|--------|------|-----------|
| **Cardápio do cliente** | `/mesa/:numero` | Mobile-first, sem login, acesso via QR code |
| **Painel operacional** | `/painel` | Pedidos em tempo real (SSE), separados por Bar e Cozinha |
| **Fechamento de mesa** | `/painel` → aba Mesas | Mostra consumo total, fecha comanda |
| **Admin — Produtos** | `/admin/produtos` | CRUD completo do cardápio |
| **Admin — Mesas** | `/admin/mesas` | Cria mesas, visualiza e baixa QR codes |
| **Admin — Relatórios** | `/admin/relatorios` | Mais vendidos e total por noite |
| **Login** | `/login` | Autenticação de funcionários |

## Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials Provider, JWT)
- **Realtime**: Server-Sent Events (SSE)
- **UI**: Tailwind CSS + shadcn/ui + lucide-react

---

## Setup local

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou via Docker)

### 2. Clone e instale dependências

```bash
git clone <repo>
cd estacao-do-chopp
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
# Banco PostgreSQL
DATABASE_URL="postgresql://postgres:senha@localhost:5432/estacao_do_chopp"

# NextAuth (gere com: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# URL da aplicação (usada para gerar os QR codes)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Crie o banco e rode as migrations

```bash
# Cria o banco e aplica o schema
npx prisma migrate dev --name init

# Gera o Prisma Client (feito automaticamente pela migrate, mas pode rodar separado)
npx prisma generate
```

### 5. Rode o seed (cardápio + mesas + usuários)

```bash
npm run db:seed
```

O seed cria:
- **26 produtos** em 5 categorias (Chopps, Cervejas, Bebidas, Espetinhos, Porções)
- **15 mesas** com QR codes gerados automaticamente
- **3 usuários** de exemplo

### 6. Inicie o servidor

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Credenciais de acesso (após seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@estacaodochopp.com` | `admin123` |
| Atendente | `atendente@estacaodochopp.com` | `atendente123` |
| Cozinha | `cozinha@estacaodochopp.com` | `cozinha123` |

---

## Testando o fluxo completo

1. Acesse `http://localhost:3000/mesa/1` (simula o cliente escaneando o QR code)
2. Adicione itens ao carrinho e confirme o pedido
3. Abra `http://localhost:3000/painel` e faça login como atendente
4. Veja o pedido chegar em tempo real no painel
5. Clique para avançar o status: **Recebido → Em Preparo → Entregue**
6. Na aba **Mesas**, feche a comanda quando o cliente pedir a conta

---

## Papéis de usuário

| Papel | Painel Bar | Painel Cozinha | Aba Mesas | Admin |
|-------|:---:|:---:|:---:|:---:|
| `ADMIN` | ✓ | ✓ | ✓ | ✓ |
| `ATENDENTE` | ✓ | — | ✓ | — |
| `COZINHA` | — | ✓ | — | — |

---

## Deploy

### Frontend + Backend: Vercel

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente (as mesmas do `.env`, mas com valores de produção)
3. `NEXTAUTH_URL` = URL da produção (ex: `https://seuapp.vercel.app`)
4. `NEXT_PUBLIC_APP_URL` = mesma URL de produção

### Banco: Railway

1. Crie um serviço PostgreSQL no Railway
2. Copie a `DATABASE_URL` fornecida e cole nas variáveis de ambiente da Vercel
3. Após o primeiro deploy, rode as migrations:

```bash
# Com a DATABASE_URL de produção no ambiente local
npx prisma migrate deploy
npm run db:seed
```

> **Nota sobre realtime**: O SSE usa um event emitter em memória, o que funciona perfeitamente para uma instância única (Railway free/hobby). Se precisar escalar para múltiplas instâncias, substitua por Redis pub/sub em `src/lib/sse.ts`.

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth
│   │   ├── comandas/            # Comandas abertas
│   │   │   └── [id]/fechar/     # Fecha comanda
│   │   ├── eventos/             # SSE stream (tempo real)
│   │   ├── mesas/               # CRUD mesas + QR code
│   │   ├── pedidos/             # Criar pedido
│   │   │   └── [id]/status/     # Avança status do item
│   │   ├── produtos/            # CRUD produtos
│   │   └── relatorios/          # Relatório por data
│   ├── admin/                   # Páginas administrativas
│   │   ├── page.tsx             # Home admin
│   │   ├── produtos/            # CRUD produtos
│   │   ├── mesas/               # Gestão de mesas
│   │   └── relatorios/          # Relatórios
│   ├── login/                   # Página de login
│   ├── mesa/[numero]/           # Cardápio do cliente (QR code)
│   └── painel/                  # Painel operacional
├── components/ui/               # Componentes shadcn/ui
└── lib/
    ├── auth.ts                  # Configuração NextAuth
    ├── prisma.ts                # Prisma Client singleton
    ├── sse.ts                   # SSE event emitter
    └── utils.ts                 # Utilitários e constantes

prisma/
├── schema.prisma                # Schema do banco
└── seed.ts                      # Seed com dados de exemplo
```

---

## Comandos úteis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run db:migrate    # Cria nova migration
npm run db:seed       # Repopula o banco com dados de exemplo
npm run db:reset      # Reset completo do banco + seed
npm run db:studio     # Prisma Studio (GUI do banco)
```

---

## Adicionando produtos

**Via interface**: Acesse `/admin/produtos` → **Novo produto**

**Via seed**: Edite `prisma/seed.ts` e rode `npm run db:seed`

## Adicionando mesas

**Via interface**: Acesse `/admin/mesas` → informe o número → **Criar**

O QR code é gerado automaticamente com a URL correta e pode ser baixado em PNG para impressão e colagem nas mesas.
