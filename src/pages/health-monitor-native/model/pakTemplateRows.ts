/**
 * Фиксированный список типов ПАК для назначения шаблонов (макет / продукт).
 * Ключи стабильны для localStorage.
 */
export const PAK_TEMPLATE_ASSIGNMENT_ROWS = [
  { id: "pak_row_mbd_p", label: "МБД.П" },
  { id: "pak_row_mhd_o", label: "МХД.О" },
  { id: "pak_row_mdi_o", label: "МДИ.О" },
  { id: "pak_row_mv_s", label: "МВ.С" },
  { id: "pak_row_mv_vrm", label: "МВ.ВРМ" },
  { id: "pak_row_mdi_k", label: "МДИ.К" },
  { id: "pak_row_mbd_g", label: "МБД.Г" },
  { id: "pak_row_mbd_kh", label: "МБД.КХ" },
] as const;

export type PakTemplateAssignmentRowId =
  (typeof PAK_TEMPLATE_ASSIGNMENT_ROWS)[number]["id"];

const rowIds = new Set(
  PAK_TEMPLATE_ASSIGNMENT_ROWS.map((r) => r.id),
) as Set<string>;

/** Проверка ключа назначения (после загрузки из storage). */
export function isPakTemplateAssignmentRowId(id: string): id is PakTemplateAssignmentRowId {
  return rowIds.has(id);
}

/**
 * Определяет строку назначения для ПАК из конфига/мока по id и имени.
 * Порядок: сначала более специфичные шаблоны строк.
 */
export function resolveAssignmentRowForPak(pak: {
  id: string;
  name: string;
}): PakTemplateAssignmentRowId | undefined {
  const s = `${pak.id} ${pak.name}`.toLowerCase();

  if (/мбд\.кх|mbd\.kh|mbd-kh|мбдкх/i.test(s)) return "pak_row_mbd_kh";
  if (/мбд\.г|mbd\.g\b/i.test(s)) return "pak_row_mbd_g";
  if (/мди\.к|mdi\.k/i.test(s)) return "pak_row_mdi_k";
  if (/мв\.врм|mv\.vrm/i.test(s)) return "pak_row_mv_vrm";
  if (/мв\.с|mv\.s\b/i.test(s)) return "pak_row_mv_s";
  if (/мди\.о|mdi\.o/i.test(s)) return "pak_row_mdi_o";
  if (/мхд\.о|mhd\.o/i.test(s)) return "pak_row_mhd_o";
  if (/мбд\.п|mbd\.p|mbd-p|мбд-п|mbd\.p-/i.test(s)) return "pak_row_mbd_p";

  return undefined;
}
