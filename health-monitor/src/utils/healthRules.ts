import type { Status, StatusRule } from '../types';
import { colors } from '../styles/tokens';

const STATUS_PRIORITY: Record<Status, number> = {
  unknown: 0,
  ok: 1,
  warning: 2,
  critical: 3,
};

export function worstStatus(statuses: Status[]): Status {
  if (statuses.length === 0) return 'unknown';
  return statuses.reduce((worst, current) =>
    STATUS_PRIORITY[current] > STATUS_PRIORITY[worst] ? current : worst
  );
}

function evaluateRule(value: number, rule: string): boolean {
  const match = rule.trim().match(/^([><=!]+)\s*([\d.]+)$/);
  if (!match) return false;
  const [, op, numStr] = match;
  const threshold = parseFloat(numStr);
  switch (op) {
    case '>': return value > threshold;
    case '>=': return value >= threshold;
    case '<': return value < threshold;
    case '<=': return value <= threshold;
    case '==':
    case '=': return value === threshold;
    case '!=': return value !== threshold;
    default: return false;
  }
}

export function evaluateStatus(value: number, rules: StatusRule): Status {
  if (rules.critical && evaluateRule(value, rules.critical)) return 'critical';
  if (rules.warning && evaluateRule(value, rules.warning)) return 'warning';
  return 'ok';
}

export function getStatusColor(status: Status): string {
  return colors.status[status];
}

export function getStatusBg(status: Status): string {
  return colors.statusBg[status];
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case 'ok':       return 'OK';
    case 'warning':  return 'Предупреждение';
    case 'critical': return 'Критично';
    case 'unknown':  return 'Неизвестно';
  }
}

export { STATUS_PRIORITY };
