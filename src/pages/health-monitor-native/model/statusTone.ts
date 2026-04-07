import type { CardGroupTone, CardPakTone } from "uikit";

import type { HealthStatus } from "./types";

/** Единый тон карточек и деталей для статуса здоровья (CardPak / CardGroup / дроер). */
export type HealthUiTone = CardPakTone;

export function healthStatusToUiTone(status: HealthStatus): HealthUiTone {
  if (status === "critical") return "critical";
  if (status === "warning") return "warning";
  if (status === "unknown") return "unavailable";
  return "success";
}

export function healthStatusToCardPakTone(status: HealthStatus): CardPakTone {
  return healthStatusToUiTone(status);
}

export function healthStatusToCardGroupTone(status: HealthStatus): CardGroupTone {
  return healthStatusToUiTone(status);
}
