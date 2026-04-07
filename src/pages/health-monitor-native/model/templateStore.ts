import {
  buildDefaultAssignments,
  mergeTemplatesWithPresets,
} from "./presetTemplates";
import { PakAssignments, PakTemplate } from "./templateTypes";

const TEMPLATES_KEY = "hm_native_templates_v1";
const ASSIGNMENTS_KEY = "hm_native_assignments_v1";

export function loadTemplates(): PakTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return mergeTemplatesWithPresets([]);
    }
    return mergeTemplatesWithPresets(parsed);
  } catch {
    return mergeTemplatesWithPresets([]);
  }
}

export function saveTemplates(templates: PakTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function loadAssignments(): PakAssignments {
  const defaults = buildDefaultAssignments();
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) {
      return { ...defaults };
    }
    const parsed = JSON.parse(raw) as PakAssignments;
    if (!parsed || typeof parsed !== "object") {
      return { ...defaults };
    }
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveAssignments(assignments: PakAssignments): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}
