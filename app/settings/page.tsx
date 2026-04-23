"use client";

import { useState, useRef } from "react";
import { useSettings } from "@/lib/settings-store";
import { PageHeader } from "@/components/page-header";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Save, RotateCcw, Lock, Eye, EyeOff, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

function LabelInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
        style={{
          background: "#0B0F1A",
          borderColor: "rgba(255,255,255,0.1)",
          color: "#F8FAFC",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--primary-color, #6366F1)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { settings, save, reset } = useSettings();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [authError, setAuthError] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ ...settings });
  const [embMetas, setEmbMetas] = useState<number[]>(settings.embMetas);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAuth = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setAuthError("");
        setForm({ ...settings });
        setEmbMetas([...settings.embMetas]);
      } else {
        setAuthError("Senha incorreta");
      }
    } catch {
      setAuthError("Erro de conexão");
    }
  };

  const handleSave = () => {
    save({ ...form, embMetas });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    reset();
    setForm({ ...DEFAULT_SETTINGS });
    setEmbMetas([...DEFAULT_SETTINGS.embMetas]);
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm((f) => ({ ...f, logoUrl: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ background: "#0B0F1A" }}>
        <div
          className="w-full max-w-sm rounded-2xl p-8 border space-y-5"
          style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.15)" }}>
              <Lock size={24} style={{ color: "#6366F1" }} />
            </div>
            <h1 className="text-lg font-semibold" style={{ color: "#F8FAFC" }}>
              Configurações
            </h1>
            <p className="text-sm text-center" style={{ color: "#94A3B8" }}>
              Digite a senha para acessar
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none pr-10"
                style={{
                  background: "#0B0F1A",
                  borderColor: authError ? "#EF4444" : "rgba(255,255,255,0.1)",
                  color: "#F8FAFC",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {authError && <p className="text-xs" style={{ color: "#EF4444" }}>{authError}</p>}
          </div>

          <button
            onClick={handleAuth}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#6366F1", color: "#fff" }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0B0F1A" }}>
      <PageHeader title="Configurações" logoUrl={settings.logoUrl} showClock={false} />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Branding */}
          <section
            className="rounded-xl p-5 border space-y-4"
            style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Identidade Visual</h2>

            <LabelInput
              label="Título do Painel"
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder="Painel de Produção"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>Logo</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                  placeholder="URL ou faça upload"
                  className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{
                    background: "#0B0F1A",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#F8FAFC",
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 rounded-lg text-sm border flex items-center gap-2 hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94A3B8" }}
                >
                  <Upload size={14} /> Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
              {form.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Preview logo" className="h-10 w-auto rounded object-contain mt-1" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>Cor Primária</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="px-3 py-2 rounded-lg text-sm border outline-none w-32 font-mono"
                  style={{
                    background: "#0B0F1A",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#F8FAFC",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Gauges */}
          <section
            className="rounded-xl p-5 border space-y-4"
            style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Metas dos Gauges</h2>
            <div className="grid grid-cols-3 gap-4">
              <LabelInput
                label="Meta SOFÁ ZP (Empresa 1)"
                type="number"
                value={form.sofaMeta1}
                onChange={(v) => setForm((f) => ({ ...f, sofaMeta1: Number(v) }))}
              />
              <LabelInput
                label="Meta SOFÁ KING (Empresa 601)"
                type="number"
                value={form.sofaMeta601}
                onChange={(v) => setForm((f) => ({ ...f, sofaMeta601: Number(v) }))}
              />
              <LabelInput
                label="Meta CABECEIRA Total"
                type="number"
                value={form.cabMeta}
                onChange={(v) => setForm((f) => ({ ...f, cabMeta: Number(v) }))}
              />
            </div>
          </section>

          {/* Embalagem metas */}
          <section
            className="rounded-xl p-5 border space-y-4"
            style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Metas de Embalagem</h2>
            <div className="grid grid-cols-5 gap-3">
              {embMetas.map((m, i) => (
                <LabelInput
                  key={i}
                  label={`EMB ${i + 1}`}
                  type="number"
                  value={m}
                  onChange={(v) => {
                    const next = [...embMetas];
                    next[i] = Number(v);
                    setEmbMetas(next);
                  }}
                />
              ))}
            </div>
          </section>

          {/* Rotation */}
          <section
            className="rounded-xl p-5 border space-y-4"
            style={{ background: "#1A2234", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>Modo TV</h2>
            <LabelInput
              label="Intervalo de Rotação (segundos)"
              type="number"
              value={form.rotationInterval}
              onChange={(v) => setForm((f) => ({ ...f, rotationInterval: Number(v) }))}
            />
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                saved ? "opacity-90" : "hover:opacity-90"
              )}
              style={{ background: saved ? "#10B981" : "#6366F1", color: "#fff" }}
            >
              <Save size={16} />
              {saved ? "Salvo!" : "Salvar"}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/5 border transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94A3B8" }}
            >
              <RotateCcw size={14} />
              Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
