import { colors, typography, radius } from '../styles/tokens';

export function BreadcrumbBar() {
  return (
    <div
      style={{
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: colors.bg.content,
        borderBottom: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 26,
          padding: '0 14px',
          borderRadius: 20,
          border: `1px solid ${colors.border.subtle}`,
          background: colors.bg.surface,
          whiteSpace: 'nowrap',
          cursor: 'default',
          gap: 4,
        }}
      >
        <span style={{ color: colors.text.dim, fontSize: typography.size.base }}>
          Мониторинг
        </span>
        <span style={{ color: colors.text.ghost, fontSize: typography.size.base }}>
          {' • '}
        </span>
        <span style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.medium }}>
          Модель здоровья
        </span>
      </div>
    </div>
  );
}
