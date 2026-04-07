import React, { useId } from "react";

import classNames from "classnames";

import { Groups } from "../Groups";

import { Nodes } from "../Nodes";

import { Statuses, StatusesItem } from "../Statuses";

import "./cardPak.scss";



export type CardPakTone = "success" | "warning" | "critical" | "unavailable";



export interface CardPakProps {

  pakType: string;

  name: string;

  tone?: CardPakTone;

  groupsTotal: number;

  groupsItems?: ("success" | "warning" | "critical" | "unavailable")[];

  nodesTotal: number;

  nodesCounters: {

    severity: "success" | "warning" | "critical" | "unavailable";

    count: number;

  }[];

  statuses: StatusesItem[];

  selectedStatusId?: string | null;

  onStatusChange?: (id: string) => void;

  expanded?: boolean;

  /** When set, the main block (title + groups + nodes) toggles expand; status chips stay independent. */

  onExpandedChange?: (expanded: boolean) => void;

  className?: string;

  children?: React.ReactNode;

}



export const CardPak: React.FC<CardPakProps> = ({

  pakType,

  name,

  tone = "success",

  groupsTotal,

  groupsItems,

  nodesTotal,

  nodesCounters,

  statuses,

  selectedStatusId,

  onStatusChange,

  expanded = false,

  onExpandedChange,

  className,

  children,

}) => {

  const panelId = useId();

  const expandable = typeof onExpandedChange === "function";



  const titleBlock = (

    <div className="uikit-card-pak__title">

      <span className="uikit-card-pak__title-primary">Тип ПАК: {pakType}</span>

      <span className="uikit-card-pak__title-primary">Имя: {name}</span>

    </div>

  );



  const metricsBlock = (

    <>

      <Groups className="uikit-card-pak__groups" total={groupsTotal} items={groupsItems} />

      <Nodes className="uikit-card-pak__nodes" total={nodesTotal} counters={nodesCounters} />

    </>

  );



  const bottomSlot = expanded ? (

    <div

      id={panelId}

      className="uikit-card-pak__bottom"

      role="region"

      aria-label="Дополнительное содержимое ПАК"

    >

      {children}

    </div>

  ) : null;



  if (!expandable) {

    return (

      <article

        className={classNames("uikit-card-pak", `uikit-card-pak--${tone}`, className, {

          "is-expanded": expanded,

        })}

      >

        <div className="uikit-card-pak__top">

          {titleBlock}

          <Statuses

            className="uikit-card-pak__statuses"

            items={statuses}

            value={selectedStatusId}

            onChange={onStatusChange}

          />

        </div>

        {metricsBlock}

        {bottomSlot}

      </article>

    );

  }



  return (

    <article

      className={classNames("uikit-card-pak", `uikit-card-pak--${tone}`, className, {

        "is-expanded": expanded,

        "uikit-card-pak--expandable": true,

      })}

    >

      <div className="uikit-card-pak__shell">

        <div className="uikit-card-pak__header-row">

          <button

            type="button"

            className="uikit-card-pak__expand-trigger"

            aria-expanded={expanded}

            aria-controls={expanded ? panelId : undefined}

            onClick={() => onExpandedChange(!expanded)}

          >

            <div className="uikit-card-pak__top">{titleBlock}</div>

            {metricsBlock}

          </button>

          <div

            className="uikit-card-pak__statuses-layer"

            onMouseDown={(e) => e.stopPropagation()}

            onClick={(e) => e.stopPropagation()}

          >

            <Statuses

              className="uikit-card-pak__statuses"

              items={statuses}

              value={selectedStatusId}

              onChange={onStatusChange}

            />

          </div>

        </div>

      </div>

      {bottomSlot}

    </article>

  );

};


