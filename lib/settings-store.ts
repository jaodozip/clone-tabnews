"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardSettings, DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "dashboard-settings";

export function useSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {}
    setLoaded(true);
  }, []);

  const save = useCallback((updates: Partial<DashboardSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, save, reset, loaded };
}
