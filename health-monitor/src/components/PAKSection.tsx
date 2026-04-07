import { useMemo } from 'react';
import type { PAKHealth, NodeHealth, Status } from '../types';
import { getStatusColor, worstStatus } from '../utils/healthRules';
import { colors, typography, radius } from '../styles/tokens';

interface Props {
  pak: PAKHealth;
}

// ─── Logical component groups ─────────────────────────────────────────────────
const COMPONENT_GROUPS: { key: string; label: string; cats: string[] }[] = [
  { key: 'vip',     label: 'VIP',      cats: ['VIP-адрес'] },
  { key: 'nodes',   label: 'Ноды',     cats: ['Ноды', 'Узлы', 'Аппаратный узел', 'ВМ Спектр КМ'] },
  { key: 'db',      label: 'БД',       cats: ['Postgres', 'TPS', 'Количество соединений'] },
  { key: 'storage', label: 'Хранение', cats: ['Дисковые полки', 'Вычисления и хранения'] },
  { key: 'net',     label: 'Сеть',     cats: ['Interconnect', 'Public', 'Management', 'Коммутаторы'] },
];

function getGroupStatus(allNodes: NodeHealth[], cats: string[]): Status | null {
  const relevant = allNodes.filter(n => cats.includes(n.category));
  if (relevant.length === 0) return null;
  return worstStatus(relevant.map(n => n.status));
}

function derivePakType(name: string): string {
  if (name.includes('MBD.P') || name.includes('МБД.П')) return 'МБД.П';
  if (name.includes('MBD.S') || name.includes('МБД.С')) return 'МБД.С';
  return 'ПАК';
}

// ─── Main PAKSection ──────────────────────────────────────────────────────────
export function PAKSection({ pak }: Props) {
  const accentColor = getStatusColor(pak.status);

  const allNodes = useMemo(() => pak.groups.flatMap(g => g.nodes), [pak.groups]);
  const totalNodes = allNodes.length;
  const critNodes  = allNodes.filter(n => n.status === 'critical').length;
  const warnNodes  = allNodes.filter(n => n.status === 'warning').length;

  const pakType = derivePakType(pak.name);

  // Build component group statuses
  const compStatuses = useMemo(
    () => COMPONENT_GROUPS.map(cg => ({ ...cg, status: getGroupStatus(allNodes, cg.cats) })),
    [allNodes],
  );

  const cardBg = pak.status === 'critical'
    ? `linear-gradient(180deg, ${accentColor}0a 0%, ${colors.bg.surface} 60%)`
    : colors.bg.surface;

  return (
    <div
      style={{
        marginBottom: 8,
        border: `1px solid ${accentColor}30`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: radius.lg,
        background: cardBg,
        padding: '10px 16px',
        overflow: 'hidden',
      }}
    >
      {/* Row 1: type + name + component chips */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <span style={{ color: colors.text.ghost, fontSize: 11 }}>Тип ПАК: </span>
        <span style={{ color: colors.text.dim, fontSize: 11, fontWeight: typography.weight.bold }}>{pakType}</span>
        <span style={{ color: colors.text.ghost, fontSize: 11, marginLeft: 8 }}>Имя: </span>
        <span style={{ color: colors.text.primary, fontSize: 12, fontWeight: typography.weight.semibold, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 2 }}>{pak.name}</span>

        {/* Component group chips */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'nowrap', gap: 4, flexShrink: 0, paddingLeft: 8 }}>
          {compStatuses.map(cg => {
            if (cg.status === null) return null;
            const color = getStatusColor(cg.status);
            const isOk = cg.status === 'ok';
            const isWarn = cg.status === 'warning';
            const isCrit = cg.status === 'critical';

            let chipStyle: React.CSSProperties;
            if (isOk) {
              chipStyle = {
                background: colors.bg.control,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.ghost,
              };
            } else if (isWarn) {
              chipStyle = {
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color: colors.statusLight.warning,
              };
            } else if (isCrit) {
              chipStyle = {
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color: colors.statusLight.critical,
              };
            } else {
              return null;
            }

            return (
              <div
                key={cg.key}
                style={{
                  height: 20,
                  padding: '0 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  display: 'inline-flex',
                  alignItems: 'center',
                  ...chipStyle,
                }}
              >
                {cg.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: groups count + colored squares */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <span style={{ color: colors.text.ghost, fontSize: 11 }}>Групп: {pak.groups.length}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {pak.groups.map(g => {
            const c = getStatusColor(g.status);
            return (
              <span
                key={g.id}
                title={g.name}
                style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: c,
                  boxShadow: `0 0 3px ${c}60`,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Row 3: node counts + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <span style={{ color: colors.text.ghost, fontSize: 11 }}>Узлов: {totalNodes}</span>
        {critNodes > 0 && (
          <span style={{
            background: `${getStatusColor('critical')}20`,
            border: `1px solid ${getStatusColor('critical')}50`,
            color: getStatusColor('critical'),
            borderRadius: radius.xs,
            padding: '0 5px',
            fontSize: 10,
            fontWeight: typography.weight.bold,
            marginLeft: 8,
          }}>
            {critNodes}
          </span>
        )}
        {warnNodes > 0 && (
          <span style={{
            background: `${getStatusColor('warning')}20`,
            border: `1px solid ${getStatusColor('warning')}50`,
            color: getStatusColor('warning'),
            borderRadius: radius.xs,
            padding: '0 5px',
            fontSize: 10,
            fontWeight: typography.weight.bold,
          }}>
            {warnNodes}
          </span>
        )}
      </div>
    </div>
  );
}
