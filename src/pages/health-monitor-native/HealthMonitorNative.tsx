import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "primereact/button";
import { AppLayout } from "../../layout/AppLayout";
import { CardPak, StatusesItem } from "uikit";
import { Drawer } from "uikit/Drawer";
import { ButtonChip } from "uikit/ButtonChip";
import { useToast } from "uikit/hook/useToast";
import { TemplateSettingsDialog } from "./TemplateSettingsDialog";
import { HmSearchField } from "./HmSearchField";
import { HealthStatus, GroupHealth, NodeHealth, PAKHealth } from "./model/types";
import {
  loadAssignments,
  loadTemplates,
  saveAssignments,
  saveTemplates,
} from "./model/templateStore";
import { DISPLAY_GROUP_COUNT } from "./model/mockPakCards";
import { useMockPakList } from "./model/useMockPakList";
import { worstStatus } from "./model/healthRules";
import { parseConfig } from "./model/yamlParser";
import { healthStatusToCardPakTone, healthStatusToUiTone } from "./model/statusTone";
import { GroupFlow } from "./components/GroupFlow";
import { GroupDetailDrawerContent } from "./components/GroupDetailDrawerContent";
import "./healthMonitorNative.scss";
import bundledConfigYaml from "./data/config.yaml?raw";

/** Проверка вложенного YAML при загрузке модуля; данные экрана пока из моков. */
parseConfig(bundledConfigYaml);

const BREADCRUMB = [{ label: "Мониторинг здоровья" }];

const statusLabels: Record<HealthStatus, string> = {
  ok: "Нормальные",
  warning: "Предупреждения",
  critical: "Критические",
  unknown: "Неизвестные",
};

const areaLabels = ["VIP-адреса", "Ноды", "БД", "Хранение", "Сеть"];

const areaCategoryMatchers: Record<string, RegExp[]> = {
  "VIP-адреса": [/vip/i],
  "Ноды": [/ноды/i, /узлы/i, /аппаратный узел/i, /vm/i, /вм/i],
  "БД": [/postgres/i, /\bdb\b/i, /бд/i, /соединен/i, /tps/i, /pg/i],
  "Хранение": [/диск/i, /схд/i, /shelf/i, /storage/i],
  "Сеть": [/interconnect/i, /network/i, /public/i, /management/i, /link/i, /сет/i],
};

function getAreaTone(pak: PAKHealth, areaLabel: string): "success" | "warning" | "critical" | "unavailable" {
  const patterns = areaCategoryMatchers[areaLabel] ?? [];
  if (!patterns.length) return "unavailable";

  const allNodes = pak.groups.flatMap((group: GroupHealth) => group.nodes);
  const matchedNodes = allNodes.filter((node: NodeHealth) => {
    const haystack = `${node.category} ${node.name}`.toLowerCase();
    return patterns.some((pattern) => pattern.test(haystack));
  });

  if (!matchedNodes.length) return "unavailable";
  return healthStatusToUiTone(worstStatus(matchedNodes.map((node: NodeHealth) => node.status)));
}

/** Список ПАК фиксированный; фильтры тулбара только подсвечивают совпадения, карточки не скрываются. */
function pakMatchesToolbarFilters(
  pak: PAKHealth,
  activeStatuses: HealthStatus[],
  searchQuery: string,
): boolean {
  const statusOk = activeStatuses.length === 0 || activeStatuses.includes(pak.status);
  const q = searchQuery.trim().toLowerCase();
  const searchOk =
    !q || pak.name.toLowerCase().includes(q) || pak.id.toLowerCase().includes(q);
  return statusOk && searchOk;
}

const HealthMonitorNative: React.FC = () => {
  const { showToast } = useToast();
  const [activeStatuses, setActiveStatuses] = useState<HealthStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const mockPaks = useMockPakList();
  const firstPakId = mockPaks[0]?.id ?? "";
  const [selectedPakId, setSelectedPakId] = useState<string>(() => firstPakId);
  const [expandedPakId, setExpandedPakId] = useState<string | null>(() => firstPakId || null);
  const [detailGroup, setDetailGroup] = useState<GroupHealth | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState(() => loadTemplates());
  const [assignments, setAssignments] = useState(() => loadAssignments());

  const selectedPak =
    mockPaks.find((pak) => pak.id === selectedPakId) ??
    mockPaks.find((pak) => pakMatchesToolbarFilters(pak, activeStatuses, searchQuery)) ??
    mockPaks[0] ??
    null;
  const toggleStatus = (status: HealthStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status],
    );
  };

  return (
    <AppLayout breadcrumbTrail={BREADCRUMB} initialThemeLight>
      <section className="hm-monitor-card">
        <section className="hm-toolbar">
          <div className="hm-toolbar-left">
            <HmSearchField
              variant="toolbar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {(["ok", "critical", "warning"] as const).map((status) => {
              const active =
                activeStatuses.length === 0 || activeStatuses.includes(status);
              const Icon = active ? Check : X;
              return (
                <ButtonChip
                  key={status}
                  active={active}
                  sentiment="outline"
                  chipSize="large"
                  iconPosition="text-and-icon"
                  onClick={() => toggleStatus(status)}
                  label={statusLabels[status]}
                  iconPos="right"
                  className="hm-skala-buttonchip"
                  icon={
                    <Icon
                      aria-hidden
                      size={16}
                      strokeWidth={2}
                      className="hm-skala-buttonchip__icon"
                    />
                  }
                />
              );
            })}
          </div>

          <Button
            label="Настройка шаблонов"
            onClick={() => setShowTemplateDialog(true)}
          />
        </section>

        <section className="hm-page-grid">
          <div className="hm-left">
            {mockPaks.map((pak) => {
              const isActive = selectedPak?.id === pak.id;
              const matchesToolbar = pakMatchesToolbarFilters(pak, activeStatuses, searchQuery);
              const pakTone = healthStatusToCardPakTone(pak.status);
              const displayGroups = pak.groups.slice(0, DISPLAY_GROUP_COUNT);
              const groupsItems = displayGroups.map((group) => healthStatusToUiTone(group.status));
              const dotNodes = displayGroups.flatMap((group) => group.nodes);
              const nodesTotal = dotNodes.length;
              const nodeCounters = dotNodes.reduce<Record<HealthStatus, number>>(
                (acc, node) => {
                  acc[node.status] += 1;
                  return acc;
                },
                { ok: 0, warning: 0, critical: 0, unknown: 0 },
              );

              const statuses: StatusesItem[] = areaLabels.map((label) => ({
                id: label,
                label,
                tone: getAreaTone(pak, label),
              }));

              return (
                <div
                  key={pak.id}
                  className={`hm-pak-card-wrap ${isActive ? "is-active" : ""} ${matchesToolbar ? "" : "hm-pak-card-wrap--dimmed"}`}
                  onClick={() => {
                    setSelectedPakId(pak.id);
                  }}
                >
                  <CardPak
                    className="hm-pak-card"
                    pakType="МБД.П"
                    name={pak.name}
                    tone={pakTone}
                    groupsTotal={Math.min(DISPLAY_GROUP_COUNT, displayGroups.length)}
                    groupsItems={groupsItems}
                    nodesTotal={nodesTotal}
                    nodesCounters={[
                      { severity: "critical", count: nodeCounters.critical },
                      { severity: "warning", count: nodeCounters.warning },
                      { severity: "unavailable", count: nodeCounters.unknown },
                    ]}
                    statuses={statuses}
                    expanded={expandedPakId === pak.id}
                    onExpandedChange={(next) => {
                      setExpandedPakId(next ? pak.id : null);
                      if (next) setSelectedPakId(pak.id);
                    }}
                  >
                    <div className="hm-pak-expanded-stack">
                      <p className="hm-pak-flow-hint">
                        На канвасе нажмите «Детали» у группы — справа откроется панель узлов и метрик.
                      </p>
                      <GroupFlow
                        groups={pak.groups}
                        onSelectGroup={setDetailGroup}
                        selectedGroupId={
                          detailGroup && pak.groups.some((g) => g.id === detailGroup.id)
                            ? detailGroup.id
                            : undefined
                        }
                      />
                    </div>
                  </CardPak>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <Drawer
        className="hm-detail-drawer"
        visible={!!detailGroup}
        onHide={() => setDetailGroup(null)}
        position="right"
        header={detailGroup?.name ?? "Детали группы"}
      >
        {detailGroup && (
          <GroupDetailDrawerContent
            key={detailGroup.id}
            detailGroup={detailGroup}
          />
        )}
      </Drawer>

      <TemplateSettingsDialog
        visible={showTemplateDialog}
        templates={templates}
        assignments={assignments}
        onHide={() => setShowTemplateDialog(false)}
        onSave={(nextTemplates, nextAssignments) => {
          setTemplates(nextTemplates);
          setAssignments(nextAssignments);
          saveTemplates(nextTemplates);
          saveAssignments(nextAssignments);
          setShowTemplateDialog(false);
          showToast({
            severity: "success",
            summary: "Сохранено",
            detail: "Настройки шаблонов применены",
          });
        }}
      />
    </AppLayout>
  );
};

export default HealthMonitorNative;
