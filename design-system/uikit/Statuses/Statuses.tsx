import React from "react";
import classNames from "classnames";
import "./statuses.scss";

export type StatusesTone = "success" | "warning" | "critical" | "unavailable";

export interface StatusesItem {
  id: string;
  label: string;
  tone?: StatusesTone;
  disabled?: boolean;
}

export interface StatusesProps {
  items: StatusesItem[];
  value?: string | null;
  className?: string;
  onChange?: (id: string) => void;
}

export const Statuses: React.FC<StatusesProps> = ({
  items,
  value = null,
  className,
  onChange,
}) => {
  return (
    <div className={classNames("uikit-statuses", className)}>
      {items.map((item) => {
        const tone = item.tone ?? "success";
        const selected = value === item.id;

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            className={classNames(
              "uikit-statuses__item",
              `uikit-statuses__item--${tone}`,
              {
                "is-selected": selected,
              },
            )}
            onClick={() => onChange?.(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
