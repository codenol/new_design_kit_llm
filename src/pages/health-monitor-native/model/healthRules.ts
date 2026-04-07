import { HealthStatus, StatusRule } from "./types";

const STATUS_PRIORITY: Record<HealthStatus, number> = {
  unknown: 0,
  ok: 1,
  warning: 2,
  critical: 3,
};

export function worstStatus(statuses: HealthStatus[]): HealthStatus {
  if (!statuses.length) {
    return "unknown";
  }
  return statuses.reduce((worst, current) =>
    STATUS_PRIORITY[current] > STATUS_PRIORITY[worst] ? current : worst,
  );
}

function evaluateRule(value: number, rule: string): boolean {
  const match = rule.trim().match(/^([><=!]+)\s*([\d.]+)$/);
  if (!match) {
    return false;
  }
  const [, op, numStr] = match;
  const threshold = parseFloat(numStr);
  switch (op) {
    case ">":
      return value > threshold;
    case ">=":
      return value >= threshold;
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case "==":
    case "=":
      return value === threshold;
    case "!=":
      return value !== threshold;
    default:
      return false;
  }
}

export function evaluateStatus(value: number, rules: StatusRule): HealthStatus {
  if (rules.critical && evaluateRule(value, rules.critical)) {
    return "critical";
  }
  if (rules.warning && evaluateRule(value, rules.warning)) {
    return "warning";
  }
  return "ok";
}

export function statusClass(status: HealthStatus): string {
  if (status === "critical") return "hm-status-critical";
  if (status === "warning") return "hm-status-warning";
  if (status === "ok") return "hm-status-ok";
  return "hm-status-unknown";
}
