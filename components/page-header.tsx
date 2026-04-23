"use client";

import { Clock } from "./clock";
import { FullscreenToggle } from "./fullscreen-toggle";
import Image from "next/image";

interface PageHeaderProps {
  title?: string;
  logoUrl?: string;
  showClock?: boolean;
}

export function PageHeader({ title, logoUrl, showClock = true }: PageHeaderProps) {
  const appTitle = title || process.env.NEXT_PUBLIC_APP_TITLE || "Painel de Produção";

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{
        background: "#1A2234",
        borderColor: "rgba(255,255,255,0.06)",
        minHeight: "72px",
      }}
    >
      <div className="flex items-center gap-3">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt="Logo"
            width={40}
            height={40}
            className="rounded object-contain"
            unoptimized
          />
        )}
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#F8FAFC" }}>
          {appTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {showClock && <Clock />}
        <FullscreenToggle />
      </div>
    </header>
  );
}
