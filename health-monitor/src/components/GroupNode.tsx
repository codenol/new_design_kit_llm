import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { GroupHealth, NodeHealth, Status } from '../types';
import { getStatusColor, worstStatus } from '../utils/healthRules';
import { colors, typography, radius } from '../styles/tokens';

export interface GroupNodeData {
  group: GroupHealth;
  onSelect: (group: GroupHealth) => void;
}

function dot(status: Status, size = 7) {
  const c = getStatusColor(status);
  return (
    <span
      className={status === 'critical' ? 'status-critical-pulse' : ''}
      style={{
        display: 'inline-block', flexShrink: 0,
        width: size, height: size, borderRadius: '50%',
        backgroundColor: c, boxShadow: `0 0 ${size - 1}px ${c}80`,
      }}
    />
  );
}

function countBadge(status: Status, count: number) {
  if (count === 0) return null;
  const c = getStatusColor(status);
  return (
    <span style={{
      background: `${c}20`, border: `1px solid ${c}55`, color: c,
      borderRadius: 3, padding: '0 5px', fontSize: 10, fontWeight: 700, lineHeight: '16px',
    }}>{count}</span>
  );
}

const CAT_DESCRIPTIONS: Record<string, string> = {
  'VIP-адрес':             'Список всех VIP-ов (IP и роль)',
  'Ноды':                  'Физические узлы — аппаратура и сервисы HA',
  'Узлы':                  'Физические узлы — аппаратура',
  'Дисковые полки':        'Аппаратное здоровье полок',
  'Аппаратный узел':       'Аппаратура физического узла',
  'ВМ Спектр КМ':          'Аппаратура ВМ и ключевые сервисы',
  'Interconnect':          'IP, название и здоровье коммутатора',
  'Public':                'IP, название и здоровье коммутатора',
  'Management':            'IP, название и здоровье коммутатора',
  'Postgres':              'Запущен ли Postgres на каждом узле',
  'TPS':                   'Количество TPS по узлам',
  'Количество соединений': 'Загрузка пула соединений по узлам',
};

// Primary attribute keys to show as the node title line inside the tooltip
const CAT_ATTR_KEYS: Record<string, string[]> = {
  'VIP-адрес':             ['ip', 'role'],
  'Ноды':                  ['ip', 'role'],
  'Узлы':                  ['ip', 'role'],
  'Дисковые полки':        ['model', 'location'],
  'Аппаратный узел':       ['ip', 'role'],
  'ВМ Спектр КМ':          ['ip', 'role'],
  'Interconnect':          ['ip', 'model'],
  'Public':                ['ip', 'model'],
  'Management':            ['ip', 'model'],
  'Postgres':              [],
  'TPS':                   [],
  'Количество соединений': [],
};

function CategoryHoverTooltip({ catName, nodes }: { catName: string; nodes: NodeHealth[] }) {
  const description = CAT_DESCRIPTIONS[catName] ?? catName;
  const attrKeys = CAT_ATTR_KEYS[catName] ?? ['ip', 'role'];

  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
      background: colors.bg.elevated, border: `1px solid ${colors.border.muted}`, borderRadius: radius.md,
      padding: '10px 12px', zIndex: 200,
      boxShadow: '0 6px 20px rgba(0,0,0,0.8)', pointerEvents: 'none',
    }}>
      {/* Header */}
      <div style={{
        color: colors.text.dim, fontSize: typography.size.sm, fontWeight: typography.weight.semibold,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: 7, borderBottom: `1px solid ${colors.border.subtle}`, paddingBottom: 4,
      }}>
        {description}
      </div>

      {/* Node list */}
      {nodes.map((node, idx) => {
        const attrLine = attrKeys
          .map(k => node.attributes[k])
          .filter(Boolean)
          .join(' · ');
        const allSubs = node.indicators.flatMap(ind => ind.subIndicators);

        return (
          <div key={node.id} style={{
            marginBottom: idx < nodes.length - 1 ? 8 : 0,
            paddingBottom: idx < nodes.length - 1 ? 8 : 0,
            borderBottom: idx < nodes.length - 1 ? `1px solid ${colors.border.inner}` : 'none',
          }}>
            {/* Node header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              {dot(node.status, 6)}
              <span style={{ color: colors.text.primary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
                {attrLine || node.name}
              </span>
            </div>
            {/* Sub-indicator chips */}
            {allSubs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', paddingLeft: 12 }}>
                {allSubs.map(s => (
                  <span key={s.name} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: typography.size.sm, color: colors.text.label,
                  }}>
                    {dot(s.status, 5)}
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Arrow pointer */}
      <div style={{
        position: 'absolute', bottom: -5, left: 20,
        width: 0, height: 0,
        borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
        borderTop: `5px solid ${colors.border.muted}`,
      }} />
    </div>
  );
}

export function GroupNode({ data }: NodeProps) {
  const { group, onSelect } = data as unknown as GroupNodeData;
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const accent = getStatusColor(group.status);

  // Build category summary
  const catMap = new Map<string, NodeHealth[]>();
  for (const node of group.nodes) {
    const cat = node.category || 'Узлы';
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(node);
  }
  const categories = Array.from(catMap.entries());

  const critNodes = group.nodes.filter(n => n.status === 'critical').length;
  const warnNodes = group.nodes.filter(n => n.status === 'warning').length;

  return (
    <div style={{ position: 'relative', width: 268 }}>
      <Handle id="source-top"    type="source" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="source-right"  type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="source-left"   type="source" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="target-top"    type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="target-right"  type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="target-left"   type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{
        width: 268,
        background: `linear-gradient(160deg, ${accent}0d 0%, ${colors.bg.overlay} 100%)`,
        border: `1px solid ${accent}35`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: radius.xl,
        boxShadow: `0 0 10px ${accent}12`,
        cursor: 'default',
        userSelect: 'none',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '9px 12px 7px', borderBottom: `1px solid ${accent}20`, background: `${accent}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
            {dot(group.status, 8)}
            <span style={{ color: colors.text.vivid, fontWeight: typography.weight.bold, fontSize: typography.size.base, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {group.name}
            </span>
          </div>
          {group.description && (
            <div style={{ color: colors.text.subtle, fontSize: typography.size.sm, fontFamily: typography.fontMono, marginLeft: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={group.description}>
              {group.description}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 15, marginTop: 3 }}>
            <span style={{ color: colors.text.dim, fontSize: typography.size.sm }}>Узлов: {group.nodes.length}</span>
            {countBadge('critical', critNodes)}
            {countBadge('warning', warnNodes)}
          </div>
        </div>

        {/* ── Category CI rows ── */}
        <div style={{ padding: '4px 0' }}>
          {categories.map(([catName, nodes]) => {
            const catStatus = worstStatus(nodes.map(n => n.status));
            const crit = nodes.filter(n => n.status === 'critical').length;
            const warn = nodes.filter(n => n.status === 'warning').length;
            const c = getStatusColor(catStatus);
            return (
              <div
                key={catName}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '5px 12px',
                  borderBottom: `1px solid ${colors.border.separator}`,
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredCat(catName)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                {hoveredCat === catName && (
                  <CategoryHoverTooltip catName={catName} nodes={nodes} />
                )}
                {dot(catStatus, 7)}
                <span style={{ flex: 1, color: colors.text.tertiary, fontSize: typography.size.md, fontWeight: typography.weight.medium }}>
                  {catName}
                </span>
                <span style={{ color: colors.text.dim, fontSize: typography.size.sm }}>{nodes.length}</span>
                {crit > 0 && (
                  <span style={{ background: `${c}20`, border: `1px solid ${c}55`, color: c, borderRadius: radius.xs, padding: '0 4px', fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>{crit}</span>
                )}
                {warn > 0 && (() => {
                  const wc = getStatusColor('warning');
                  return <span style={{ background: `${wc}20`, border: `1px solid ${wc}55`, color: wc, borderRadius: radius.xs, padding: '0 4px', fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>{warn}</span>;
                })()}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div
          onClick={() => onSelect(group)}
          onPointerDown={e => e.stopPropagation()}
          style={{
            padding: '6px 12px', display: 'flex', justifyContent: 'flex-end',
            borderTop: `1px solid ${accent}15`, background: colors.bg.footer,
            cursor: 'pointer',
          }}
        >
          <span style={{ color: accent, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
            Детали →
          </span>
        </div>
      </div>
    </div>
  );
}
