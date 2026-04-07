import React, { useId } from "react";

import classNames from "classnames";

import "./indicatorsCard.scss";

export type IndicatorsCardItemStatus =
  | "success"
  | "warning"
  | "critical"
  | "unavailable";

export interface IndicatorsCardItem {
  id: string;
  label: string;
  value: string;
  status?: IndicatorsCardItemStatus;
}

export interface IndicatorsCardProps {
  /** Заголовок блока (в макете — «Аппаратные индикаторы»). */
  title?: string;
  items?: IndicatorsCardItem[];
  className?: string;
  /** Альтернатива `items`: произвольное содержимое вместо списка. */
  children?: React.ReactNode;
}

export const IndicatorsCard: React.FC<IndicatorsCardProps> = ({
  title = "Аппаратные индикаторы",
  items = [],
  className,
  children,
}) => {
  const titleId = useId();
  const hasCustomContent = children != null;

  return (
    <section
      className={classNames("uikit-indicators-card", className)}
      aria-labelledby={titleId}
    >
      <h4 id={titleId} className="uikit-indicators-card__title">
        {title}
      </h4>

      {hasCustomContent ? (
        <div className="uikit-indicators-card__slot">{children}</div>
      ) : (
        <ul className="uikit-indicators-card__list">
          {items.map((item) => {
            const tone = item.status ?? "success";
            return (
              <li key={item.id} className="uikit-indicators-card__list-item">
                <div className="uikit-indicators-card__row">
                  <div className="uikit-indicators-card__left">
                    <span
                      className={classNames(
                        "uikit-indicators-card__dot",
                        `uikit-indicators-card__dot--${tone}`,
                      )}
                      aria-hidden
                    />
                    <span className="uikit-indicators-card__label">{item.label}</span>
                  </div>
                  <span className="uikit-indicators-card__value">{item.value}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
