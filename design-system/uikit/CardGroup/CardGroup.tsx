import React from "react";

import classNames from "classnames";

import { Button } from "primereact/button";

import { Nodes, NodesCounter } from "../Nodes";

import "./cardGroup.scss";



export type CardGroupTone = "success" | "warning" | "critical" | "unavailable";



export interface CardGroupProps {

  title: string;

  description?: string;

  tone?: CardGroupTone;

  nodesTotal: number;

  nodesCounters: NodesCounter[];

  detailsLabel?: string;

  onDetailsClick?: () => void;

  className?: string;

  children?: React.ReactNode;

}



export const CardGroup: React.FC<CardGroupProps> = ({

  title,

  description,

  tone = "success",

  nodesTotal,

  nodesCounters,

  detailsLabel = "Детали",

  onDetailsClick,

  className,

  children,

}) => {

  return (

    <section

      className={classNames("uikit-card-group", `uikit-card-group--${tone}`, className)}

    >

      <div className="uikit-card-group__header-block">

        <div className="uikit-card-group__header-row">

          <span className="uikit-card-group__indicator" aria-hidden />

          <span className="uikit-card-group__title">{title}</span>

        </div>

        {description ? (

          <p className="uikit-card-group__description">{description}</p>

        ) : null}

        <Nodes

          className="uikit-card-group__nodes"

          total={nodesTotal}

          counters={nodesCounters}

        />

      </div>

      <div className="uikit-card-group__body">

        {children ? <div className="uikit-card-group__slot">{children}</div> : null}

        <div className="uikit-card-group__footer">

          <Button

            type="button"

            label={detailsLabel}

            icon="pi pi-arrow-right"

            iconPos="right"

            className="p-button-text p-button-sm uikit-card-group__details-btn"

            onClick={(e) => {

              e.stopPropagation();

              onDetailsClick?.();

            }}

          />

        </div>

      </div>

    </section>

  );

};


