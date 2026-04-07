import { Config } from "./types";
import { collectMetricKeys } from "./yamlParser";

export type MetricValues = Record<string, number>;

function seedFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialValue(metricKey: string): number {
  const seed = seedFromString(metricKey) % 100;
  if (metricKey.includes("vip") || metricKey.includes("psu")) {
    return 1;
  }
  if (metricKey.includes("links_pct") || metricKey.includes("disks_ok_pct")) {
    return 90 + (seed % 10);
  }
  if (metricKey.includes("tps")) {
    return 100 + seed * 10;
  }
  return 15 + (seed % 70);
}

export function createInitialMetrics(config: Config): MetricValues {
  const values: MetricValues = {};
  for (const key of collectMetricKeys(config)) {
    values[key] = initialValue(key);
  }
  return values;
}

export function tickMetrics(current: MetricValues): MetricValues {
  const next: MetricValues = { ...current };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (key.includes("vip") || key.includes("psu")) {
      continue;
    }
    const delta = (Math.random() - 0.5) * 6;
    const updated = Math.max(0, value + delta);
    next[key] = Math.round(updated * 10) / 10;
  }
  return next;
}
