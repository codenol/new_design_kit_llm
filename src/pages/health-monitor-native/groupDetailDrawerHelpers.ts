import type { HealthStatus, NodeHealth, LowLevelIndicatorHealth } from "./model/types";
import { worstStatus } from "./model/healthRules";
import { healthStatusToUiTone, type HealthUiTone } from "./model/statusTone";

/** Порядок секций как в макете (дроер СХД: сначала Узлы, затем VIP и полки), остальные по алфавиту */
const CATEGORY_ORDER = ["Узлы", "VIP-адрес", "Ноды", "Дисковые полки", "БД"];

export type DetailTone = HealthUiTone;

export const healthStatusToTone = healthStatusToUiTone;

export function sortCategoryEntries(
  entries: [string, NodeHealth[]][],
): [string, NodeHealth[]][] {
  return [...entries].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a[0]);
    const ib = CATEGORY_ORDER.indexOf(b[0]);
    const ra = ia === -1 ? 1000 : ia;
    const rb = ib === -1 ? 1000 : ib;
    if (ra !== rb) return ra - rb;
    return a[0].localeCompare(b[0], "ru");
  });
}

export function categoryAggregateStatus(nodes: NodeHealth[]): HealthStatus {
  return worstStatus(nodes.map((n) => n.status));
}

export function namesMatchCategory(categoryName: string, nodeName: string): boolean {
  const n = (s: string) => s.trim().toLowerCase().replace(/ё/g, "е");
  return n(categoryName) === n(nodeName);
}

const NEVER_FLATTEN_CATEGORIES = new Set(
  ["узлы", "ноды", "дисковые полки"].map((s) => s.replace(/ё/g, "е")),
);

function categoryKeyForFlatten(categoryName: string): string {
  return categoryName.trim().toLowerCase().replace(/ё/g, "е");
}

/**
 * Одна строка в категории и имя совпадает с заголовком — можно сплющить (напр. VIP).
 * Для «Узлы» / «Дисковые полки» второй уровень всегда нужен: узел или полка → индикаторы.
 */
export function shouldFlattenSingleNodeCategory(
  categoryName: string,
  nodes: NodeHealth[],
): boolean {
  if (nodes.length !== 1) return false;
  if (NEVER_FLATTEN_CATEGORIES.has(categoryKeyForFlatten(categoryName))) {
    return false;
  }
  return namesMatchCategory(categoryName, nodes[0].name);
}

export function formatSubMetricValue(metric: LowLevelIndicatorHealth): string {
  const v = metric.value;
  const key = metric.metric.toLowerCase();
  const name = metric.name.toLowerCase();
  /* Счётчик БП (0–2), иначе процент загрузки БП */
  if ((key.includes("psu") || name.includes("бп")) && v <= 2) {
    return String(Math.round(v));
  }
  return `${Math.round(v)}%`;
}

export function nodeMatchesSearch(
  node: NodeHealth,
  categoryName: string,
  q: string,
): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (categoryName.toLowerCase().includes(s)) return true;
  if (node.name.toLowerCase().includes(s)) return true;
  for (const ind of node.indicators) {
    if (ind.name.toLowerCase().includes(s)) return true;
    for (const sub of ind.subIndicators) {
      if (sub.name.toLowerCase().includes(s)) return true;
    }
  }
  return false;
}

export function nodeMatchesStatusFilter(
  node: NodeHealth,
  filter: HealthStatus[],
): boolean {
  if (filter.length === 0) return true;
  return filter.includes(node.status);
}
