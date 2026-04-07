import type { Status } from '../types';
import { getStatusColor } from '../utils/healthRules';

interface Props {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  count?: number;
}

const LABEL: Record<Status, string> = {
  ok: 'OK',
  warning: 'Пред.',
  critical: 'Крит.',
  unknown: 'N/A',
};

export function StatusBadge({ status, size = 'md', showLabel = false, count }: Props) {
  const color = getStatusColor(status);

  // Numbered badge (like Геном 2.0 alert counts)
  if (count !== undefined) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold rounded leading-none ${status === 'critical' ? 'status-critical-pulse' : ''}`}
        style={{
          background: `${color}22`,
          border: `1px solid ${color}60`,
          color,
          minWidth: size === 'sm' ? 20 : 24,
          height: size === 'sm' ? 18 : 22,
          padding: '0 5px',
          fontSize: size === 'sm' ? 10 : 11,
        }}
      >
        {count}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full inline-block flex-shrink-0 ${status === 'critical' ? 'status-critical-pulse' : ''}`}
        style={{
          width: size === 'sm' ? 7 : size === 'md' ? 9 : 11,
          height: size === 'sm' ? 7 : size === 'md' ? 9 : 11,
          backgroundColor: color,
          boxShadow: `0 0 5px ${color}80`,
        }}
      />
      {showLabel && (
        <span
          className="font-semibold"
          style={{ color, fontSize: size === 'sm' ? 11 : size === 'md' ? 12 : 13 }}
        >
          {LABEL[status]}
        </span>
      )}
    </span>
  );
}
