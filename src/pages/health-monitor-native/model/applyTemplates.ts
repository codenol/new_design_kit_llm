import { resolveAssignmentRowForPak } from "./pakTemplateRows";
import { Config } from "./types";
import { PakAssignments, PakTemplate } from "./templateTypes";
import { parseConfig } from "./yamlParser";

export function applyTemplatesToConfig(
  config: Config,
  assignments: PakAssignments,
  templates: PakTemplate[],
): Config {
  if (!templates.length || !Object.keys(assignments).length) {
    return config;
  }

  const templateMap = new Map(templates.map((t) => [t.id, t]));

  return {
    ...config,
    contour: {
      ...config.contour,
      paks: config.contour.paks.map((pak) => {
        const rowId = resolveAssignmentRowForPak(pak);
        const templateId =
          (rowId && assignments[rowId]) || assignments[pak.id];
        if (!templateId) {
          return pak;
        }
        const template = templateMap.get(templateId);
        if (!template) {
          return pak;
        }

        try {
          const tplConfig = parseConfig(template.yaml);
          const tplPak = tplConfig.contour.paks[0];
          if (!tplPak) {
            return pak;
          }
          return { ...pak, groups: tplPak.groups };
        } catch {
          return pak;
        }
      }),
    },
  };
}
