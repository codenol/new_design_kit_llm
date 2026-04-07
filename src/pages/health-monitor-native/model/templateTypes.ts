export interface PakTemplate {
  id: string;
  name: string;
  pakType: string;
  yaml: string;
  uploadedAt: string;
}

export type PakAssignments = Record<string, string>;
