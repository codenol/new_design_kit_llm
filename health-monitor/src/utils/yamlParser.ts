import yaml from 'js-yaml';
import type { Config, Contour, PAK, Group, ConfigNode, TopLevelIndicator, LowLevelIndicator } from '../types';

function parseLowLevel(raw: Record<string, unknown>): LowLevelIndicator {
  return {
    name: String(raw.name ?? ''),
    metric: String(raw.metric ?? ''),
    rules: {
      warning:  raw.rules ? String((raw.rules as Record<string, unknown>).warning  ?? '') || undefined : undefined,
      critical: raw.rules ? String((raw.rules as Record<string, unknown>).critical ?? '') || undefined : undefined,
    },
  };
}

function parseIndicator(raw: Record<string, unknown>): TopLevelIndicator {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    sub_indicators: ((raw.sub_indicators as Record<string, unknown>[] | undefined) ?? []).map(parseLowLevel),
  };
}

function parseNode(raw: Record<string, unknown>): ConfigNode {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    category: String(raw.category ?? 'Узлы'),
    attributes: (raw.attributes as Record<string, string>) ?? {},
    indicators: ((raw.indicators as Record<string, unknown>[] | undefined) ?? []).map(parseIndicator),
  };
}

function parseGroup(raw: Record<string, unknown>): Group {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    connections: (raw.connections as string[] | undefined) ?? [],
    attributes: (raw.attributes as Record<string, string>) ?? {},
    nodes: ((raw.nodes as Record<string, unknown>[] | undefined) ?? []).map(parseNode),
  };
}

function parsePAK(raw: Record<string, unknown>): PAK {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    location: raw.location ? String(raw.location) : undefined,
    owner: raw.owner ? String(raw.owner) : undefined,
    version: raw.version ? String(raw.version) : undefined,
    uptimeSince: raw.uptimeSince ? String(raw.uptimeSince) : undefined,
    groups: ((raw.groups as Record<string, unknown>[] | undefined) ?? []).map(parseGroup),
  };
}

function parseContour(raw: Record<string, unknown>): Contour {
  return {
    name: String(raw.name ?? ''),
    paks: ((raw.paks as Record<string, unknown>[] | undefined) ?? []).map(parsePAK),
  };
}

export function parseConfig(yamlText: string): Config {
  const raw = yaml.load(yamlText) as Record<string, unknown>;
  return { contour: parseContour((raw.contour as Record<string, unknown>) ?? {}) };
}

export function collectMetricKeys(config: Config): string[] {
  const keys = new Set<string>();
  for (const pak of config.contour.paks)
    for (const group of pak.groups)
      for (const node of group.nodes)
        for (const indicator of node.indicators)
          for (const sub of indicator.sub_indicators)
            keys.add(sub.metric);
  return Array.from(keys);
}
