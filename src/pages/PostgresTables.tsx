import React, { useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { AppLayout } from '../layout/AppLayout';

const POSTGRES_TABLES_BREADCRUMB: { label: string }[] = [{ label: 'Таблицы PostgreSQL' }];

export interface TableField {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  description: string;
}

export interface TableData {
  id: string;
  name: string;
  rowCount: number;
  size: string;
  description: string;
  schema: string;
  fields: TableField[];
}

export interface FilterState {
  searchQuery: string;
  schemaFilter: string;
}

const initialTables: TableData[] = [
  {
    id: 'table-001',
    name: 'users',
    rowCount: 1250,
    size: '2.4 MB',
    description: 'Основная таблица пользователей системы',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор пользователя' },
      { name: 'username', type: 'varchar(255)', nullable: false, default: null, description: 'Логин пользователя' },
      { name: 'email', type: 'varchar(255)', nullable: false, default: null, description: 'Email пользователя' },
      { name: 'password_hash', type: 'varchar(255)', nullable: false, default: null, description: 'Хеш пароля (bcrypt)' },
      { name: 'first_name', type: 'varchar(100)', nullable: true, default: null, description: 'Имя пользователя' },
      { name: 'last_name', type: 'varchar(100)', nullable: true, default: null, description: 'Фамилия пользователя' },
      { name: 'phone', type: 'varchar(20)', nullable: true, default: null, description: 'Телефон пользователя' },
      { name: 'status', type: 'varchar(50)', nullable: false, default: '"active"', description: 'Статус пользователя' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата создания записи' },
      { name: 'updated_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата последнего обновления' },
    ],
  },
  {
    id: 'table-002',
    name: 'roles',
    rowCount: 15,
    size: '48 KB',
    description: 'Роли пользователей и их права',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор роли' },
      { name: 'name', type: 'varchar(100)', nullable: false, default: null, description: 'Название роли' },
      { name: 'description', type: 'text', nullable: true, default: null, description: 'Описание роли' },
      { name: 'permissions', type: 'jsonb', nullable: false, default: '[]', description: 'Массив разрешений' },
      { name: 'is_system', type: 'boolean', nullable: false, default: 'false', description: 'Системная роль' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата создания роли' },
    ],
  },
  {
    id: 'table-003',
    name: 'permissions',
    rowCount: 45,
    size: '96 KB',
    description: 'Детальные разрешения доступа',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор разрешения' },
      { name: 'name', type: 'varchar(100)', nullable: false, default: null, description: 'Название разрешения' },
      { name: 'resource', type: 'varchar(100)', nullable: false, default: null, description: 'Ресурс (users, roles, settings)' },
      { name: 'action', type: 'varchar(50)', nullable: false, default: null, description: 'Действие (read, write, delete, admin)' },
      { name: 'description', type: 'text', nullable: true, default: null, description: 'Описание разрешения' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата создания' },
    ],
  },
  {
    id: 'table-004',
    name: 'user_roles',
    rowCount: 890,
    size: '1.8 MB',
    description: 'Связь пользователей и ролей (junction table)',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор записи' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null, description: 'ID пользователя' },
      { name: 'role_id', type: 'uuid', nullable: false, default: null, description: 'ID роли' },
      { name: 'assigned_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата назначения роли' },
      { name: 'assigned_by', type: 'uuid', nullable: true, default: null, description: 'ID пользователя, назначившего роль' },
    ],
  },
  {
    id: 'table-005',
    name: 'audit_logs',
    rowCount: 125000,
    size: '450 MB',
    description: 'Журнал аудита всех действий в системе',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор записи' },
      { name: 'user_id', type: 'uuid', nullable: true, default: null, description: 'ID пользователя (null для системных действий)' },
      { name: 'action', type: 'varchar(100)', nullable: false, default: null, description: 'Выполненное действие' },
      { name: 'resource_type', type: 'varchar(100)', nullable: false, default: null, description: 'Тип ресурса' },
      { name: 'resource_id', type: 'uuid', nullable: true, default: null, description: 'ID ресурса' },
      { name: 'old_value', type: 'jsonb', nullable: true, default: 'null', description: 'Значение до изменения' },
      { name: 'new_value', type: 'jsonb', nullable: true, default: 'null', description: 'Значение после изменения' },
      { name: 'ip_address', type: 'inet', nullable: true, default: null, description: 'IP адрес клиента' },
      { name: 'user_agent', type: 'text', nullable: true, default: null, description: 'User agent клиента' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата и время действия' },
    ],
  },
  {
    id: 'table-006',
    name: 'settings',
    rowCount: 25,
    size: '64 KB',
    description: 'Настройки системы',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор настройки' },
      { name: 'key', type: 'varchar(100)', nullable: false, default: null, description: 'Ключ настройки' },
      { name: 'value', type: 'jsonb', nullable: false, default: 'null', description: 'Значение настройки' },
      { name: 'category', type: 'varchar(100)', nullable: false, default: '"general"', description: 'Категория настройки' },
      { name: 'description', type: 'text', nullable: true, default: null, description: 'Описание настройки' },
      { name: 'is_editable', type: 'boolean', nullable: false, default: 'true', description: 'Разрешено ли редактирование' },
      { name: 'updated_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата последнего обновления' },
    ],
  },
  {
    id: 'table-007',
    name: 'sessions',
    rowCount: 5000,
    size: '120 MB',
    description: 'Активные сессии пользователей',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор сессии' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null, description: 'ID пользователя' },
      { name: 'token', type: 'varchar(500)', nullable: false, default: null, description: 'JWT токен' },
      { name: 'ip_address', type: 'inet', nullable: true, default: null, description: 'IP адрес' },
      { name: 'user_agent', type: 'text', nullable: true, default: null, description: 'User agent' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата создания сессии' },
      { name: 'expires_at', type: 'timestamp', nullable: false, default: null, description: 'Дата истечения сессии' },
    ],
  },
  {
    id: 'table-008',
    name: 'notifications',
    rowCount: 8500,
    size: '180 MB',
    description: 'Уведомления для пользователей',
    schema: 'public',
    fields: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', description: 'Уникальный идентификатор уведомления' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null, description: 'ID пользователя' },
      { name: 'type', type: 'varchar(50)', nullable: false, default: '"info"', description: 'Тип уведомления' },
      { name: 'title', type: 'varchar(255)', nullable: false, default: null, description: 'Заголовок уведомления' },
      { name: 'message', type: 'text', nullable: false, default: null, description: 'Сообщение уведомления' },
      { name: 'data', type: 'jsonb', nullable: true, default: 'null', description: 'Дополнительные данные' },
      { name: 'is_read', type: 'boolean', nullable: false, default: 'false', description: 'Прочитано ли' },
      { name: 'created_at', type: 'timestamp', nullable: false, default: 'now()', description: 'Дата создания' },
    ],
  },
];

const toast = React.createRef<Toast>();

export const PostgresTables: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    schemaFilter: '',
  });
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch = filterState.searchQuery === '' ||
        table.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
        table.description.toLowerCase().includes(filterState.searchQuery.toLowerCase());
      const matchesSchema = filterState.schemaFilter === '' ||
        table.schema.toLowerCase().includes(filterState.schemaFilter.toLowerCase());
      return matchesSearch && matchesSchema;
    });
  }, [tables, filterState]);

  const handleRefresh = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Список таблиц обновлён',
      life: 3000,
    });
  };

  const handleViewTable = (table: TableData) => {
    setSelectedTable(table);
    setIsDialogVisible(true);
  };

  const exportToCSV = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Данные экспортированы в CSV',
      life: 3000,
    });
  };

  const tableHeaderTemplate = () => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-table" />
      <span>Таблица</span>
    </div>
  );

  const tableRowsTemplate = (rowData: TableData) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-database" />
      <span>{rowData.name}</span>
    </div>
  );

  const tableSizeTemplate = (rowData: TableData) => (
    <span className="font-medium">{rowData.size}</span>
  );

  const tableDescriptionTemplate = (rowData: TableData) => (
    <div className="max-w-2rem overflow-hidden text-ellipsis">
      {rowData.description}
    </div>
  );

  const tableActionsTemplate = (rowData: TableData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        severity="secondary"
        onClick={() => handleViewTable(rowData)}
        className="p-button-text p-button-rounded"
        style={{ padding: '0.5rem 0.75rem' }}
      />
      <Button
        icon="pi pi-download"
        onClick={() => {}}
        className="p-button-text p-button-rounded"
        style={{ padding: '0.5rem 0.75rem' }}
      />
    </div>
  );

  return (
    <AppLayout breadcrumbTrail={POSTGRES_TABLES_BREADCRUMB}>
      <div className="flex flex-column h-full">
        <div className="flex flex-column md:flex-row justify-content-between align-items-between surface-card p-3 gap-3">
          <div>
            <h1 className="m-0">Таблицы PostgreSQL</h1>
            <p className="m-0 mt-1 text-secondary">
              Просмотр и управление таблицами базы данных
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              label="Обновить"
              icon="pi pi-refresh"
              onClick={handleRefresh}
              className="p-button-rounded"
            />
            <Button
              label="Экспорт CSV"
              icon="pi pi-download"
              onClick={exportToCSV}
              className="p-button-rounded"
            />
          </div>
        </div>

        <div className="flex flex-column md:flex-row surface-card p-3 gap-3">
          <div className="flex flex-column gap-2 flex-grow-1">
            <InputText
              placeholder="Поиск таблиц..."
              value={filterState.searchQuery}
              onChange={(e) => setFilterState({ ...filterState, searchQuery: (e.target as HTMLInputElement).value })}
              className="w-full"
            />
            <InputText
              placeholder="Фильтр по схеме..."
              value={filterState.schemaFilter}
              onChange={(e) => setFilterState({ ...filterState, schemaFilter: (e.target as HTMLInputElement).value })}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              label="Сводка"
              icon="pi pi-table"
              onClick={() => setViewMode('summary')}
              className={`p-button-rounded ${viewMode === 'summary' ? 'p-button-success' : 'p-button-secondary'}`}
            />
            <Button
              label="Детали"
              icon="pi pi-list"
              onClick={() => setViewMode('detailed')}
              className={`p-button-rounded ${viewMode === 'detailed' ? 'p-button-success' : 'p-button-secondary'}`}
            />
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-2">
          <DataTable
            value={filteredTables}
            tableStyle={{ minWidth: '60rem' }}
            paginator
            paginatorTemplate="FirstPageLinkPrevPageLinkPageLinksNextPageLinkLastPageLink"
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            dataKey="id"
            responsiveLayout="scroll"
          >
            <Column
              header={tableHeaderTemplate()}
              body={tableRowsTemplate}
              style={{ minWidth: '15rem' }}
            />
            <Column
              header="Строк"
              body={(rowData) => rowData.rowCount.toLocaleString()}
              style={{ minWidth: '10rem' }}
            />
            <Column
              header="Размер"
              body={tableSizeTemplate}
              style={{ minWidth: '10rem' }}
            />
            <Column
              header="Описание"
              body={tableDescriptionTemplate}
              style={{ minWidth: '20rem' }}
            />
            <Column
              header="Действия"
              body={tableActionsTemplate}
              style={{ minWidth: '15rem' }}
            />
          </DataTable>
        </div>

        <Dialog
          header={`Структура таблицы: ${selectedTable?.name}`}
          visible={isDialogVisible}
          style={{ width: '50rem' }}
          modal
          maximizable
          onHide={() => setIsDialogVisible(false)}
        >
          {selectedTable && (
            <div className="p-4">
              <div className="flex flex-column gap-2 mb-3">
                <span className="font-bold text-xl">{selectedTable.name}</span>
                <span className="text-secondary">{selectedTable.description}</span>
                <span className="text-sm text-secondary">
                  Схема: {selectedTable.schema} | Строк: {selectedTable.rowCount.toLocaleString()} | Размер: {selectedTable.size}
                </span>
              </div>

              <div className="overflow-auto border-round border-border-color border-200">
                <table className="w-full">
                  <thead className="p-2 bg-primary-500/10">
                    <tr>
                      <th className="text-left p-2">Поле</th>
                      <th className="text-left p-2">Тип</th>
                      <th className="text-left p-2">Nullable</th>
                      <th className="text-left p-2">Default</th>
                      <th className="text-left p-2">Описание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTable.fields.map((field) => (
                      <tr key={field.name} className="border-top border-border-color">
                        <td className="p-2 font-medium">{field.name}</td>
                        <td className="p-2 text-secondary">{field.type}</td>
                        <td className="p-2">
                          {field.nullable ? (
                            <span className="badge badge-success">NULL</span>
                          ) : (
                            <span className="badge badge-danger">NOT NULL</span>
                          )}
                        </td>
                        <td className="p-2 text-secondary">{field.default || '-'}</td>
                        <td className="p-2 text-secondary text-sm">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-content-end gap-2 mt-3">
                <Button
                  label="Закрыть"
                  icon="pi pi-times"
                  onClick={() => setIsDialogVisible(false)}
                  className="p-button-rounded"
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AppLayout>
  );
};
