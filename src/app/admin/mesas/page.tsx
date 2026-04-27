"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Loader2, QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Mesa = {
  id: string;
  numero: number;
  qrCodeUrl: string | null;
  status: string;
  comandas: { id: string }[];
};

export default function AdminMesasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoNumero, setNovoNumero] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [qrSelecionado, setQrSelecionado] = useState<Mesa | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.papel !== "ADMIN") router.push("/painel");
  }, [status, session, router]);

  const carregar = async () => {
    const res = await fetch("/api/mesas");
    setMesas(await res.json());
    setCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const criarMesa = async () => {
    if (!novoNumero) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: Number(novoNumero) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }
      setNovoNumero("");
      await carregar();
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta mesa?")) return;
    await fetch(`/api/mesas/${id}`, { method: "DELETE" });
    await carregar();
  };

  const baixarQR = (mesa: Mesa) => {
    if (!mesa.qrCodeUrl) return;
    const link = document.createElement("a");
    link.download = `mesa-${mesa.numero}-qrcode.png`;
    link.href = mesa.qrCodeUrl;
    link.click();
  };

  if (carregando) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">Mesas e QR Codes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Criar nova mesa */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-3">Adicionar mesa</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-gray-400 text-xs mb-1 block">Número da mesa</Label>
              <Input
                type="number"
                placeholder="Ex: 16"
                className="bg-gray-800 border-gray-700 text-white"
                value={novoNumero}
                onChange={(e) => setNovoNumero(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criarMesa()}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="bg-amber-600 hover:bg-amber-500"
                onClick={criarMesa}
                disabled={salvando || !novoNumero}
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Criar</>}
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de mesas */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`bg-gray-900 border rounded-xl p-3 text-center ${mesa.status === "ABERTA" ? "border-green-600" : "border-gray-700"}`}
            >
              <div className="text-2xl font-bold mb-1">{mesa.numero}</div>
              <div className={`text-xs mb-3 ${mesa.status === "ABERTA" ? "text-green-400" : "text-gray-500"}`}>
                {mesa.status === "ABERTA" ? "● Aberta" : "○ Fechada"}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:text-white text-xs h-7 w-full"
                  onClick={() => setQrSelecionado(mesa)}
                >
                  <QrCode className="w-3 h-3" /> QR Code
                </Button>
                <button
                  onClick={() => excluir(mesa.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  disabled={mesa.status === "ABERTA"}
                >
                  <Trash2 className="w-3 h-3 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal QR Code */}
      <Dialog open={!!qrSelecionado} onOpenChange={() => setQrSelecionado(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code — Mesa {qrSelecionado?.numero}</DialogTitle>
          </DialogHeader>

          {qrSelecionado?.qrCodeUrl && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={qrSelecionado.qrCodeUrl}
                  alt={`QR Code Mesa ${qrSelecionado.numero}`}
                  className="w-48 h-48"
                />
              </div>
              <p className="text-gray-400 text-sm text-center">
                Escaneie para acessar o cardápio da Mesa {qrSelecionado.numero}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {process.env.NEXT_PUBLIC_APP_URL}/mesa/{qrSelecionado.numero}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              className="bg-amber-600 hover:bg-amber-500 w-full"
              onClick={() => qrSelecionado && baixarQR(qrSelecionado)}
            >
              <Download className="w-4 h-4" /> Baixar QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
