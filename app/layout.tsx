import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { RotationController } from "@/components/rotation-controller";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE || "Painel de Produção",
  description: "Dashboard de produção e comercial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="flex h-screen overflow-hidden" style={{ background: "#0B0F1A" }}>
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
        <RotationController />
      </body>
    </html>
  );
}
