"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { cn } from "@/lib/cn";

interface GaugeCardProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
}

export function GaugeCard({
  title,
  value,
  max,
  unit = "un",
  subtitle,
  isLoading,
  className,
}: GaugeCardProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = value >= max ? "#10B981" : value >= max * 0.7 ? "#F59E0B" : "#EF4444";

  const data = [{ value: pct, fill: color }];

  return (
    <div
      className={cn("flex flex-col rounded-xl p-4 border", className)}
      style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <p className="text-sm font-medium mb-2" style={{ color: "#94A3B8" }}>
        {title}
      </p>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#6366F1" }} />
        </div>
      ) : (
        <div className="relative flex-1 flex items-center justify-center min-h-[160px]">
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              cx="50%"
              cy="55%"
              innerRadius="65%"
              outerRadius="85%"
              startAngle={210}
              endAngle={-30}
              data={data}
              barSize={16}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.05)" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono font-bold tabular-nums leading-none"
              style={{ fontSize: "2.5rem", color: "#F8FAFC" }}
            >
              {value.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              {unit} / {max.toLocaleString("pt-BR")} meta
            </span>
            <span
              className="text-xs font-semibold mt-1"
              style={{ color }}
            >
              {pct}%
            </span>
          </div>
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-center mt-1" style={{ color: "#475569" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
