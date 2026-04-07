import classNames from "classnames";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { CardGroup } from "uikit";
import type { GroupHealth, HealthStatus, NodeHealth } from "../model/types";
import { healthStatusToCardGroupTone, healthStatusToUiTone } from "../model/statusTone";

export interface GroupNodeData {
  group: GroupHealth;
  onSelect: (group: GroupHealth) => void;
}

function nodePillTone(
  status: HealthStatus,
): "success" | "warning" | "critical" | "unavailable" {
  return healthStatusToUiTone(status);
}

const STATUS_SHORT: Record<HealthStatus, string> = {
  ok: "OK",
  warning: "Внимание",
  critical: "Критич.",
  unknown: "Неизв.",
};

function isMetricNode(node: NodeHealth): boolean {
  return node.attributes.value != null && node.attributes.value !== "";
}

export function GroupNode({ data }: NodeProps) {
  const { group, onSelect } = data as unknown as GroupNodeData;

  const nodesTotalHeader = (() => {
    const raw = group.attributes["nodes-total"];
    if (raw == null || raw === "") return group.nodes.length;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : group.nodes.length;
  })();

  const nodeCounters = group.nodes.reduce(
    (acc, n: NodeHealth) => {
      acc[n.status] += 1;
      return acc;
    },
    { ok: 0, warning: 0, critical: 0, unknown: 0 },
  );

  return (
    <div className="hm-group-node-rf">
      <Handle id="source-top" type="source" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="source-right" type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="source-left" type="source" position={Position.Left} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="target-top" type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="target-right" type="target" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle id="target-left" type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: "none" }} />

      <CardGroup
        className="hm-card-group-canvas"
        tone={healthStatusToCardGroupTone(group.status)}
        title={`Группа: ${group.name}`}
        description={group.description?.trim() || undefined}
        nodesTotal={nodesTotalHeader}
        nodesCounters={[
          { severity: "critical", count: nodeCounters.critical },
          { severity: "warning", count: nodeCounters.warning },
          { severity: "unavailable", count: nodeCounters.unknown },
        ]}
        onDetailsClick={() => onSelect(group)}
      >
        {group.nodes.length > 0 ? (
          <div className="uikit-card-group__slot-rows">
            {group.nodes.map((node: NodeHealth) => {
              const pill = nodePillTone(node.status);
              if (isMetricNode(node)) {
                const wb = node.attributes.badgeWarning;
                const cb = node.attributes.badgeCritical;
                return (
                  <div key={node.id} className="uikit-card-group__comp-row">
                    <div className="uikit-card-group__comp-left">
                      <span
                        className={classNames(
                          "uikit-card-group__comp-indicator",
                          `uikit-card-group__comp-indicator--${pill}`,
                          node.status === "critical" ? "hm-status-critical-pulse" : "",
                        )}
                        aria-hidden
                      />
                      <span className="uikit-card-group__comp-name" title={node.name}>
                        {node.name}
                      </span>
                    </div>
                    <div className="uikit-card-group__comp-right uikit-card-group__comp-metric-right">
                      <span className="uikit-card-group__comp-value">{node.attributes.value}</span>
                      {cb != null && cb !== "" ? (
                        <span className="uikit-nodes__counter uikit-nodes__counter--critical">{cb}</span>
                      ) : null}
                      {wb != null && wb !== "" ? (
                        <span className="uikit-nodes__counter uikit-nodes__counter--warning">{wb}</span>
                      ) : null}
                    </div>
                  </div>
                );
              }
              return (
                <div key={node.id} className="uikit-card-group__comp-row">
                  <div className="uikit-card-group__comp-left">
                    <span
                      className={classNames(
                        "uikit-card-group__comp-indicator",
                        `uikit-card-group__comp-indicator--${pill}`,
                        node.status === "critical" ? "hm-status-critical-pulse" : "",
                      )}
                      aria-hidden
                    />
                    <span
                      className="uikit-card-group__comp-name"
                      title={node.category ? `${node.category} · ${node.name}` : node.name}
                    >
                      {node.name}
                    </span>
                  </div>
                  <div className="uikit-card-group__comp-right">
                    <span
                      className={classNames(
                        "uikit-card-group__comp-pill",
                        `uikit-card-group__comp-pill--${pill}`,
                      )}
                    >
                      {STATUS_SHORT[node.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </CardGroup>
    </div>
  );
}
