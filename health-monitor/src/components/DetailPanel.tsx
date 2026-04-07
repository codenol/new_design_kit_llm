import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GroupHealth, NodeHealth, TopLevelIndicatorHealth, LowLevelIndicatorHealth, Status } from '../types';
import { getStatusColor, getStatusBg, getStatusLabel, worstStatus } from '../utils/healthRules';
import { colors, typography, radius, shadows, layout } from '../styles/tokens';

interface Props {
  group: GroupHealth | null;
  onClose: () => void;
}

// ─── tiny helpers ────────────────────────────────────────────────────────────

function dot(status: Status, size = 7, pulse = false) {
  const c = getStatusColor(status);
  return (
    <span
      className={pulse && status === 'critical' ? 'status-critical-pulse' : ''}
      style={{
        display: 'inline-block', flexShrink: 0,
        width: size, height: size, borderRadius: '50%',
        backgroundColor: c, boxShadow: `0 0 ${size}px ${c}80`,
      }}
    />
  );
}

function Badge({ status, count }: { status: Status; count: number }) {
  if (count === 0) return null;
  const c = getStatusColor(status);
  return (
    <span style={{
      background: `${c}20`, border: `1px solid ${c}50`, color: c,
      borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700,
    }}>{count}</span>
  );
}

// ─── sub-indicator row ───────────────────────────────────────────────────────

function SubIndRow({ sub }: { sub: LowLevelIndicatorHealth }) {
  const c = getStatusColor(sub.status);
  const pct = Math.min(100, Math.max(0, sub.value));
  const showBar = sub.value >= 0 && sub.value <= 100;
  const ruleText = [
    sub.rules.warning  ? `⚠ ${sub.rules.warning}`  : '',
    sub.rules.critical ? `⛔ ${sub.rules.critical}` : '',
  ].filter(Boolean).join('  ');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 8px', borderRadius: radius.sm,
      background: getStatusBg(sub.status),
      border: `1px solid ${c}25`,
      marginBottom: 3,
    }}>
      {dot(sub.status, 6)}
      <span style={{ color: colors.text.muted, fontSize: typography.size.md, flex: 1 }}>{sub.name}</span>
      {showBar && (
        <div style={{ width: 60, height: 4, borderRadius: 2, background: colors.border.subtle, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
      )}
      <span style={{ color: c, fontSize: typography.size.sm, fontFamily: typography.fontMono, fontWeight: typography.weight.bold, minWidth: 40, textAlign: 'right', flexShrink: 0 }}>
        {sub.value % 1 === 0 ? sub.value : sub.value.toFixed(1)}
      </span>
      {ruleText && (
        <span style={{ color: colors.text.subtle, fontSize: typography.size.xs, fontFamily: typography.fontMono, flexShrink: 0 }}>{ruleText}</span>
      )}
    </div>
  );
}

// ─── top-level indicator accordion ──────────────────────────────────────────

function IndicatorAccordion({ indicator }: { indicator: TopLevelIndicatorHealth }) {
  const [open, setOpen] = useState(indicator.status !== 'ok');
  const c = getStatusColor(indicator.status);
  return (
    <div style={{ border: `1px solid ${c}30`, borderRadius: radius.sm, overflow: 'hidden', marginBottom: 5 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 10px', background: `${c}0d`, border: 'none', cursor: 'pointer',
        }}
      >
        {dot(indicator.status, 7)}
        <span style={{ color: colors.text.secondary, fontWeight: typography.weight.semibold, fontSize: typography.size.base, flex: 1, textAlign: 'left' }}>
          {indicator.name}
        </span>
        <span style={{ color: colors.text.ghost, fontSize: typography.size.sm }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div style={{ padding: '6px 8px', background: colors.bg.canvas }}>
          {indicator.subIndicators.map(sub => (
            <SubIndRow key={sub.name} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── node row with hover tooltip ─────────────────────────────────────────────

function NodeTooltip({ node }: { node: NodeHealth }) {
  const badSubs = node.indicators.flatMap(i => i.subIndicators).filter(s => s.status !== 'ok' && s.status !== 'unknown');
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 'calc(100% + 4px)', zIndex: 100,
      background: colors.bg.elevated, border: `1px solid ${colors.border.muted}`, borderRadius: radius.md,
      padding: '10px 12px', boxShadow: shadows.tooltip, pointerEvents: 'none',
    }}>
      <div style={{ color: colors.text.dim, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, textTransform: 'uppercase', marginBottom: 6, borderBottom: `1px solid ${colors.border.subtle}`, paddingBottom: 4 }}>
        Состав: {node.name}
      </div>
      {Object.entries(node.attributes).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 2, fontSize: typography.size.md }}>
          <span style={{ color: colors.text.dim, minWidth: 56, flexShrink: 0 }}>{k}</span>
          <span style={{ color: colors.text.primary, fontFamily: typography.fontMono }}>{v}</span>
        </div>
      ))}
      {badSubs.length > 0 && (
        <>
          <div style={{ color: colors.text.dim, fontSize: typography.size.sm, marginTop: 6, marginBottom: 3 }}>Проблемы:</div>
          {badSubs.map(s => (
            <div key={s.name} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
              {dot(s.status, 5)}
              <span style={{ color: getStatusColor(s.status), fontSize: typography.size.sm }}>{s.name}: {s.value % 1 === 0 ? s.value : s.value.toFixed(1)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function NodeRow({ node, collapseKey }: { node: NodeHealth; collapseKey?: number }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(node.status !== 'ok');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (collapseKey) setExpanded(false);
  }, [collapseKey]);
  const c = getStatusColor(node.status);
  const shortName = node.name.split('-').slice(-2).join('-');

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 2 }}>
      {hovered && <NodeTooltip node={node} />}

      {/* Node header */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 10px',
          background: hovered ? `${c}0c` : colors.bg.surface,
          border: `1px solid ${hovered ? c + '40' : colors.border.subtle}`,
          borderLeft: `2px solid ${c}`,
          borderRadius: radius.sm,
          cursor: 'pointer',
          transition: 'background 0.1s, border-color 0.1s',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {dot(node.status, 7, true)}
        <span style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.md, flex: 1, fontFamily: typography.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={node.name}>
          {shortName}
        </span>
        {node.attributes.role && (
          <span style={{ color: colors.text.role, fontSize: typography.size.sm, flexShrink: 0 }}>{node.attributes.role}</span>
        )}
        {node.attributes.ip && (
          <span style={{ color: colors.text.subtle, fontSize: typography.size.sm, fontFamily: typography.fontMono, flexShrink: 0 }}>{node.attributes.ip}</span>
        )}
        <span style={{ color: colors.text.ghost, fontSize: typography.size.sm, flexShrink: 0 }}>{expanded ? '▾' : '▸'}</span>
      </div>

      {/* Expanded indicators */}
      {expanded && (
        <div style={{ padding: '6px 0 4px 12px' }}>
          {node.indicators.map(ind => (
            <IndicatorAccordion key={ind.id} indicator={ind} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── category section ─────────────────────────────────────────────────────────

function CategorySection({ catName, nodes, collapseKey, forceOpen }: {
  catName: string;
  nodes: NodeHealth[];
  collapseKey?: number;
  forceOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    if (collapseKey) setExpanded(false);
  }, [collapseKey]);

  const isExpanded = forceOpen ? true : expanded;

  const catStatus = worstStatus(nodes.map(n => n.status));
  const crit = nodes.filter(n => n.status === 'critical').length;
  const warn = nodes.filter(n => n.status === 'warning').length;
  const ok   = nodes.filter(n => n.status === 'ok').length;
  const c = getStatusColor(catStatus);

  return (
    <div style={{ marginBottom: 10, border: `1px solid ${c}35`, borderRadius: radius.md, overflow: 'hidden' }}>
      {/* CI row header */}
      <div style={{ position: 'relative' }}>
        <button
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          onClick={() => !forceOpen && setExpanded(e => !e)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: `${c}10`, border: 'none', cursor: forceOpen ? 'default' : 'pointer',
          }}
        >
          <span style={{ color: colors.text.ghost, fontSize: typography.size.sm, flexShrink: 0, transition: 'transform 0.15s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▶</span>
          {dot(catStatus, 8, true)}
          <span style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg, flex: 1, textAlign: 'left' }}>
            {catName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: colors.text.dim, fontSize: typography.size.md }}>{nodes.length} узл.</span>
            <Badge status="critical" count={crit} />
            <Badge status="warning"  count={warn} />
            <Badge status="ok"       count={ok} />
          </div>
        </button>

        {/* CI tooltip */}
        {tooltipVisible && !isExpanded && (
          <div style={{
            position: 'absolute', left: 12, right: 12, top: 'calc(100% + 4px)', zIndex: 50,
            background: colors.bg.elevated, border: `1px solid ${colors.border.muted}`, borderRadius: radius.md,
            padding: '10px 12px', boxShadow: shadows.tooltip, pointerEvents: 'none',
          }}>
            <div style={{ color: colors.text.dim, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, textTransform: 'uppercase', marginBottom: 6, borderBottom: `1px solid ${colors.border.subtle}`, paddingBottom: 4 }}>
              {catName} — {nodes.length} узлов
            </div>
            {nodes.slice(0, 8).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {dot(n.status, 6)}
                <span style={{ color: colors.text.primary, fontSize: typography.size.sm, fontFamily: typography.fontMono, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.name.split('-').slice(-2).join('-')}
                </span>
                {n.attributes.ip && <span style={{ color: colors.text.subtle, fontSize: typography.size.sm, fontFamily: typography.fontMono }}>{n.attributes.ip}</span>}
              </div>
            ))}
            {nodes.length > 8 && <div style={{ color: colors.text.dim, fontSize: typography.size.sm, marginTop: 4 }}>…и ещё {nodes.length - 8}</div>}
          </div>
        )}
      </div>

      {/* Node list */}
      {isExpanded && (
        <div style={{ padding: '8px 10px', background: colors.bg.nodeList }}>
          {nodes.map(node => (
            <NodeRow key={node.id} node={node} collapseKey={collapseKey} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main panel (portal) ─────────────────────────────────────────────────────

function PanelContent({ group, onClose }: { group: GroupHealth; onClose: () => void }) {
  const accent = getStatusColor(group.status);
  const statusLabel = getStatusLabel(group.status);
  const [search, setSearch] = useState('');
  const [collapseKey, setCollapseKey] = useState(0);

  // Group nodes by category
  const catMap = new Map<string, NodeHealth[]>();
  for (const node of group.nodes) {
    const cat = node.category || 'Узлы';
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(node);
  }

  const query = search.trim().toLowerCase();
  const categories = Array.from(catMap.entries())
    .map(([catName, nodes]) => {
      const filtered = query
        ? nodes.filter(n =>
            n.name.toLowerCase().includes(query) ||
            n.name.split('-').slice(-2).join('-').toLowerCase().includes(query) ||
            (n.attributes.ip ?? '').toLowerCase().includes(query) ||
            (n.attributes.role ?? '').toLowerCase().includes(query) ||
            (n.attributes.model ?? '').toLowerCase().includes(query)
          )
        : nodes;
      return [catName, filtered] as [string, NodeHealth[]];
    })
    .filter(([, nodes]) => nodes.length > 0);

  const totalNodes = group.nodes.length;
  const crit = group.nodes.filter(n => n.status === 'critical').length;
  const warn = group.nodes.filter(n => n.status === 'warning').length;
  const ok   = group.nodes.filter(n => n.status === 'ok').length;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: shadows.backdrop }}
      />

      {/* Drawer */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: layout.detailPanelWidth,
        background: colors.bg.elevated,
        borderLeft: `2px solid ${accent}`,
        boxShadow: shadows.drawer,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border.subtle}`, background: `${accent}0c`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span
                className={group.status === 'critical' ? 'status-critical-pulse' : ''}
                style={{ width: 10, height: 10, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, flexShrink: 0, display: 'inline-block' }}
              />
              <span style={{ color: colors.text.bright, fontWeight: typography.weight.bold, fontSize: typography.size.xl, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ background: `${accent}22`, border: `1px solid ${accent}55`, color: accent, borderRadius: radius.sm, padding: '2px 9px', fontSize: typography.size.md, fontWeight: typography.weight.bold }}>
                {statusLabel}
              </span>
              <button
                onClick={onClose}
                style={{ color: colors.text.dim, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2, display: 'flex', alignItems: 'center' }}
              >✕</button>
            </div>
          </div>
          {group.description && (
            <div style={{ color: colors.text.subtle, fontSize: typography.size.md, fontFamily: typography.fontMono, marginLeft: 18, marginBottom: 4 }}>
              {group.description}
            </div>
          )}
        </div>

        {/* Attributes */}
        {Object.keys(group.attributes).length > 0 && (
          <div style={{ padding: '8px 16px', borderBottom: `1px solid ${colors.border.subtle}`, flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {Object.entries(group.attributes).map(([k, v]) => (
                <div key={k} style={{ fontSize: typography.size.md }}>
                  <span style={{ color: colors.text.dim }}>{k}: </span>
                  <span style={{ color: colors.text.label }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ color: colors.text.dim, fontSize: typography.size.md }}>Всего узлов: <b style={{ color: colors.text.primary }}>{totalNodes}</b></span>
          <Badge status="critical" count={crit} />
          <Badge status="warning"  count={warn} />
          <Badge status="ok"       count={ok} />
        </div>

        {/* CI category sections */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Toolbar — фиксированная, не скроллится */}
          <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ color: colors.text.dim, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
              КЕ
            </span>
            {/* Search */}
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                color: colors.text.subtle, fontSize: typography.size.md, pointerEvents: 'none',
              }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Узел, IP, роль…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: colors.bg.overlay, border: `1px solid ${colors.border.subtle}`,
                  borderRadius: radius.sm, padding: '4px 8px 4px 22px',
                  color: colors.text.primary, fontSize: typography.size.md, outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = colors.border.focus; }}
                onBlur={e => { e.currentTarget.style.borderColor = colors.border.subtle; }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: colors.text.subtle, fontSize: typography.size.base, lineHeight: 1, padding: 0,
                  }}
                >✕</button>
              )}
            </div>
            {/* Collapse all */}
            <button
              onClick={() => { setCollapseKey(k => k + 1); setSearch(''); }}
              title="Свернуть все"
              style={{
                background: 'none', border: `1px solid ${colors.border.subtle}`, borderRadius: radius.sm,
                color: colors.text.dim, cursor: 'pointer', padding: '3px 7px',
                fontSize: typography.size.md, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.border.focus; e.currentTarget.style.color = colors.text.muted; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border.subtle; e.currentTarget.style.color = colors.text.dim; }}
            >
              <span style={{ fontSize: typography.size.sm }}>⊟</span> Свернуть
            </button>
          </div>

          {/* Results count when searching */}
          {query && (
            <div style={{ color: colors.text.dim, fontSize: typography.size.sm, marginBottom: 6 }}>
              Найдено:{' '}
              <b style={{ color: colors.text.primary }}>
                {categories.reduce((s, [, ns]) => s + ns.length, 0)}
              </b>{' '}из {totalNodes}
            </div>
          )}
          </div>{/* /Toolbar */}

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 14px', minHeight: 0 }}>
          {categories.length === 0 && query && (
            <div style={{ color: colors.text.subtle, fontSize: typography.size.base, textAlign: 'center', padding: '32px 0' }}>
              Ничего не найдено
            </div>
          )}

          {categories.map(([catName, nodes]) => (
            <CategorySection
              key={catName}
              catName={catName}
              nodes={nodes}
              collapseKey={collapseKey}
              forceOpen={!!query}
            />
          ))}
          </div>{/* /Scrollable list */}
        </div>
      </div>
    </div>
  );
}

export function DetailPanel({ group, onClose }: Props) {
  if (!group) return null;
  return createPortal(
    <PanelContent group={group} onClose={onClose} />,
    document.body
  );
}
