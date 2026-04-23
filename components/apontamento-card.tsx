"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/cn";

interface ApontamentoCardProps {
  label: string;
  value: number;
  meta: number;
  isLoading?: boolean;
  primaryColor?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString("pt-BR"));
  const prevRef = useRef(0);

  useEffect(() => {
    const ctrl = animate(mv, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    prevRef.current = value;
    return ctrl.stop;
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
}

export function ApontamentoCard({
  label,
  value,
  meta,
  isLoading,
  primaryColor = "#6366F1",
}: ApontamentoCardProps) {
  const pct = meta > 0 ? Math.min(100, (value / meta) * 100) : 0;
  const progressColor = pct >= 100 ? "#10B981" : pct >= 70 ? "#F59E0B" : primaryColor;

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, #1A2234 0%, #1A2234 60%, ${primaryColor}18 100%)`,
        borderColor: "rgba(255,255,255,0.06)",
        minHeight: "220px",
      }}
    >
      <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${primaryColor}, transparent 70%)` }} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <p className="text-sm font-medium mb-4" style={{ color: "#94A3B8" }}>
          {label}
        </p>

        {isLoading ? (
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: primaryColor }} />
        ) : (
          <div
            className="font-mono font-bold tabular-nums leading-none"
            style={{ fontSize: "clamp(64px, 8vw, 140px)", color: "#F8FAFC" }}
          >
            <AnimatedNumber value={value} />
          </div>
        )}

        <p className="text-xs mt-3" style={{ color: "#475569" }}>
          meta: {meta.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="px-6 pb-6 relative z-10">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "#94A3B8" }}>
          <span>Progresso</span>
          <span className="font-mono" style={{ color: progressColor }}>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
