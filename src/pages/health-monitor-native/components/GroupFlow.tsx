import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GroupHealth, HealthStatus } from "../model/types";
import { GroupNode } from "./GroupNode";
import { getStatusColor, HM } from "./hmFlowTheme";

const NODE_TYPES = { groupNode: GroupNode };

interface Props {
  groups: GroupHealth[];
  onSelectGroup: (group: GroupHealth) => void;
  selectedGroupId?: string;
}

/** Ширина карточки группы — [card group](https://www.figma.com/design/DJhDpzg0kwETePJM8IBduy) */
const CARD_W = 370;
/** Базовая высота под CardGroup (до 5 строк метрик в дочерних группах) */
const CARD_H = 480;
const GAP_X = 140;
const GAP_Y = 100;
const COL_W = CARD_W + GAP_X;
const ROW_H = CARD_H + GAP_Y;
const PADDING = 40;

function getBestHandles(srcPos: { x: number; y: number }, tgtPos: { x: number; y: number }) {
  const dx = tgtPos.x - srcPos.x;
  const dy = tgtPos.y - srcPos.y;
  if (Math.abs(dx) > Math.abs(dy) * 1.3) {
    return dx > 0
      ? { sourceHandle: "source-right", targetHandle: "target-left" }
      : { sourceHandle: "source-left", targetHandle: "target-right" };
  }
  return dy > 0
    ? { sourceHandle: "source-bottom", targetHandle: "target-top" }
    : { sourceHandle: "source-top", targetHandle: "target-bottom" };
}

interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  canvasH: number;
}

function layoutGroups(groups: GroupHealth[]): LayoutResult {
  const outEdges = new Map<string, string[]>();
  const incomingIds = new Set<string>();

  for (const g of groups) {
    const valid = g.connections.filter((id) => groups.some((gg) => gg.id === id));
    outEdges.set(g.id, valid);
    valid.forEach((id) => incomingIds.add(id));
  }

  const sources = groups.filter(
    (g) => (outEdges.get(g.id) ?? []).length > 0 && !incomingIds.has(g.id),
  );
  const targets = groups.filter((g) => incomingIds.has(g.id));
  const isolated = groups.filter(
    (g) => (outEdges.get(g.id) ?? []).length === 0 && !incomingIds.has(g.id),
  );

  const srcIdxOf = new Map<string, number>();
  sources.forEach((g, i) => srcIdxOf.set(g.id, i));

  const targetBarycenter = (id: string) => {
    const parents = sources.filter((s) => (outEdges.get(s.id) ?? []).includes(id));
    if (!parents.length) return 9999;
    return parents.reduce((sum, s) => sum + (srcIdxOf.get(s.id) ?? 0), 0) / parents.length;
  };
  const sortedTargets = [...targets].sort((a, b) => targetBarycenter(a.id) - targetBarycenter(b.id));

  const tgtColOf = new Map<string, number>();
  sortedTargets.forEach((g, i) => tgtColOf.set(g.id, i));

  const sourceCol = (srcId: string) => {
    const outs = (outEdges.get(srcId) ?? []).filter((id) => tgtColOf.has(id));
    if (!outs.length) return 0;
    return outs.reduce((sum, id) => sum + (tgtColOf.get(id) ?? 0), 0) / outs.length;
  };
  const sortedSources = [...sources].sort((a, b) => sourceCol(a.id) - sourceCol(b.id));

  const ISO_COLS = 3;
  const isoIds = isolated.map((g) => g.id);
  const isoRows: string[][] = [];
  for (let i = 0; i < isoIds.length; i += ISO_COLS) {
    isoRows.push(isoIds.slice(i, i + ISO_COLS));
  }

  const maxLayerLen = Math.max(sortedTargets.length, ...isoRows.map((r) => r.length), 1);
  const positions: Record<string, { x: number; y: number }> = {};
  let currentRow = 0;

  if (sortedSources.length > 0) {
    sortedSources.forEach((g) => {
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

  const canvasH = Math.max(320, currentRow * ROW_H + PADDING * 2);
  return { positions, canvasH };
}

function edgeTone(a: HealthStatus, b: HealthStatus): HealthStatus {
  if (a === "critical" || b === "critical") return "critical";
  if (a === "warning" || b === "warning") return "warning";
  if (a === "unknown" || b === "unknown") return "unknown";
  return "ok";
}

function groupsStructureKey(groups: GroupHealth[]): string {
  return groups
    .map((g) => `${g.id}:${[...(g.connections ?? [])].sort().join(",")}`)
    .join("|");
}

export function GroupFlow({ groups, onSelectGroup, selectedGroupId }: Props) {
  const structureKey = groupsStructureKey(groups);
  const { positions, canvasH } = useMemo(
    () => layoutGroups(groups),
    // Только id и связи; при обновлении статусов раскладка не пересчитывается.
    [structureKey],
  );

  const nodes: Node[] = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        type: "groupNode",
        position: positions[group.id] ?? { x: 0, y: 0 },
        data: { group, onSelect: onSelectGroup } as unknown as Record<string, unknown>,
        selected: group.id === selectedGroupId,
      })),
    [groups, positions, onSelectGroup, selectedGroupId],
  );

  const edgeList = useMemo(() => {
    const seen = new Set<string>();
    const result: Edge[] = [];
    for (const group of groups) {
      for (const targetId of group.connections) {
        const edgeKey = [group.id, targetId].sort().join("--");
        if (seen.has(edgeKey)) continue;
        seen.add(edgeKey);
        const targetGroup = groups.find((g) => g.id === targetId);
        if (!targetGroup) continue;
        const worstSt = edgeTone(group.status, targetGroup.status);
        const color =
          worstSt === "ok"
            ? "var(--surface-border)"
            : getStatusColor(worstSt);
        const srcPos = positions[group.id] ?? { x: 0, y: 0 };
        const tgtPos = positions[targetId] ?? { x: 0, y: 0 };
        const { sourceHandle, targetHandle } = getBestHandles(srcPos, tgtPos);
        result.push({
          id: `edge-${edgeKey}`,
          source: group.id,
          target: targetId,
          sourceHandle,
          targetHandle,
          type: "smoothstep",
          style: { stroke: color, strokeWidth: 1.5, opacity: 0.85 },
          animated: false,
        });
      }
    }
    return result;
  }, [groups, positions]);

  return (
    <div
      className="hm-group-flow"
      style={{ height: canvasH, width: "100%" }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ReactFlow
        nodes={nodes}
        edges={edgeList}
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
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--surface-border)" />
        <Controls
          style={{
            background: HM.surface,
            border: `1px solid ${HM.border}`,
          }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
