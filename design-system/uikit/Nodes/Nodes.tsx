import React from "react";
import classNames from "classnames";
import "./nodes.scss";

type NodesSeverity = "success" | "warning" | "critical" | "unavailable";

export interface NodesCounter {
  severity: NodesSeverity;
  count: number;
}

export interface NodesProps {
  total: number;
  counters: NodesCounter[];
  label?: string;
  className?: string;
  showZeroCounters?: boolean;
}

export const Nodes: React.FC<NodesProps> = ({
  total,
  counters,
  label = "Узлов",
  className,
  showZeroCounters = false,
}) => {
  const visibleCounters = showZeroCounters
    ? counters
    : counters.filter((counter) => counter.count > 0);

  return (
    <div className={classNames("uikit-nodes", className)}>
      <span className="uikit-nodes__label">
        {label}: {total}
      </span>

      <div className="uikit-nodes__counters">
        {visibleCounters.map((counter) => (
          <span
            key={counter.severity}
            className={classNames(
              "uikit-nodes__counter",
              `uikit-nodes__counter--${counter.severity}`,
            )}
          >
            {counter.count}
          </span>
        ))}
      </div>
    </div>
  );
};
