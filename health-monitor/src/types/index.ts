export type Status = 'ok' | 'warning' | 'critical' | 'unknown';

export interface StatusRule {
  warning?: string;
  critical?: string;
}

export interface LowLevelIndicator {
  name: string;
  metric: string;
  rules: StatusRule;
}

export interface TopLevelIndicator {
  id: string;
  name: string;
  sub_indicators: LowLevelIndicator[];
}

export interface ConfigNode {
  id: string;
  name: string;
  category: string;
  attributes: Record<string, string>;
  indicators: TopLevelIndicator[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  connections: string[];
  attributes: Record<string, string>;
  nodes: ConfigNode[];
}

export interface PAKMeta {
  location?: string;
  owner?: string;
  version?: string;
  uptimeSince?: string;
}

export interface PAK extends PAKMeta {
  id: string;
  name: string;
  groups: Group[];
}

export interface Contour {
  name: string;
  paks: PAK[];
}

export interface Config {
  contour: Contour;
}

// ─── Computed health model ─────────────────────────────────────────────────

export interface LowLevelIndicatorHealth {
  name: string;
  metric: string;
  value: number;
  status: Status;
  rules: StatusRule;
}

export interface TopLevelIndicatorHealth {
  id: string;
  name: string;
  status: Status;
  subIndicators: LowLevelIndicatorHealth[];
}

export interface NodeHealth {
  id: string;
  name: string;
  category: string;
  attributes: Record<string, string>;
  status: Status;
  indicators: TopLevelIndicatorHealth[];
}

export interface GroupHealth {
  id: string;
  name: string;
  description?: string;
  connections: string[];
  attributes: Record<string, string>;
  status: Status;
  nodes: NodeHealth[];
}

export interface PAKHealth extends PAKMeta {
  id: string;
  name: string;
  status: Status;
  groups: GroupHealth[];
}

export interface ContourHealth {
  name: string;
  status: Status;
  paks: PAKHealth[];
}
