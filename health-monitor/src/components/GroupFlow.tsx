import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GroupHealth } from '../types';
import { GroupNode } from './GroupNode';
import { getStatusColor } from '../utils/healthRules';
import { colors, radius } from '../styles/tokens';

const NODE_TYPES = { groupNode: GroupNode };

interface Props {
  groups: GroupHealth[];
  onSelectGroup: (group: GroupHealth) => void;
  selectedGroupId?: string;
}

const CARD_W  = 268;
const CARD_H  = 240;
const GAP_X   = 140;
const GAP_Y   = 100;
const COL_W   = CARD_W + GAP_X;
const ROW_H   = CARD_H + GAP_Y;
const PADDING = 40;

function getBestHandles(srcPos: { x: number; y: number }, tgtPos: { x: number; y: number }) {
  const dx = tgtPos.x - srcPos.x;
  const dy = tgtPos.y - srcPos.y;
  if (Math.abs(dx) > Math.abs(dy) * 1.3) {
    return dx > 0
      ? { sourceHandle: 'source-right', targetHandle: 'target-left' }
      : { sourceHandle: 'source-left',  targetHandle: 'target-right' };
  } else {
    return dy > 0
      ? { sourceHandle: 'source-bottom', targetHandle: 'target-top' }
      : { sourceHandle: 'source-top',    targetHandle: 'target-bottom' };
  }
}

interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  canvasW: number;
  canvasH: number;
}

/**
 * Topology-aware layout:
 *  Row 0 — source nodes, each centered over its own connected targets
 *  Row 1 — target nodes at integer columns (sorted to minimize crossings)
 *  Row 2+ — isolated nodes (no connections), centered in rows of up to 3
 *
 * Result for БД1→[СХД1,СХД2], БД2→[СХД3,СХД4]:
 *   БД1(col 0.5)          БД2(col 2.5)
 *   СХД1(0) СХД2(1)  СХД3(2) СХД4(3)
 *       MGMT(1)    SW(2)
 */
function layoutGroups(groups: GroupHealth[]): LayoutResult {
  const outEdges = new Map<string, string[]>();
  const incomingIds = new Set<string>();

  for (const g of groups) {
    const valid = g.connections.filter(id => groups.some(gg => gg.id === id));
    outEdges.set(g.id, valid);
    valid.forEach(id => incomingIds.add(id));
  }

  const sources  = groups.filter(g => (outEdges.get(g.id) ?? []).length > 0 && !incomingIds.has(g.id));
  const targets  = groups.filter(g => incomingIds.has(g.id));
  const isolated = groups.filter(g => (outEdges.get(g.id) ?? []).length === 0 && !incomingIds.has(g.id));

  // Sort targets by barycenter of their parent sources (minimise crossings)
  const srcIdxOf = new Map<string, number>();
  sources.forEach((g, i) => srcIdxOf.set(g.id, i));

  const targetBarycenter = (id: string) => {
    const parents = sources.filter(s => (outEdges.get(s.id) ?? []).includes(id));
    if (!parents.length) return 9999;
    return parents.reduce((sum, s) => sum + (srcIdxOf.get(s.id) ?? 0), 0) / parents.length;
  };
  const sortedTargets = [...targets].sort((a, b) => targetBarycenter(a.id) - targetBarycenter(b.id));

  // Assign integer columns to targets
  const tgtColOf = new Map<string, number>();
  sortedTargets.forEach((g, i) => tgtColOf.set(g.id, i));

  // Source column = average column of its connected targets (fractional)
  const sourceCol = (srcId: string) => {
    const outs = (outEdges.get(srcId) ?? []).filter(id => tgtColOf.has(id));
    if (!outs.length) return 0;
    return outs.reduce((sum, id) => sum + (tgtColOf.get(id) ?? 0), 0) / outs.length;
  };
  const sortedSources = [...sources].sort((a, b) => sourceCol(a.id) - sourceCol(b.id));

  // Isolated groups in rows of up to 3
  const ISO_COLS = 3;
  const isoIds = isolated.map(g => g.id);
  const isoRows: string[][] = [];
  for (let i = 0; i < isoIds.length; i += ISO_COLS) {
    isoRows.push(isoIds.slice(i, i + ISO_COLS));
  }

  const maxLayerLen = Math.max(sortedTargets.length, ...isoRows.map(r => r.length), 1);
  const positions: Record<string, { x: number; y: number }> = {};
  let currentRow = 0;

  if (sortedSources.length > 0) {
    sortedSources.forEach(g => {
      positions[g.id] = {
        x: sourceCol(g.id) * COL_W + PADDING,
        y: currentRow * ROW_H + PADDING,
      };
    });
    currentRow++;
  }

  if (sortedTargets.length > 0) {
    sortedTargets.forEach((g, i) => {
      positions[g.id] = {
        x: i * COL_W + PADDING,
        y: currentRow * ROW_H + PADDING,
      };
    });
    currentRow++;
  }

  for (const row of isoRows) {
    const startCol = (maxLayerLen - row.length) / 2;
    row.forEach((id, colIdx) => {
      positions[id] = {
        x: (startCol + colIdx) * COL_W + PADDING,
        y: currentRow * ROW_H + PADDING,
      };
    });
    currentRow++;
  }

  const canvasW = maxLayerLen * COL_W + PADDING * 2;
  const canvasH = Math.max(320, currentRow * ROW_H + PADDING * 2);
  return { positions, canvasW, canvasH };
}

export function GroupFlow({ groups, onSelectGroup, selectedGroupId }: Props) {
  const { positions, canvasW, canvasH } = useMemo(() => layoutGroups(groups), [groups]);

  const nodes: Node[] = useMemo(
    () =>
      groups.map(group => ({
        id: group.id,
        type: 'groupNode',
        position: positions[group.id] ?? { x: 0, y: 0 },
        data: { group, onSelect: onSelectGroup } as unknown as Record<string, unknown>,
        selected: group.id === selectedGroupId,
      })),
    [groups, positions, onSelectGroup, selectedGroupId]
  );

  const edges: Edge[] = useMemo(() => {
    const seen = new Set<string>();
    const result: Edge[] = [];
    for (const group of groups) {
      for (const targetId of group.connections) {
        const edgeKey = [group.id, targetId].sort().join('--');
        if (seen.has(edgeKey)) continue;
        seen.add(edgeKey);
        const targetGroup = groups.find(g => g.id === targetId);
        if (!targetGroup) continue;
        const worstSt = [group.status, targetGroup.status].includes('critical')
          ? 'critical'
          : [group.status, targetGroup.status].includes('warning')
          ? 'warning'
          : 'ok';
        const color = getStatusColor(worstSt);
        const srcPos = positions[group.id] ?? { x: 0, y: 0 };
        const tgtPos = positions[targetId] ?? { x: 0, y: 0 };
        const { sourceHandle, targetHandle } = getBestHandles(srcPos, tgtPos);
        result.push({
          id: `edge-${edgeKey}`,
          source: group.id,
          target: targetId,
          sourceHandle,
          targetHandle,
          type: 'smoothstep',
          style: { stroke: color, strokeWidth: 1.5, opacity: 0.8 },
          animated: false,
        });
      }
    }
    return result;
  }, [groups, positions]);

  const miniMapNodeColor = useCallback(
    (node: Node) => {
      const group = groups.find(g => g.id === node.id);
      return group ? getStatusColor(group.status) : '#6b7280';
    },
    [groups]
  );

  return (
    <div style={{ height: canvasH, width: '100%', minWidth: canvasW, borderRadius: radius.lg, overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elevateEdgesOnSelect
        panOnScroll
        panOnDrag
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={colors.border.muted} />
        <Controls style={{ background: colors.bg.surface, border: `1px solid ${colors.border.subtle}` }} showInteractive={false} />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(20,24,36,0.8)"
          style={{ background: colors.bg.surface, border: `1px solid ${colors.border.subtle}` }}
        />
      </ReactFlow>
    </div>
  );
}
