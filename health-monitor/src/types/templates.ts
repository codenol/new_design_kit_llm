export interface PakTemplate {
  id: string;
  name: string;
  pakType: string;
  description?: string;
  yaml: string;
  uploadedAt: string;
}

// pakId -> templateId
export type PakAssignments = Record<string, string>;
