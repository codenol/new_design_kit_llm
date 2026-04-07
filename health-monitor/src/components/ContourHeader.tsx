import type { ContourHealth } from '../types';
import { getStatusColor } from '../utils/healthRules';
import { StatusBadge } from './StatusBadge';
import { colors, typography, layout } from '../styles/tokens';

interface Props {
  health: ContourHealth;
  lastUpdated: Date;
  onOpenTemplates: () => void;
}

export function ContourHeader({ health, lastUpdated, onOpenTemplates }: Props) {
  const critCount = health.paks.flatMap(p => p.groups).filter(g => g.status === 'critical').length;
  const warnCount = health.paks.flatMap(p => p.groups).filter(g => g.status === 'warning').length;
  const totalNodes = health.paks.flatMap(p => p.groups).reduce((a, g) => a + g.nodes.length, 0);

  const color = getStatusColor(health.status);

  return (
    <header
      style={{
        background: `linear-gradient(90deg, ${color}12 0%, ${colors.bg.elevated} 40%)`,
        borderBottom: `1px solid ${color}50`,
        borderLeft: `3px solid ${color}`,
        padding: `0 ${layout.mainPaddingH}px`,
        height: layout.headerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: `0 1px 12px ${color}18`,
      }}
    >
      {/* Breadcrumb + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: colors.text.dim, fontSize: typography.size.base }}>Мониторинг</span>
        <span style={{ color: colors.text.ghost, fontSize: typography.size.base }}>›</span>
        <span style={{ color: colors.text.label, fontSize: typography.size.base }}>Контур</span>
        <span style={{ color: colors.text.ghost, fontSize: typography.size.base }}>›</span>
        <span style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.lg }}>{health.name}</span>

        <div
          style={{
            marginLeft: 8,
            padding: '2px 10px',
            borderRadius: 4,
            background: `${color}18`,
            border: `1px solid ${color}50`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <StatusBadge status={health.status} size="sm" />
          <span style={{ color, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
            {health.status === 'ok' ? 'OK' : health.status === 'warning' ? 'Предупреждение' : health.status === 'critical' ? 'Критично' : 'Неизвестно'}
          </span>
        </div>
      </div>

      {/* Stats + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <StatItem label="ПАК" value={health.paks.length} />
        <StatItem label="Групп" value={health.paks.reduce((a, p) => a + p.groups.length, 0)} />
        <StatItem label="Узлов" value={totalNodes} />
        {critCount > 0 && <StatItem label="Крит." value={critCount} color={colors.status.critical} />}
        {warnCount > 0 && <StatItem label="Пред." value={warnCount} color={colors.status.warning} />}

        <div style={{ width: 1, height: 20, background: colors.border.subtle }} />
        <span style={{ color: colors.text.dim, fontSize: typography.size.md, fontFamily: typography.fontMono }}>
          {lastUpdated.toLocaleTimeString('ru-RU')}
        </span>

        <div style={{ width: 1, height: 20, background: colors.border.subtle }} />
        <button
          onClick={onOpenTemplates}
          title="Настройка шаблонов ПАК"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 5,
            background: colors.bg.control, border: `1px solid ${colors.border.dim}`,
            color: colors.text.dim, fontSize: typography.size.md, cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = colors.interactive.accentText;
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.interactive.accentBorder;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = colors.text.dim;
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border.dim;
          }}
        >
          <span>⚙</span>
          <span>Шаблоны</span>
        </button>
      </div>
    </header>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ color: colors.text.dim, fontSize: typography.size.md }}>{label}:</span>
      <span style={{ color: color ?? colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{value}</span>
    </div>
  );
}
