import { useState, useEffect, useMemo } from 'react';
import type { Config, ContourHealth, PAKHealth, GroupHealth, NodeHealth, TopLevelIndicatorHealth, LowLevelIndicatorHealth, Status } from '../types';
import type { MetricValues } from '../data/mockMetrics';
import { createInitialMetrics, tickMetrics } from '../data/mockMetrics';
import { evaluateStatus, worstStatus } from '../utils/healthRules';

const TICK_INTERVAL_MS = 5000;

function computeHealth(config: Config, metrics: MetricValues): ContourHealth {
  const pakHealthList: PAKHealth[] = config.contour.paks.map(pak => {
    const groupHealthList: GroupHealth[] = pak.groups.map(group => {
      const nodeHealthList: NodeHealth[] = group.nodes.map(node => {
        const indicatorHealthList: TopLevelIndicatorHealth[] = node.indicators.map(indicator => {
          const subHealthList: LowLevelIndicatorHealth[] = indicator.sub_indicators.map(sub => {
            const value = metrics[sub.metric] ?? 0;
            const status = evaluateStatus(value, sub.rules);
            return { name: sub.name, metric: sub.metric, value, status, rules: sub.rules };
          });
          const status = worstStatus(subHealthList.map(s => s.status));
          return { id: indicator.id, name: indicator.name, status, subIndicators: subHealthList };
        });
        const status = worstStatus(indicatorHealthList.map(i => i.status));
        return { id: node.id, name: node.name, category: node.category, attributes: node.attributes, status, indicators: indicatorHealthList };
      });
      const status = worstStatus(nodeHealthList.map(n => n.status));
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        connections: group.connections,
        attributes: group.attributes,
        status,
        nodes: nodeHealthList,
      };
    });
    const status = worstStatus(groupHealthList.map(g => g.status));
    return {
      id: pak.id,
      name: pak.name,
      location: pak.location,
      owner: pak.owner,
      version: pak.version,
      uptimeSince: pak.uptimeSince,
      status,
      groups: groupHealthList,
    };
  });

  const contourStatus: Status = worstStatus(pakHealthList.map(p => p.status));
  return { name: config.contour.name, status: contourStatus, paks: pakHealthList };
}

export function useHealthCalculator(config: Config) {
  const [metrics, setMetrics] = useState<MetricValues>(() => createInitialMetrics());

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => tickMetrics(prev));
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const health = useMemo(() => computeHealth(config, metrics), [config, metrics]);

  return { health, metrics };
}
