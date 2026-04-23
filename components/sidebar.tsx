"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Operação" },
  { href: "/comercial", icon: Building2, label: "Comercial" },
  { href: "/pedidos-divergencias", icon: FileText, label: "Pedidos & Div." },
  { href: "/apontamento", icon: Activity, label: "Apontamento" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 border-r shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
      style={{
        background: "#1A2234",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
            Dashboard
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-auto"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          style={{ color: "#94A3B8" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-1 px-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                active
                  ? "text-white"
                  : "hover:bg-white/5"
              )}
              style={
                active
                  ? { background: "var(--primary-color, #6366F1)", color: "#fff" }
                  : { color: "#94A3B8" }
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "#475569" }}>
            Painel de Produção v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
