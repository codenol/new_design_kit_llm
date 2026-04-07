import React from "react";
import classNames from "classnames";
import "./groups.scss";

export interface GroupsProps {
  total: number;
  active?: number;
  items?: ("success" | "warning" | "critical" | "unavailable")[];
  label?: string;
  className?: string;
}

export const Groups: React.FC<GroupsProps> = ({
  total,
  active,
  items,
  label = "Групп",
  className,
}) => {
  const normalizedTotal = Math.max(0, total);
  const renderedItems =
    items && items.length > 0
      ? items.slice(0, normalizedTotal)
      : Array.from(
          { length: normalizedTotal },
          (_, index) => (index < Math.max(0, Math.min(active ?? normalizedTotal, normalizedTotal)) ? "success" : "unavailable"),
        );

  return (
    <div className={classNames("uikit-groups", className)}>
      <span className="uikit-groups__label">
        {label}: {normalizedTotal}
      </span>

      <div className="uikit-groups__dots">
        {renderedItems.map((tone, index) => (
          <span
            key={index}
            className={classNames(
              "uikit-groups__dot",
              `uikit-groups__dot--${tone}`,
            )}
          />
        ))}
      </div>
    </div>
  );
};
