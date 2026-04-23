"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const weekday = WEEKDAYS[now.getDay()];
  const day = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div className="text-right select-none">
      <div
        className="font-mono leading-none tabular-nums"
        style={{ fontSize: "clamp(32px, 4vw, 64px)", color: "#F8FAFC" }}
      >
        {h}
        <span className="opacity-60 animate-pulse">:</span>
        {m}
        <span className="text-3xl opacity-40 ml-1">{s}</span>
      </div>
      <div className="text-sm capitalize mt-0.5" style={{ color: "#94A3B8" }}>
        {weekday}, {day} de {month} de {year}
      </div>
    </div>
  );
}
