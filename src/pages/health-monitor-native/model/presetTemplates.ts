import { PAK_TEMPLATE_ASSIGNMENT_ROWS } from "./pakTemplateRows";
import type { PakAssignments, PakTemplate } from "./templateTypes";

/** Префикс id предустановленных шаблонов — нельзя удалять из модалки. */
export const PRESET_TEMPLATE_ID_PREFIX = "preset_";

/** Назначение пресета по умолчанию для каждого типа ПАК (справа в модалке). */
export function buildDefaultAssignments(): PakAssignments {
  const a: PakAssignments = {};
  for (const row of PAK_TEMPLATE_ASSIGNMENT_ROWS) {
    const suffix = row.id.replace("pak_row_", "");
    a[row.id] = `${PRESET_TEMPLATE_ID_PREFIX}${suffix}`;
  }
  return a;
}

export function isPresetTemplateId(id: string): boolean {
  return id.startsWith(PRESET_TEMPLATE_ID_PREFIX);
}

function minimalYaml(pakLabel: string): string {
  return `contour:
  name: "Контур ${pakLabel}"
  paks:
    - id: pak-preset
      name: "ПАК ${pakLabel}"
      groups:
        - id: g-preset
          name: "Группа"
          nodes: []
`;
}

/** Один предустановленный шаблон на каждый тип ПАК из макета. */
export const DEFAULT_PRESET_TEMPLATES: PakTemplate[] =
  PAK_TEMPLATE_ASSIGNMENT_ROWS.map((row) => {
    const suffix = row.id.replace("pak_row_", "");
    return {
      id: `${PRESET_TEMPLATE_ID_PREFIX}${suffix}`,
      name: `Шаблон ${row.label}`,
      pakType: row.label,
      yaml: minimalYaml(row.label),
      uploadedAt: new Date(0).toISOString(),
    };
  });

const presetIds = new Set(DEFAULT_PRESET_TEMPLATES.map((t) => t.id));

/** Слияние: всегда все пресеты (с учётом правок из storage), затем пользовательские шаблоны. */
export function mergeTemplatesWithPresets(stored: PakTemplate[]): PakTemplate[] {
  const mergedPresets = DEFAULT_PRESET_TEMPLATES.map((p) => {
    const fromStorage = stored.find((t) => t.id === p.id);
    return fromStorage ?? p;
  });
  const userTemplates = stored.filter((t) => !presetIds.has(t.id));
  return [...mergedPresets, ...userTemplates];
}
