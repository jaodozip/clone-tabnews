"use client";

import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color = "#6366F1",
  isLoading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 rounded-xl p-4 border", className)}
      style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
          {title}
        </p>
        {Icon && (
          <div className="p-1.5 rounded-lg" style={{ background: `${color}20` }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-8 w-16 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
      ) : (
        <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: "#F8FAFC" }}>
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          {unit && <span className="text-sm font-normal ml-1" style={{ color: "#94A3B8" }}>{unit}</span>}
        </p>
      )}
    </div>
  );
}
