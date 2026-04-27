"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Package, Table2, BarChart3, Beer, ArrowRight } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.papel !== "ADMIN") {
      router.push("/painel");
    }
  }, [status, session, router]);

  if (status === "loading") return null;

  const cards = [
    {
      href: "/admin/produtos",
      icon: Package,
      title: "Produtos",
      desc: "Gerencie o cardápio — adicione, edite e remova itens",
      color: "from-amber-500 to-amber-700",
    },
    {
      href: "/admin/mesas",
      icon: Table2,
      title: "Mesas",
      desc: "Gerencie as mesas e imprima os QR codes",
      color: "from-blue-500 to-blue-700",
    },
    {
      href: "/admin/relatorios",
      icon: BarChart3,
      title: "Relatórios",
      desc: "Veja os mais vendidos e o total da noite",
      color: "from-green-500 to-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Beer className="w-6 h-6 text-amber-400" />
          <div>
            <p className="font-bold text-amber-400">Estação do Chopp</p>
            <p className="text-gray-400 text-xs">Painel Administrativo</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href="/painel" className="text-gray-400 hover:text-white text-sm transition-colors">
              → Painel Operacional
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo, Admin</h1>
        <p className="text-gray-400 mb-8">Gerencie o sistema pelo menu abaixo.</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white hover:scale-105 transition-transform shadow-lg`}
            >
              <card.icon className="w-8 h-8 mb-3 opacity-90" />
              <h2 className="font-bold text-lg mb-1">{card.title}</h2>
              <p className="text-sm opacity-80 mb-3">{card.desc}</p>
              <div className="flex items-center gap-1 text-sm font-medium opacity-90">
                Acessar <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
