import type { PakTemplate, PakAssignments } from '../types/templates';

const TEMPLATES_KEY = 'hm_templates_v1';
const ASSIGNMENTS_KEY = 'hm_assignments_v1';

export function loadTemplates(): PakTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveTemplates(t: PakTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(t));
}

export function loadAssignments(): PakAssignments {
  try {
    return JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveAssignments(a: PakAssignments): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(a));
}
