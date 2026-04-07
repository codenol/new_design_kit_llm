import React, { useId, useState } from "react";

import { ChevronRight } from "lucide-react";

import classNames from "classnames";

import { IndicatorsCard } from "../IndicatorsCard";

import type { IndicatorsCardItem } from "../IndicatorsCard";

import "./hostsCard.scss";

export type HostsCardTone = "success" | "warning" | "critical" | "unavailable";

export interface HostsCardProps {
  /** Имя хоста (в макете — s3m-03b01-msk49). */
  hostName: string;
  tone?: HostsCardTone;
  /** Заголовок вложенной карточки индикаторов. */
  indicatorsTitle?: string;
  /** Строки «Аппаратные индикаторы»; игнорируется, если передан `children`. */
  indicatorsItems?: IndicatorsCardItem[];
  className?: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Вместо `IndicatorsCard` по `indicatorsItems`. */
  children?: React.ReactNode;
}

export const HostsCard: React.FC<HostsCardProps> = ({
  hostName,
  tone = "critical",
  indicatorsTitle = "Аппаратные индикаторы",
  indicatorsItems = [],
  className,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  children,
}) => {
  const panelId = useId();
  const titleId = useId();
  const controlled = typeof expandedProp === "boolean";
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = controlled ? expandedProp! : uncontrolledExpanded;

  const setExpanded = (next: boolean) => {
    if (!controlled) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  };

  const hasCustomBody = children != null;
  const hasIndicators = !hasCustomBody && indicatorsItems.length > 0;

  return (
    <section
      className={classNames("uikit-hosts-card", `uikit-hosts-card--${tone}`, className)}
      aria-labelledby={titleId}
    >
      <div className="uikit-hosts-card__shell">
        <button
          type="button"
          className="uikit-hosts-card__header"
          aria-expanded={expanded}
          aria-controls={panelId}
          id={titleId}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight
            className={classNames("uikit-hosts-card__chevron", { "is-open": expanded })}
            aria-hidden
            size={16}
            strokeWidth={2}
          />
          <span className="uikit-hosts-card__header-main">
            <span
              className={classNames(
                "uikit-hosts-card__dot",
                `uikit-hosts-card__dot--${tone}`,
              )}
              aria-hidden
            />
            <span className="uikit-hosts-card__host-name">{hostName}</span>
          </span>
        </button>

        {expanded && (
          <div
            id={panelId}
            className="uikit-hosts-card__body"
            role="region"
            aria-label="Показатели хоста"
          >
            {hasCustomBody ? (
              children
            ) : hasIndicators ? (
              <IndicatorsCard title={indicatorsTitle} items={indicatorsItems} />
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};
