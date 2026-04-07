import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

import { DrawerBody } from "uikit";
import type { GroupHealth, HealthStatus, NodeHealth } from "../model/types";
import {
  categoryAggregateStatus,
  formatSubMetricValue,
  healthStatusToTone,
  nodeMatchesSearch,
  nodeMatchesStatusFilter,
  shouldFlattenSingleNodeCategory,
  sortCategoryEntries,
} from "../groupDetailDrawerHelpers";
import {
  FIRST_PAK_SHD_DEFAULT_EXPANDED_NODE_ID,
  FIRST_PAK_SHD_GROUP_ID,
} from "../model/demoGroupsPak";

const FILTER_STATUSES: HealthStatus[] = ["ok", "warning", "critical", "unknown"];

const statusFilterLabels: Record<HealthStatus, string> = {
  ok: "Норма",
  warning: "Предупреждение",
  critical: "Критично",
  unknown: "Неизвестно",
};

export interface GroupDetailDrawerContentProps {
  detailGroup: GroupHealth;
}

export const GroupDetailDrawerContent: React.FC<GroupDetailDrawerContentProps> = ({
  detailGroup,
}) => {
  const [drawerSearch, setDrawerSearch] = useState("");
  const [drawerStatusFilter, setDrawerStatusFilter] = useState<HealthStatus[]>([]);
  const filterPanelRef = useRef<OverlayPanel>(null);

  const groupedSorted = useMemo(() => {
    const map = new Map<string, NodeHealth[]>();
    for (const node of detailGroup.nodes) {
      const key = node.category || "Узлы";
      const arr = map.get(key) ?? [];
      arr.push(node);
      map.set(key, arr);
    }
    return sortCategoryEntries(Array.from(map.entries()));
  }, [detailGroup]);

  const [expandedCats, setExpandedCats] = useState<Set<string>>(() => {
    if (detailGroup.id === FIRST_PAK_SHD_GROUP_ID) {
      return new Set(["Узлы"]);
    }
    return new Set(groupedSorted.map(([k]) => k));
  });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (detailGroup.id === FIRST_PAK_SHD_GROUP_ID) {
      return new Set([FIRST_PAK_SHD_DEFAULT_EXPANDED_NODE_ID]);
    }
    return new Set();
  });

  /* Сброс только при смене группы (id), без лишних сбросов при обновлении метрик */
  useEffect(() => {
    setDrawerSearch("");
    setDrawerStatusFilter([]);
    const map = new Map<string, NodeHealth[]>();
    for (const node of detailGroup.nodes) {
      const key = node.category || "Узлы";
      const arr = map.get(key) ?? [];
      arr.push(node);
      map.set(key, arr);
    }
    const sorted = sortCategoryEntries(Array.from(map.entries()));
    if (detailGroup.id === FIRST_PAK_SHD_GROUP_ID) {
      setExpandedCats(new Set(["Узлы"]));
      setExpandedNodes(new Set([FIRST_PAK_SHD_DEFAULT_EXPANDED_NODE_ID]));
    } else {
      setExpandedCats(new Set(sorted.map(([k]) => k)));
      setExpandedNodes(new Set());
    }
  }, [detailGroup.id]);

  const visibleEntries = useMemo(() => {
    const q = drawerSearch;
    return groupedSorted
      .map(([cat, nodes]) => {
        const filtered = nodes.filter(
          (n) =>
            nodeMatchesSearch(n, cat, q) && nodeMatchesStatusFilter(n, drawerStatusFilter),
        );
        return [cat, filtered] as [string, NodeHealth[]];
      })
      .filter(([, nodes]) => nodes.length > 0);
  }, [groupedSorted, drawerSearch, drawerStatusFilter]);

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const toggleFilterStatus = (status: HealthStatus) => {
    setDrawerStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const clearFilters = () => {
    setDrawerStatusFilter([]);
    filterPanelRef.current?.hide();
  };

  const toggleExpandAll = useCallback(() => {
    const catKeys = visibleEntries.map(([c]) => c);
    if (catKeys.length === 0) return;
    setExpandedCats((prev) => {
      const allOpen = catKeys.every((c) => prev.has(c));
      return allOpen ? new Set<string>() : new Set(catKeys);
    });
  }, [visibleEntries]);

  return (
    <div className="hm-detail-root">
      <DrawerBody
        className="hm-detail-drawer-body"
        searchValue={drawerSearch}
        onSearchChange={setDrawerSearch}
        searchPlaceholder="Поиск"
        onExpandToggleClick={toggleExpandAll}
        expandToggleAriaLabel="Развернуть или свернуть все категории"
        toolbarExtra={
          <>
            <Button
              type="button"
              icon="pi pi-filter"
              rounded
              text
              className="hm-detail-filter-btn"
              onClick={(e) => filterPanelRef.current?.toggle(e)}
              aria-label="Фильтр по статусу узла"
            />
            <OverlayPanel ref={filterPanelRef} className="hm-detail-filter-overlay">
              <div className="hm-detail-filter-panel">
                <div className="hm-detail-filter-panel__title">Статус узла</div>
                {FILTER_STATUSES.map((st) => (
                  <label key={st} className="hm-detail-filter-row">
                    <input
                      type="checkbox"
                      checked={drawerStatusFilter.includes(st)}
                      onChange={() => toggleFilterStatus(st)}
                    />
                    <span>{statusFilterLabels[st]}</span>
                  </label>
                ))}
                <Button
                  type="button"
                  label="Сбросить"
                  className="p-button-text p-button-sm hm-detail-filter-clear"
                  onClick={clearFilters}
                />
              </div>
            </OverlayPanel>
          </>
        }
      >
        <div className="hm-detail-tree">
        {visibleEntries.map(([categoryName, nodes]) => {
          const catStatus = categoryAggregateStatus(nodes);
          const catTone = healthStatusToTone(catStatus);
          const catOpen = expandedCats.has(categoryName);
          const ChevronCat = catOpen ? ChevronDown : ChevronRight;

          return (
            <div
              key={categoryName}
              className={`hm-detail-block hm-detail-block--tone-${catTone}`}
            >
              <button
                type="button"
                className={`hm-detail-cat-row hm-detail-cat-row--tone-${catTone}`}
                onClick={() => toggleCategory(categoryName)}
              >
                <span
                  className={`hm-detail-status-dot hm-detail-status-dot--${catTone}`}
                  aria-hidden
                />
                <span className="hm-detail-cat-label">{categoryName}</span>
                <ChevronCat className="hm-detail-chevron" aria-hidden size={18} />
              </button>

              {catOpen && (
                <div className="hm-detail-cat-body">
                  {nodes.map((node) => {
                    const nodeTone = healthStatusToTone(node.status);
                    const nodeOpen = expandedNodes.has(node.id);
                    const ChevronNode = nodeOpen ? ChevronDown : ChevronRight;

                    const flat = shouldFlattenSingleNodeCategory(categoryName, nodes);

                    const indicatorBlocks = node.indicators.map((indicator) => (
                      <div key={indicator.id} className="hm-detail-indicator-card">
                        <div className="hm-detail-indicator-card__title">{indicator.name}</div>
                        <ul className="hm-detail-metric-list">
                          {indicator.subIndicators.map((sub) => {
                            const subTone = healthStatusToTone(sub.status);
                            return (
                              <li
                                key={`${node.id}_${indicator.id}_${sub.metric}`}
                                className="hm-detail-metric-row"
                              >
                                <span
                                  className={`hm-detail-metric-dot hm-detail-metric-dot--${subTone}`}
                                  aria-hidden
                                />
                                <span className="hm-detail-metric-name">{sub.name}</span>
                                <span className="hm-detail-metric-value">
                                  {formatSubMetricValue(sub)}
                                </span>
                                {sub.status === "critical" && (
                                  <ChevronRight
                                    className="hm-detail-metric-warn-icon"
                                    aria-hidden
                                    size={16}
                                  />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ));

                    if (flat) {
                      return (
                        <div
                          key={node.id}
                          className={`hm-detail-node-block hm-detail-node-block--tone-${nodeTone} hm-detail-node-block--flat`}
                        >
                          <div className="hm-detail-node-body hm-detail-node-body--flat">
                            {indicatorBlocks}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={node.id}
                        className={`hm-detail-node-block hm-detail-node-block--tone-${nodeTone}`}
                      >
                        <button
                          type="button"
                          className={`hm-detail-node-row hm-detail-node-row--tone-${nodeTone}`}
                          onClick={() => toggleNode(node.id)}
                        >
                          <span
                            className={`hm-detail-status-dot hm-detail-status-dot--${nodeTone}`}
                            aria-hidden
                          />
                          <span className="hm-detail-node-name">{node.name}</span>
                          <ChevronNode className="hm-detail-chevron" aria-hidden size={16} />
                        </button>

                        {nodeOpen && (
                          <div className="hm-detail-node-body">{indicatorBlocks}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </DrawerBody>
    </div>
  );
};
