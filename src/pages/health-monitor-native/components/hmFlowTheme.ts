import type { HealthStatus } from "../model/types";

/** Цвет stroke рёбер графа — только CSS-переменные из [tokens/_healthMonitor.scss](design-system/tokens/_healthMonitor.scss). */
const EDGE_STROKE: Record<HealthStatus, string> = {
  ok: "var(--hm-flow-edge-stroke-ok)",
  warning: "var(--hm-flow-edge-stroke-warning)",
  critical: "var(--hm-flow-edge-stroke-critical)",
  unknown: "var(--hm-flow-edge-stroke-unknown)",
};

export function getStatusColor(status: HealthStatus): string {
  return EDGE_STROKE[status];
}

/** Поверхности панели React Flow — CSS variables */
export const HM = {
  surface: "var(--surface-card)",
  surfaceMuted: "var(--back-surface)",
  surfaceOverlay: "var(--surface-overlay)",
  border: "var(--surface-border)",
  borderSubtle: "var(--surface-border)",
  textPrimary: "var(--content-text-primary)",
  textSecondary: "var(--content-text-secondary)",
  link: "var(--link-color)",
  shadow: "var(--hm-flow-controls-shadow)",
} as const;
