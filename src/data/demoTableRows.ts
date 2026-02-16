export interface DemoTableRow {
  id: string;
  name: string;
  version: string;
  statusCode: string;
  statusName: string;
  category: string;
  selected?: boolean;
}

export const demoTableRows: DemoTableRow[] = [
  { id: '1', name: 'Компонент A', version: '1.0.0', statusCode: 'ok', statusName: 'OK', category: 'Основные' },
  { id: '2', name: 'Компонент B', version: '2.1.0', statusCode: 'warning', statusName: 'Предупреждение', category: 'Дополнительные' },
  { id: '3', name: 'Компонент C', version: '1.5.0', statusCode: 'critical', statusName: 'Критично', category: 'Основные' },
  { id: '4', name: 'Компонент D', version: '3.0.0', statusCode: 'info', statusName: 'Инфо', category: 'Служебные' },
  { id: '5', name: 'Компонент E', version: '0.9.0', statusCode: 'in-process', statusName: 'В процессе', category: 'Дополнительные' },
  { id: '6', name: 'Компонент F', version: '—', statusCode: 'not-available', statusName: 'N/A', category: 'Служебные' },
];
