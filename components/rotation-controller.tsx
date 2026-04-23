"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";

const ROTATION_PAGES = ["/", "/comercial", "/pedidos-divergencias", "/apontamento"];

export function RotationController() {
  const [rotating, setRotating] = useState(false);
  const [interval, setIntervalSec] = useState(30);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") setRotating((r) => !r);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!rotating) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const next = () => {
      const idx = ROTATION_PAGES.indexOf(pathname);
      const nextPath = ROTATION_PAGES[(idx + 1) % ROTATION_PAGES.length];
      router.push(nextPath);
    };
    timerRef.current = setTimeout(next, interval * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rotating, pathname, interval, router]);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      {rotating && (
        <span className="text-xs px-2 py-1 rounded" style={{ background: "#1A2234", color: "#94A3B8" }}>
          Rotação {interval}s
        </span>
      )}
      <button
        onClick={() => setRotating((r) => !r)}
        className="p-2 rounded-lg transition-colors"
        style={{
          background: rotating ? "#6366F1" : "#1A2234",
          color: rotating ? "#fff" : "#94A3B8",
        }}
        title="Rotação automática (R)"
        aria-label="Rotação automática"
      >
        <RefreshCw size={16} className={rotating ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
