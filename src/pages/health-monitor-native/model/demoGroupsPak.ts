import type {
  GroupHealth,
  HealthStatus,
  LowLevelIndicatorHealth,
  NodeHealth,
  PAKHealth,
  TopLevelIndicatorHealth,
} from "./types";
import { worstStatus } from "./healthRules";

const GROUP_DESCRIPTION = "Group description";

function sub(
  name: string,
  metric: string,
  value: number,
  status: HealthStatus,
): LowLevelIndicatorHealth {
  return { name, metric, value, status, rules: {} };
}

function top(id: string, name: string, subs: LowLevelIndicatorHealth[]): TopLevelIndicatorHealth {
  return {
    id,
    name,
    status: worstStatus(subs.map((s) => s.status)),
    subIndicators: subs,
  };
}

function indicatorsForVip(mode: "ok" | "warning" | "critical"): TopLevelIndicatorHealth[] {
  const master: HealthStatus = mode === "critical" ? "critical" : "ok";
  const rep: HealthStatus = mode === "warning" ? "warning" : "ok";
  return [
    top("vip", "VIP-адрес", [
      sub("VIP Master", "m_vip_m", master === "critical" ? 0 : 1, master),
      sub("VIP Replicas", "m_vip_r", mode === "warning" ? 1 : 2, rep),
    ]),
  ];
}

/** Карточка как в макете дроера СХД: ЦПУ, ОЗУ, ФС, Корень, температура, БП */
function indicatorsHardwareNodes(mode: "ok" | "warning" | "critical"): TopLevelIndicatorHealth[] {
  const cpu: HealthStatus = mode === "critical" ? "critical" : mode === "warning" ? "warning" : "ok";
  const cpuVal = mode === "critical" ? 98 : mode === "warning" ? 82 : 14;
  const rest = 14;
  return [
    top("hw", "Аппаратные индикаторы", [
      sub("ЦПУ", "m_cpu", cpuVal, cpu),
      sub("ОЗУ", "m_mem", rest, "ok"),
      sub("ФС", "m_fs", rest, "ok"),
      sub("Корень", "m_root", rest, "ok"),
      sub("Температура", "m_temp", rest, "ok"),
      sub("БП", "m_psu", rest, "ok"),
    ]),
  ];
}

function indicatorsForShelf(mode: "ok" | "warning" | "critical"): TopLevelIndicatorHealth[] {
  const links: HealthStatus = mode === "critical" ? "critical" : "ok";
  const disks: HealthStatus = mode === "warning" ? "warning" : "ok";
  return [
    top("shelf_hw", "Аппаратура полки", [
      sub("Линки (UP)", "m_links", mode === "critical" ? 55 : 100, links),
      sub("Дисков исправно", "m_disks", mode === "warning" ? 88 : 98, disks),
      sub("Температура", "m_st", 44, "ok"),
    ]),
  ];
}

function indicatorsForDbChild(label: "vip" | "nodes" | "pg" | "tps" | "conn"): TopLevelIndicatorHealth[] {
  if (label === "vip") return indicatorsForVip("ok");
  if (label === "nodes") return indicatorsHardwareNodes("ok");
  if (label === "pg") {
    return [
      top("pg", "Postgres", [
        sub("TPS", "m_pg_tps", 420, "ok"),
        sub("Соединения", "m_pg_conn", 6, "ok"),
      ]),
    ];
  }
  if (label === "tps") {
    return [top("tps", "TPS", [sub("TPS / с", "m_tps", 1280, "ok")])];
  }
  return [top("conn", "Соединения", [sub("Активные", "m_conn", 12, "ok")])];
}

function metricNode(
  id: string,
  name: string,
  category: string,
  value: string,
  indicators: TopLevelIndicatorHealth[],
  badges?: { warning?: number; critical?: number },
): NodeHealth {
  const attributes: Record<string, string> = { value };
  if (badges?.warning != null) attributes.badgeWarning = String(badges.warning);
  if (badges?.critical != null) attributes.badgeCritical = String(badges.critical);
  const status = worstStatus(indicators.map((i) => i.status));
  return {
    id,
    name,
    category,
    attributes,
    status,
    indicators,
  };
}

function childDbMetrics(prefix: string): NodeHealth[] {
  const rows: { id: string; label: string; key: "vip" | "nodes" | "pg" | "tps" | "conn" }[] = [
    { id: `${prefix}-vip`, label: "Vip-адрес", key: "vip" },
    { id: `${prefix}-nodes`, label: "Ноды", key: "nodes" },
    { id: `${prefix}-pg`, label: "Postgres", key: "pg" },
    { id: `${prefix}-tps`, label: "TPS", key: "tps" },
    { id: `${prefix}-conn`, label: "Количество соединений", key: "conn" },
  ];
  return rows.map((r) =>
    metricNode(r.id, r.label, "БД", "8", indicatorsForDbChild(r.key)),
  );
}

function groupHealth(
  id: string,
  name: string,
  status: HealthStatus,
  nodes: NodeHealth[],
  connections: string[],
): GroupHealth {
  return {
    id,
    name,
    description: GROUP_DESCRIPTION,
    connections,
    attributes: { "nodes-total": "8" },
    status,
    nodes,
  };
}

/** Левая группа СХД первого ПАКа в макете (дроер / дефолт раскрытого узла). */
export const FIRST_PAK_SHD_GROUP_ID = "g-mock-1-shd-left";
export const FIRST_PAK_SHD_DEFAULT_EXPANDED_NODE_ID = "mock-1-shd-l-u-msk49";

function hardwareModeForShdNode(
  nodeIndex: number,
  overall: HealthStatus,
  pakPrefix: string,
): "ok" | "warning" | "critical" {
  /* Первый ПАК: первый узел всегда с критичным ЦПУ по макету дроера */
  if (pakPrefix === "mock-1" && nodeIndex === 0) {
    return "critical";
  }
  if (overall === "critical") {
    return nodeIndex === 0 ? "critical" : "ok";
  }
  if (overall === "warning") {
    return nodeIndex === 0 ? "warning" : "ok";
  }
  return "ok";
}

function vipModeForShdLeft(overall: HealthStatus, pakPrefix: string): "ok" | "warning" | "critical" {
  if (pakPrefix === "mock-1") {
    return "ok";
  }
  if (overall === "critical" || overall === "warning") {
    return "warning";
  }
  return "ok";
}

function shelfModeForShdLeft(
  shelfIndex: number,
  overall: HealthStatus,
  pakPrefix: string,
): "ok" | "warning" | "critical" {
  if (pakPrefix === "mock-1") {
    return "ok";
  }
  if (overall === "warning") {
    return shelfIndex === 0 ? "warning" : "ok";
  }
  return "ok";
}

/**
 * Левое дерево СХД: в каждой секции — отдельные сущности (узлы, VIP, полки), не сводные строки.
 * Узлы: s3m-03b01-msk49 … msk48; дисковые полки: две полки с именами.
 */
function buildRichShdLeftNodes(pakPrefix: string, overall: HealthStatus): NodeHealth[] {
  const p = pakPrefix;
  return [
    metricNode(
      `${p}-shd-l-u-msk49`,
      "s3m-03b01-msk49",
      "Узлы",
      "8",
      indicatorsHardwareNodes(hardwareModeForShdNode(0, overall, p)),
    ),
    metricNode(
      `${p}-shd-l-u-msk46`,
      "s3m-03b01-msk46",
      "Узлы",
      "8",
      indicatorsHardwareNodes(hardwareModeForShdNode(1, overall, p)),
    ),
    metricNode(
      `${p}-shd-l-u-msk47`,
      "s3m-03b01-msk47",
      "Узлы",
      "8",
      indicatorsHardwareNodes(hardwareModeForShdNode(2, overall, p)),
    ),
    metricNode(
      `${p}-shd-l-u-msk48`,
      "s3m-03b01-msk48",
      "Узлы",
      "8",
      indicatorsHardwareNodes(hardwareModeForShdNode(3, overall, p)),
    ),
    metricNode(
      `${p}-shd-l-vip`,
      "Vip-адрес",
      "VIP-адрес",
      "8",
      indicatorsForVip(vipModeForShdLeft(overall, p)),
    ),
    metricNode(
      `${p}-shd-l-shelf1`,
      "DS224C-SHELF-01",
      "Дисковые полки",
      "6",
      indicatorsForShelf(shelfModeForShdLeft(0, overall, p)),
    ),
    metricNode(
      `${p}-shd-l-shelf2`,
      "DS224C-SHELF-02",
      "Дисковые полки",
      "6",
      indicatorsForShelf(shelfModeForShdLeft(1, overall, p)),
    ),
  ];
}

/** Правое дерево СХД — эталон «всё ок», та же вложенность сущностей. */
function buildRichShdRightNodes(pakPrefix: string): NodeHealth[] {
  const p = pakPrefix;
  return [
    metricNode(`${p}-shd-r-u-msk49`, "s3m-03b01-msk49", "Узлы", "8", indicatorsHardwareNodes("ok")),
    metricNode(`${p}-shd-r-u-msk46`, "s3m-03b01-msk46", "Узлы", "8", indicatorsHardwareNodes("ok")),
    metricNode(`${p}-shd-r-u-msk47`, "s3m-03b01-msk47", "Узлы", "8", indicatorsHardwareNodes("ok")),
    metricNode(`${p}-shd-r-u-msk48`, "s3m-03b01-msk48", "Узлы", "8", indicatorsHardwareNodes("ok")),
    metricNode(`${p}-shd-r-vip`, "Vip-адрес", "VIP-адрес", "8", indicatorsForVip("ok")),
    metricNode(
      `${p}-shd-r-shelf1`,
      "DS224C-SHELF-01",
      "Дисковые полки",
      "6",
      indicatorsForShelf("ok"),
    ),
    metricNode(
      `${p}-shd-r-shelf2`,
      "DS224C-SHELF-02",
      "Дисковые полки",
      "6",
      indicatorsForShelf("ok"),
    ),
  ];
}

export interface DemoPakBlueprintInput {
  id: string;
  name: string;
  dots: HealthStatus[];
  areas: Record<string, HealthStatus>;
}

/**
 * Один ПАК: два дерева (СХД1 → БД1/БД2), строки метрик как в макете.
 * Сводный статус блюпринта задаёт «левое» дерево; правое — эталон «всё ок».
 */
export function buildDemoStylePakFromBlueprint(bp: DemoPakBlueprintInput): PAKHealth {
  const p = bp.id;
  const allStatuses = [...bp.dots, ...Object.values(bp.areas)];
  const overall = worstStatus(allStatuses);

  const leftNodes = buildRichShdLeftNodes(p, overall);
  const rightNodes = buildRichShdRightNodes(p);

  const gShdLeft = groupHealth(
    `g-${p}-shd-left`,
    bp.id === "mock-1" ? "Группа СХД1" : "СХД1",
    worstStatus(leftNodes.map((n) => n.status)),
    leftNodes,
    [`g-${p}-bd1-left`, `g-${p}-bd2-left`],
  );
  const gBd1Left = groupHealth(`g-${p}-bd1-left`, "БД1", "ok", childDbMetrics(`${p}-bdl1`), []);
  const gBd2Left = groupHealth(`g-${p}-bd2-left`, "БД2", "ok", childDbMetrics(`${p}-bdl2`), []);

  const gShdRight = groupHealth(
    `g-${p}-shd-right`,
    "СХД1",
    "ok",
    rightNodes,
    [`g-${p}-bd1-right`, `g-${p}-bd2-right`],
  );
  const gBd1Right = groupHealth(`g-${p}-bd1-right`, "БД1", "ok", childDbMetrics(`${p}-bdr1`), []);
  const gBd2Right = groupHealth(`g-${p}-bd2-right`, "БД2", "ok", childDbMetrics(`${p}-bdr2`), []);

  const groups = [gShdLeft, gBd1Left, gBd2Left, gShdRight, gBd1Right, gBd2Right];
  const allNodes = groups.flatMap((g) => g.nodes);

  return {
    id: bp.id,
    name: bp.name,
    status: worstStatus(allNodes.map((n) => n.status)),
    groups,
  };
}

/** Превью на странице — тот же состав, что у левой «Группа СХД1». */
export function getFirstPakShdGroupDetail(): GroupHealth {
  const nodes = buildRichShdLeftNodes("mock-1", "ok");
  return groupHealth(
    FIRST_PAK_SHD_GROUP_ID,
    "Группа СХД1",
    worstStatus(nodes.map((n) => n.status)),
    nodes,
    ["g-mock-1-bd1-left", "g-mock-1-bd2-left"],
  );
}
