"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIA_LABELS, CATEGORIA_EMOJI, formatCurrency } from "@/lib/utils";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  imagemUrl: string | null;
  disponivel: boolean;
  ordem: number;
};

const CATEGORIAS = ["CHOPP", "CERVEJA", "BEBIDA", "ESPETINHO", "PORCAO"];

const FORM_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "CHOPP",
  imagemUrl: "",
  disponivel: true,
  ordem: "0",
};

export default function AdminProdutosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.papel !== "ADMIN") router.push("/painel");
  }, [status, session, router]);

  const carregar = async () => {
    const res = await fetch("/api/produtos");
    setProdutos(await res.json());
    setCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setDialogAberto(true);
  };

  const abrirEdicao = (p: Produto) => {
    setEditando(p);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: String(p.preco),
      categoria: p.categoria,
      imagemUrl: p.imagemUrl ?? "",
      disponivel: p.disponivel,
      ordem: String(p.ordem),
    });
    setDialogAberto(true);
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const payload = {
        ...form,
        preco: Number(form.preco),
        ordem: Number(form.ordem),
      };
      if (editando) {
        await fetch(`/api/produtos/${editando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setDialogAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    await carregar();
  };

  const produtosFiltrados = filtroCategoria === "TODAS"
    ? produtos
    : produtos.filter((p) => p.categoria === filtroCategoria);

  if (carregando) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">Produtos</h1>
          <div className="ml-auto flex items-center gap-3">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="TODAS" className="text-white">Todas</SelectItem>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c} className="text-white">
                    {CATEGORIA_EMOJI[c]} {CATEGORIA_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={abrirNovo} className="bg-amber-600 hover:bg-amber-500">
              <Plus className="w-4 h-4" /> Novo produto
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {produtosFiltrados.map((p) => (
            <div
              key={p.id}
              className={`bg-gray-900 border rounded-xl overflow-hidden ${p.disponivel ? "border-gray-700" : "border-gray-800 opacity-60"}`}
            >
              {p.imagemUrl && (
                <div className="relative h-36">
                  <Image src={p.imagemUrl} alt={p.nome} fill className="object-cover" sizes="400px" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {CATEGORIA_EMOJI[p.categoria]} {CATEGORIA_LABELS[p.categoria]}
                    </p>
                    <p className="text-amber-400 font-bold mt-1">{formatCurrency(p.preco)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEdicao(p)}
                      className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => excluir(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {!p.disponivel && (
                  <span className="inline-block mt-2 text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
                    Indisponível
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Nome *</Label>
              <Input
                className="bg-gray-800 border-gray-700 text-white"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea
                className="bg-gray-800 border-gray-700 text-white min-h-[70px]"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={form.preco}
                  onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={form.ordem}
                  onChange={(e) => setForm((f) => ({ ...f, ordem: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c} className="text-white">
                      {CATEGORIA_EMOJI[c]} {CATEGORIA_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>URL da imagem</Label>
              <Input
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="https://..."
                value={form.imagemUrl}
                onChange={(e) => setForm((f) => ({ ...f, imagemUrl: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.disponivel}
                onCheckedChange={(v) => setForm((f) => ({ ...f, disponivel: v }))}
              />
              <Label>Disponível no cardápio</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="text-gray-400" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-500"
              onClick={salvar}
              disabled={salvando || !form.nome || !form.preco}
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
