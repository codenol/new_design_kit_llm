import { type Status, type PAKHealth } from '../types';
import { getStatusColor } from '../utils/healthRules';
import { colors, typography } from '../styles/tokens';

interface Props {
  paks: PAKHealth[];
  activeStatuses: Status[];
  onToggleStatus: (s: Status) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenTemplates: () => void;
}

const STATUS_CHIPS: { value: Status; label: string }[] = [
  { value: 'ok',       label: 'Нормальные' },
  { value: 'critical', label: 'Критические' },
  { value: 'warning',  label: 'Предупреждения' },
];

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M3 3l4 4M7 3l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function FilterBar({ paks: _paks, activeStatuses, onToggleStatus, searchQuery, onSearchChange, onOpenTemplates }: Props) {
  // When activeStatuses is empty, all are considered active (show all)
  const isChipActive = (status: Status) =>
    activeStatuses.length === 0 || activeStatuses.includes(status);

  return (
    <div
      style={{
        background: colors.bg.elevated,
        borderBottom: `1px solid ${colors.border.subtle}`,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 52,
        flexShrink: 0,
      }}
    >
      {/* Search input */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: colors.text.ghost,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <SearchIcon />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Поиск"
          style={{
            width: 200,
            height: 30,
            background: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 6,
            padding: '0 8px 0 28px',
            color: colors.text.primary,
            fontSize: typography.size.base,
            outline: 'none',
          }}
        />
      </div>

      {/* Status chips */}
      {STATUS_CHIPS.map(({ value, label }) => {
        const active = isChipActive(value);
        const color = getStatusColor(value);
        return (
          <button
            key={value}
            onClick={() => onToggleStatus(value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 28,
              padding: '0 10px',
              borderRadius: 14,
              border: active
                ? `1px solid ${color}55`
                : `1px solid ${colors.border.subtle}`,
              background: active
                ? `${color}18`
                : colors.bg.surface,
              color: active
                ? colors.statusLight[value]
                : colors.text.ghost,
              fontSize: typography.size.md,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {active ? <CheckIcon /> : <CrossIcon />}
            <span>{label}</span>
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Template settings button */}
      <button
        onClick={onOpenTemplates}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          background: colors.accent.tealBright,
          color: '#fff',
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Настройка шаблонов
      </button>
    </div>
  );
}
