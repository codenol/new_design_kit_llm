import { useEffect, useMemo, useState } from "react";
import type { PAKHealth } from "./types";
import { buildMockPaksFromSeed } from "./mockPakCards";

const DEFAULT_INTERVAL_MS = 4500;

export function useMockPakList(intervalMs: number = DEFAULT_INTERVAL_MS): PAKHealth[] {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return useMemo(() => buildMockPaksFromSeed(tick), [tick]);
}
