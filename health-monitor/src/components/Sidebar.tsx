import { colors, typography } from '../styles/tokens';

// ── SVG Icon Components ───────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5A3.5 3.5 0 0 0 3.5 5v2.5L2 9h10l-1.5-1.5V5A3.5 3.5 0 0 0 7 1.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M5.5 9.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="7" width="2.5" height="5" fill="currentColor" opacity="0.7"/>
      <rect x="5.75" y="4" width="2.5" height="8" fill="currentColor" opacity="0.7"/>
      <rect x="9.5" y="2" width="2.5" height="10" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11.5S1.5 8 1.5 4.5a2.5 2.5 0 0 1 5-0.3 2.5 2.5 0 0 1 5 .3C12.5 8 7 11.5 7 11.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M7 1.5A4.5 4.5 0 0 0 2.5 6c0 3 4.5 6.5 4.5 6.5S11.5 9 11.5 6A4.5 4.5 0 0 0 7 1.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3L2 7l3 4M9 3l3 4-3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="9.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M9.5 8.5c1.7.3 3 1.7 3 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M8 7.5l5 3M11 8.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 9A6 6 0 0 1 5 2a6 6 0 1 0 7 7z" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
      <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 9h14M4 5h10M4 13h10" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  );
}

function ChevLeftIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Nav types ─────────────────────────────────────────────────────────────────

interface NavItemDef {
  type: 'item';
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}
interface NavSectionDef {
  type: 'section';
  label: string;
}
type NavDef = NavItemDef | NavSectionDef;

const NAV: NavDef[] = [
  { type: 'item', icon: <BellIcon />, label: 'Уведомления' },
  { type: 'item', icon: <ChartIcon />, label: 'Статистика уведомлений' },
  { type: 'item', icon: <HeartIcon />, label: 'Модель здоровья', active: true },
  { type: 'item', icon: <DashIcon />, label: 'Дашборды' },
  { type: 'item', icon: <PinIcon />, label: 'Объекты' },
  { type: 'section', label: 'Настройки' },
  { type: 'item', icon: <GearIcon />, label: 'Метрики' },
  { type: 'item', icon: <BellIcon />, label: 'Правила оповещений' },
  { type: 'item', icon: <CodeIcon />, label: 'Конструктор выражений' },
  { type: 'item', icon: <PersonIcon />, label: 'Список получателей' },
  { type: 'item', icon: <GroupIcon />, label: 'Группы рассылки' },
  { type: 'item', icon: <MailIcon />, label: 'Настройки отправки' },
  { type: 'section', label: 'Безопасность' },
  { type: 'item', icon: <KeyIcon />, label: 'Токены доступа' },
  { type: 'item', icon: <PersonIcon />, label: 'Ролевая модель' },
  { type: 'section', label: 'Прочее' },
  { type: 'item', icon: <InfoIcon />, label: 'О программе' },
];

// ── Main component ────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <div style={{
      width: 200,
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      background: colors.bg.sidebar,
      borderRight: `1px solid ${colors.border.subtle}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 12px 12px', borderBottom: `1px solid ${colors.border.subtle}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: colors.accent.tealBright, display: 'flex' }}><GlobeIcon /></span>
          <span style={{ color: colors.accent.tealBright, fontSize: typography.size.xl, fontWeight: typography.weight.bold, letterSpacing: '0.02em' }}>
            геном 2.0
          </span>
        </div>
        <div style={{ color: colors.text.ghost, fontSize: typography.size.sm, marginTop: 2, paddingLeft: 26 }}>
          Инфраструктура
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0' }}>
        {NAV.map((item, i) => {
          if (item.type === 'section') {
            return (
              <div key={i} style={{ padding: '10px 12px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: colors.border.subtle }} />
                <span style={{ color: colors.text.ghost, fontSize: 9, fontWeight: typography.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                <div style={{ flex: 1, height: 1, background: colors.border.subtle }} />
              </div>
            );
          }
          const isActive = item.active;
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 32,
              padding: '0 12px',
              borderLeft: isActive ? `2px solid ${colors.accent.primary}` : '2px solid transparent',
              background: isActive ? colors.bg.navActive : 'transparent',
              color: isActive ? colors.text.primary : colors.text.dim,
              cursor: 'default',
            }}>
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: isActive ? colors.accent.primary : colors.text.ghost }}>
                {item.icon}
              </span>
              <span style={{ fontSize: typography.size.base, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? typography.weight.medium : typography.weight.normal }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${colors.border.subtle}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
          <span style={{ color: colors.text.ghost, display: 'flex', alignItems: 'center' }}><MoonIcon /></span>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.accent.tealDark}, ${colors.accent.tealBright})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: typography.weight.bold,
          }}>АВ</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 10px', color: colors.text.ghost, fontSize: typography.size.sm, cursor: 'default' }}>
          <ChevLeftIcon />
          <span>Свернуть</span>
        </div>
      </div>
    </div>
  );
}
