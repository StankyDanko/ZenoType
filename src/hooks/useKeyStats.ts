import { useState, useMemo, useCallback } from 'react';
import type { KeyStat } from '../types';

export function useKeyStats() {
  const [keyStats, setKeyStats] = useState<Record<string, KeyStat>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zenotype_keystats") as string) || {};
      if (
        Object.values(saved).length > 0 &&
        typeof Object.values(saved)[0] === "number"
      )
        return {};
      return saved;
    } catch {
      return {};
    }
  });

  const aggregatedKeyStats = useMemo(() => {
    const agg: Record<string, KeyStat> = {};
    Object.entries(keyStats).forEach(([k, v]) => {
      const lowerK = k.toLowerCase();
      if (!agg[lowerK]) agg[lowerK] = { hits: 0, misses: 0 };
      agg[lowerK].hits += v.hits;
      agg[lowerK].misses += v.misses;
    });
    return agg;
  }, [keyStats]);

  const recordKeystroke = useCallback((expectedChar: string, isCorrect: boolean) => {
    setKeyStats((prev) => {
      const existing = prev[expectedChar];
      const stat = existing
        ? { hits: existing.hits, misses: existing.misses }
        : { hits: 0, misses: 0 };
      if (isCorrect) stat.hits++;
      else stat.misses++;
      return { ...prev, [expectedChar]: stat };
    });
  }, []);

  const resetStats = useCallback(() => {
    setKeyStats({});
  }, []);

  const persistKeyStats = useCallback(() => {
    try {
      localStorage.setItem("zenotype_keystats", JSON.stringify(keyStats));
    } catch {}
  }, [keyStats]);

  return {
    keyStats,
    aggregatedKeyStats,
    recordKeystroke,
    resetStats,
    persistKeyStats,
  };
}
