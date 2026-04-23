"use client";

import useSWR from "swr";
import { FoccoSlug } from "@/lib/focco-client";
import { FoccoResponse } from "@/lib/types";

const fetcher = (slug: string) =>
  fetch(`/api/focco/${slug}`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function useFocco<T>(slug: FoccoSlug, refreshInterval = 30000) {
  const { data, error, isLoading } = useSWR<FoccoResponse<T>>(slug, fetcher, {
    refreshInterval,
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryInterval: 5000,
  });

  return {
    data: data?.value ?? [],
    error,
    isLoading,
  };
}
