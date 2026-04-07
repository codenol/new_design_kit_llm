import type { HealthStatus, PAKHealth } from "./types";
import { buildDemoStylePakFromBlueprint } from "./demoGroupsPak";

export const DISPLAY_GROUP_COUNT = 8;

const AREA_KEYS = ["VIP-адреса", "Ноды", "БД", "Хранение", "Сеть"] as const;

export interface MockPakBlueprint {
  id: string;
  name: string;
  /** 8 точек «Групп» (влияют на сводный статус и левое дерево метрик) */
  dots: HealthStatus[];
  /** Теги зон */
  areas: Record<(typeof AREA_KEYS)[number], HealthStatus>;
}

const U: HealthStatus = "unknown";
const O: HealthStatus = "ok";
const W: HealthStatus = "warning";
const C: HealthStatus = "critical";

function neutralAreas(): Record<(typeof AREA_KEYS)[number], HealthStatus> {
  return {
    "VIP-адреса": U,
    Ноды: U,
    БД: U,
    Хранение: U,
    Сеть: U,
  };
}

function okAreas(): Record<(typeof AREA_KEYS)[number], HealthStatus> {
  return {
    "VIP-адреса": O,
    Ноды: O,
    БД: O,
    Хранение: O,
    Сеть: O,
  };
}

export function getBaseMockBlueprints(): MockPakBlueprint[] {
  const baseName = "PCO-PRD-MBD.P";

  return [
    {
      id: "mock-1",
      name: `${baseName}-01`,
      dots: [U, U, U, U, U, U, U, U],
      areas: neutralAreas(),
    },
    {
      id: "mock-2",
      name: `${baseName}-02`,
      dots: [C, O, O, O, O, O, O, O],
      areas: { ...okAreas(), БД: C },
    },
    {
      id: "mock-3",
      name: `${baseName}-03`,
      dots: [O, W, O, O, O, O, O, O],
      areas: { ...okAreas(), Ноды: W },
    },
    {
      id: "mock-4",
      name: `${baseName}-04`,
      dots: [O, O, O, O, O, O, O, O],
      areas: okAreas(),
    },
    {
      id: "mock-5",
      name: `${baseName}-05`,
      dots: [O, O, O, O, O, O, O, O],
      areas: okAreas(),
    },
    {
      id: "mock-6",
      name: `${baseName}-06`,
      dots: [O, O, O, O, O, O, O, O],
      areas: okAreas(),
    },
    {
      id: "mock-7",
      name: `${baseName}-07`,
      dots: [O, O, O, O, O, O, O, O],
      areas: okAreas(),
    },
  ];
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

/**
 * Все ПАК в одном формате (два дерева СХД1→БД1/БД2, метрики).
 * Состав id/имён блюпринтов не меняется от seed; seed слегка меняет статусы точек/зон → левое дерево.
 */
export function buildMockPaksFromSeed(seed: number): PAKHealth[] {
  const rng = mulberry32(seed * 7919 + 104729);
  const bases = getBaseMockBlueprints();

  return bases.map((bp, rowIndex) => {
    const dots = bp.dots.map((st, i) => {
      if (rowIndex === 0) return U;
      if (rng() < 0.1) {
        return pick(rng, [O, O, O, W, C]);
      }
      if (i === (seed + rowIndex * 3) % 8 && rng() < 0.28) {
        return pick(rng, [O, W, C]);
      }
      return st;
    });

    const areas = { ...bp.areas };
    if (rowIndex !== 0) {
      AREA_KEYS.forEach((key) => {
        if (rng() < 0.07) {
          areas[key] = pick(rng, [O, W, C, U]);
        }
      });
    }

    return buildDemoStylePakFromBlueprint({ ...bp, dots, areas });
  });
}
