import type { HealthStatus } from "../model/types";

/**
 * Hex-значения статусов в духе [:root](design-system/tokens/_theme.scss) (светлая тема).
 * Нужны для градиентов/color-mix в React Flow и GroupNode (inline styles).
 */
export const STATUS_HEX: Record<HealthStatus, string> = {
  ok: "#399D45",
  warning: "#E19109",
  critical: "#E53334",
  unknown: "#808286",
};

export function getStatusColor(status: HealthStatus): string {
  return STATUS_HEX[status];
}

/** Поверхности и текст для светлой темы — CSS variables */
export const HM = {
  surface: "var(--surface-card)",
  surfaceMuted: "var(--back-surface)",
  surfaceOverlay: "var(--surface-overlay)",
  border: "var(--surface-border)",
  borderSubtle: "var(--surface-border)",
  textPrimary: "var(--content-text-primary)",
  textSecondary: "var(--content-text-secondary)",
  link: "var(--link-color)",
  shadow: "0 4px 16px rgb(0 0 0 / 8%)",
} as const;
