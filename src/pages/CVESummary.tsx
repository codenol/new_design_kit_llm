import React, { useRef, useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import type { DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { StatusBadge } from 'uikit/StatusBadge';
import { useToast } from 'uikit/hook/useToast';
import { Drawer } from 'uikit/Drawer';
import { AppLayout } from '../layout/AppLayout';

const severityToColor: Record<string, string> = {
  Critical: 'text-color-danger',
  High: 'text-color-warning',
  Medium: 'text-color-info',
  Low: 'text-color-success',
};

export interface CVE {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Unpatched' | 'Patched' | 'In Progress';
  description: string;
  cvssScore: number;
  publishedDate: string;
}

export interface CVEFixer {
  cveId: string;
  employeeName: string;
  fixedDate: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Patched';
  cvssScore: number;
}

export type StatsCategory = 'severity' | 'status';
export type StatsValue = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unpatched' | 'Patched' | 'In Progress';

export interface StatsCategoryItem {
  category: StatsCategory;
  value: StatsValue;
  label: string;
}

const CVE_BREADCRUMB: { label: string }[] = [{ label: 'Сводка по CVE' }];

const severityFilterOpts = [
  { label: 'Все severity', value: '' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const statusFilterOpts = [
  { label: 'Все статусы', value: '' },
  { label: 'Unpatched', value: 'unpatched' },
  { label: 'Patched', value: 'patched' },
  { label: 'In Progress', value: 'in-progress' },
];

const initialCVEs: CVE[] = [
  {
    id: 'CVE-2024-1234',
    severity: 'Critical',
    status: 'Unpatched',
    description: 'Критическая уязвимость в обработке входных данных',
    cvssScore: 9.8,
    publishedDate: '2024-01-15',
  },
  {
    id: 'CVE-2024-5678',
    severity: 'High',
    status: 'In Progress',
    description: 'Уязвимость переполнения буфера в модуле сжатия',
    cvssScore: 7.5,
    publishedDate: '2024-02-01',
  },
  {
    id: 'CVE-2024-9012',
    severity: 'Medium',
    status: 'Patched',
    description: 'SQL-инъекция в системе аутентификации',
    cvssScore: 6.1,
    publishedDate: '2024-01-20',
  },
  {
    id: 'CVE-2024-3456',
    severity: 'Low',
    status: 'Patched',
    description: 'Информационная уязвимость в CORS настройках',
    cvssScore: 3.7,
    publishedDate: '2024-02-10',
  },
  {
    id: 'CVE-2024-7890',
    severity: 'Critical',
    status: 'In Progress',
    description: 'Риск удалённого выполнения кода в веб-сервере',
    cvssScore: 9.1,
    publishedDate: '2024-02-15',
  },
  {
    id: 'CVE-2024-2345',
    severity: 'High',
    status: 'Unpatched',
    description: 'Уязвимость аутентификации в API',
    cvssScore: 8.2,
    publishedDate: '2024-01-25',
  },
];

const initialCVEFixers: CVEFixer[] = [
  {
    cveId: 'CVE-2024-1234',
    employeeName: 'Иван Петров',
    fixedDate: '2024-03-10T14:30:00',
    severity: 'Critical',
    status: 'Patched',
    cvssScore: 9.8,
  },
  {
    cveId: 'CVE-2024-9012',
    employeeName: 'Анна Сидорова',
    fixedDate: '2024-02-28T09:15:00',
    severity: 'Medium',
    status: 'Patched',
    cvssScore: 6.1,
  },
  {
    cveId: 'CVE-2024-3456',
    employeeName: 'Сергей Козлов',
    fixedDate: '2024-02-25T16:45:00',
    severity: 'Low',
    status: 'Patched',
    cvssScore: 3.7,
  },
];

const CVESummary: React.FC = () => {
  const rowMenuRef = useRef<Menu>(null);
  const [cves, setCves] = useState<CVE[]>(initialCVEs);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState(severityFilterOpts[0]);
  const [statusFilter, setStatusFilter] = useState(statusFilterOpts[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCVE, setSelectedCVE] = useState<CVE | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerCVE, setDrawerCVE] = useState<CVE | null>(null);
  const [selectedRow, setSelectedRow] = useState<CVE | null>(null);
  const [selectedRows, setSelectedRows] = useState<CVE[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [statsCategory, setStatsCategory] = useState<StatsCategory | null>(null);
  const [statsValue, setStatsValue] = useState<StatsValue | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statsCVEs, setStatsCVEs] = useState<CVE[]>([]);
  const { showToast } = useToast();

  const filteredCVEs = useMemo(() => {
    return cves.filter((cve) => {
      const matchSearch =
        !searchQuery ||
        cve.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSeverity =
        !severityFilter.value || cve.severity.toLowerCase() === severityFilter.value.toLowerCase();
      const matchStatus =
        !statusFilter.value || cve.status.toLowerCase() === statusFilter.value.toLowerCase();
      return matchSearch && matchSeverity && matchStatus;
    });
  }, [cves, searchQuery, severityFilter, statusFilter]);

  const handleRowSelect = (row: CVE) => {
    if (selectedRows.find((r) => r.id === row.id)) {
      setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
    setShowBulkActions(selectedRows.length >= 2);
  };

  const handleBulkActionSendToFix = () => {
    showToast({
      severity: 'info',
      summary: 'Отправлено на исправление',
      detail: `${selectedRows.length} CVE отправлено на исправление`,
    });
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  const handleBulkActionArchive = () => {
    showToast({
      severity: 'warn',
      summary: 'Архивировано',
      detail: `${selectedRows.length} CVE перемещено в архив`,
    });
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  const handleResetSelection = () => {
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  const openRowMenu = (e: React.MouseEvent, _cve: CVE) => {
    e.stopPropagation();
    rowMenuRef.current?.toggle(e);
  };

  const rowMenuItems = [
    {
      label: 'Детали',
      icon: 'pi pi-eye',
      command: () => {
        if (selectedRow) {
          setSelectedCVE(selectedRow);
          setShowDetails(true);
        }
      },
    },
    {
      label: 'Отправить на исправление',
      icon: 'pi pi-send',
      command: () => {
        showToast({
          severity: 'info',
          summary: 'Отправлено',
          detail: 'Задача на исправление создана',
        });
      },
    },
    { separator: true },
    {
      label: 'Архивировать',
      icon: 'pi pi-archive',
      command: () => {
        showToast({
          severity: 'warn',
          summary: 'Архивировано',
          detail: 'CVE перемещено в архив',
        });
      },
    },
  ];

  const onRowClick = (e: DataTableRowClickEvent) => {
    setDrawerCVE(e.data as CVE);
    setDrawerVisible(true);
  };

  const openDetails = (cve: CVE) => {
    setSelectedCVE(cve);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setDrawerCVE(null);
  };

  const handleStatsClick = (category: StatsCategory, value: StatsValue) => {
    setStatsCategory(category);
    setStatsValue(value);
    const filtered = cves.filter((cve) => {
      if (category === 'severity') {
        return cve.severity === value;
      } else if (category === 'status') {
        return cve.status === value;
      }
      return false;
    });
    setStatsCVEs(filtered);
    setStatsVisible(true);
  };

  return (
    <AppLayout breadcrumbTrail={CVE_BREADCRUMB}>
      <h1 style={{ marginTop: 0 }}>Сводка по CVE</h1>

      {/* Секция: Исправления от сотрудников */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Исправления от сотрудников</h2>
        <p className="text-color-secondary text-sm mb-3">Список сотрудников, которые недавно исправляли уязвимости</p>
        <DataTable
          value={initialCVEFixers}
          dataKey="cveId"
          sortMode="single"
          removableSort
          size="small"
          stripedRows
          className="p-datatable-striped"
        >
          <Column field="cveId" header="CVE ID" sortable body={(rowData: CVEFixer) => <a href={`#${rowData.cveId}`} className="text-color-primary hover:text-color-primary-hover">{rowData.cveId}</a>} />
          <Column field="employeeName" header="Сотрудник" sortable body={(rowData: CVEFixer) => <a href={`#employee-${rowData.employeeName}`} className="text-color-primary hover:text-color-primary-hover">{rowData.employeeName}</a>} />
          <Column field="fixedDate" header="Дата исправления" sortable body={(rowData: CVEFixer) => <span>{new Date(rowData.fixedDate).toLocaleString('ru-RU')}</span>} />
          <Column field="severity" header="Severity" sortable body={(rowData: CVEFixer) => <StatusBadge code={rowData.severity} name={rowData.severity} />} />
          <Column field="status" header="Статус" sortable body={(rowData: CVEFixer) => <StatusBadge code={rowData.status} name={rowData.status} />} />
          <Column field="cvssScore" header="CVSS Score" sortable body={(rowData: CVEFixer) => rowData.cvssScore.toFixed(1)} />
        </DataTable>
      </section>

      {/* Секция: Статистика */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Статистика</h2>
        <div className="flex flex-wrap gap-3">
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('severity', 'Critical')}
          >
            <div className="text-xl font-bold text-color-danger">
              {cves.filter((c) => c.severity === 'Critical').length}
            </div>
            <div className="text-color-secondary text-sm">Critical</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('severity', 'High')}
          >
            <div className="text-xl font-bold text-color-warning">
              {cves.filter((c) => c.severity === 'High').length}
            </div>
            <div className="text-color-secondary text-sm">High</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('severity', 'Medium')}
          >
            <div className="text-xl font-bold text-color-info">
              {cves.filter((c) => c.severity === 'Medium').length}
            </div>
            <div className="text-color-secondary text-sm">Medium</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('severity', 'Low')}
          >
            <div className="text-xl font-bold text-color-success">
              {cves.filter((c) => c.severity === 'Low').length}
            </div>
            <div className="text-color-secondary text-sm">Low</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('status', 'Unpatched')}
          >
            <div className="text-xl font-bold text-color-danger">
              {cves.filter((c) => c.status === 'Unpatched').length}
            </div>
            <div className="text-color-secondary text-sm">Unpatched</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('status', 'Patched')}
          >
            <div className="text-xl font-bold text-color-success">
              {cves.filter((c) => c.status === 'Patched').length}
            </div>
            <div className="text-color-secondary text-sm">Patched</div>
          </div>
          <div
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleStatsClick('status', 'In Progress')}
          >
            <div className="text-xl font-bold text-color-info">
              {cves.filter((c) => c.status === 'In Progress').length}
            </div>
            <div className="text-color-secondary text-sm">In Progress</div>
          </div>
          <div
            className="card"
            style={{
              minWidth: '14rem',
              background: 'var(--surface-card)',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div className="text-xl font-bold text-color-primary">
              {cves.length}
            </div>
            <div className="text-color-secondary text-sm">Всего CVE</div>
          </div>
        </div>
      </section>

      {/* Секция: Фильтры и поиск */}
      <section className="mb-4">
        <div className="flex flex-wrap align-items-center gap-2">
          <InputText
            placeholder="Поиск по CVE ID или описанию"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-inputtext-sm"
          />
          <Dropdown
            value={severityFilter}
            options={severityFilterOpts}
            onChange={(e) => setSeverityFilter(e.value)}
            optionLabel="label"
            placeholder="Severity"
            className="w-12rem p-inputtext-sm"
          />
          <Dropdown
            value={statusFilter}
            options={statusFilterOpts}
            onChange={(e) => setStatusFilter(e.value)}
            optionLabel="label"
            placeholder="Статус"
            className="w-12rem p-inputtext-sm"
          />
          <Button
            label="Сбросить фильтры"
            className="p-button-outlined p-button-sm"
            size="small"
            onClick={() => {
              setSearchQuery('');
              setSeverityFilter(severityFilterOpts[0]);
              setStatusFilter(statusFilterOpts[0]);
            }}
          />
        </div>
      </section>

      {/* Секция: Таблица CVE */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Список CVE</h2>
        <div
          className="card"
          style={{ minWidth: 0, overflow: 'auto', padding: 0 }}
        >
          {/* Bulk Actions Panel */}
          {showBulkActions && (
            <div
              className="card mb-2"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '0.75rem',
              }}
            >
              <div className="text-sm font-semibold mb-2">
                Bulk Actions ({selectedRows.length})
              </div>
              <div className="flex flex-wrap align-items-center gap-2">
                <Button
                  label="Отправить на исправление"
                  icon="pi pi-send"
                  className="p-button-outlined p-button-sm"
                  size="small"
                  onClick={handleBulkActionSendToFix}
                />
                <Button
                  label="Архивировать"
                  icon="pi pi-archive"
                  className="p-button-outlined p-button-sm"
                  size="small"
                  onClick={handleBulkActionArchive}
                />
                <Button
                  label="Сбросить выделение"
                  icon="pi pi-times"
                  className="p-button-outlined p-button-sm"
                  size="small"
                  onClick={handleResetSelection}
                />
              </div>
            </div>
          )}

          <DataTable
            value={filteredCVEs}
            dataKey="id"
            sortMode="single"
            removableSort
            size="small"
            stripedRows
            onRowClick={(e) => {
              setSelectedRow(e.data as CVE);
              setDrawerCVE(e.data as CVE);
              setDrawerVisible(true);
            }}
            rowClassName={() => 'cursor-pointer'}
          >
            <Column
              headerStyle={{ width: '3rem' }}
              body={(row: CVE) => (
                <div
                  className="flex align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowSelect(row);
                  }}
                >
                  <i className="pi pi-check" />
                </div>
              )}
            />
            <Column field="id" header="CVE ID" sortable body={(row: CVE) => row.id} />
            <Column header="Severity" sortable body={(row: CVE) => row.severity} />
            <Column header="Статус" sortable body={(row: CVE) => row.status} />
            <Column field="description" header="Описание" sortable />
            <Column
              header="CVSS Score"
              sortable
              body={(row: CVE) => row.cvssScore.toFixed(1)}
            />
            <Column
              field="publishedDate"
              header="Published Date"
              sortable
              body={(row: CVE) => row.publishedDate}
            />
            <Column
              headerStyle={{ width: '3rem' }}
              body={(row: CVE) => (
                <Button
                  icon="pi pi-ellipsis-v"
                  className="p-button-text p-button-rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRowMenu(e, row);
                  }}
                />
              )}
            />
          </DataTable>
        </div>
      </section>

      <Menu model={rowMenuItems} popup ref={rowMenuRef} />

      {/* Модальное окно: Детали CVE */}
      <Dialog
        header={selectedCVE ? `Детали: ${selectedCVE.id}` : 'Детали CVE'}
        visible={showDetails}
        style={{ width: '40rem' }}
        onHide={closeDetails}
      >
        {selectedCVE && (
          <div className="flex flex-column gap-3">
            {/* Карточка CVE ID */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">CVE ID</div>
              <div className="font-mono text-sm text-color-primary">
                {selectedCVE.id}
              </div>
            </div>

            {/* Карточка Severity */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">Severity</div>
              <StatusBadge
                code={selectedCVE.severity.toLowerCase()}
                name={selectedCVE.severity}
              />
            </div>

            {/* Карточка Статус */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">Статус</div>
              <StatusBadge
                code={selectedCVE.status.toLowerCase().replace(' ', '-')}
                name={selectedCVE.status}
              />
            </div>

            {/* Карточка CVSS Score */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">CVSS Score</div>
              <span
                className={
                  selectedCVE.cvssScore >= 9
                    ? 'text-color-danger'
                    : selectedCVE.cvssScore >= 7
                    ? 'text-color-warning'
                    : 'text-color-success'
                }
              >
                {selectedCVE.cvssScore.toFixed(1)}
              </span>
            </div>

            {/* Карточка Published Date */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">Published Date</div>
              <div className="text-color-secondary">
                {selectedCVE.publishedDate}
              </div>
            </div>

            {/* Карточка Описание */}
            <div
              className="card"
              style={{
                background: 'var(--surface-card)',
                borderRadius: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                padding: '1rem',
              }}
            >
              <div className="text-sm text-color-secondary mb-1">Описание</div>
              <div className="text-color-secondary">
                {selectedCVE.description}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Модальное окно: Статистика CVE */}
      <Dialog
        header={
          statsCategory === 'severity'
            ? `CVE по severity: ${statsValue}`
            : `CVE по статусу: ${statsValue}`
        }
        visible={statsVisible}
        style={{ width: '50rem' }}
        onHide={() => setStatsVisible(false)}
      >
        {statsCVEs.length > 0 && (
          <div className="flex flex-column gap-3">
            {statsCVEs.map((cve) => (
              <div
                key={cve.id}
                className="card"
                style={{
                  background: 'var(--surface-card)',
                  borderRadius: 4,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  padding: '1rem',
                }}
              >
                <div className="flex flex-column gap-2">
                  <div className="font-mono text-sm text-color-primary">
                    {cve.id}
                  </div>
                  <div className="flex align-items-center gap-2">
                    <div className="text-sm text-color-secondary">Severity:</div>
                    <StatusBadge
                      code={cve.severity.toLowerCase()}
                      name={cve.severity}
                    />
                  </div>
                  <div className="flex align-items-center gap-2">
                    <div className="text-sm text-color-secondary">Статус:</div>
                    <StatusBadge
                      code={cve.status.toLowerCase().replace(' ', '-')}
                      name={cve.status}
                    />
                  </div>
                  <div className="flex align-items-center gap-2">
                    <div className="text-sm text-color-secondary">CVSS Score:</div>
                    <span
                      className={
                        cve.cvssScore >= 9
                          ? 'text-color-danger'
                          : cve.cvssScore >= 7
                          ? 'text-color-warning'
                          : 'text-color-success'
                      }
                    >
                      {cve.cvssScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-color-secondary">
                    Published Date: {cve.publishedDate}
                  </div>
                  <div className="text-color-secondary">{cve.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      <Drawer
        visible={drawerVisible}
        onHide={closeDrawer}
        header={drawerCVE ? `Детали: ${drawerCVE.id}` : 'Детали CVE'}
        position="right"
      >
        {drawerCVE && (
          <div className="flex flex-column gap-2">
            <p>
              <strong>CVE ID:</strong>{' '}
              <span className="font-mono text-sm">{drawerCVE.id}</span>
            </p>
            <p>
              <strong>Severity:</strong>{' '}
              <StatusBadge
                code={drawerCVE.severity.toLowerCase()}
                name={drawerCVE.severity}
              />
            </p>
            <p>
              <strong>Статус:</strong>{' '}
              <StatusBadge
                code={drawerCVE.status.toLowerCase().replace(' ', '-')}
                name={drawerCVE.status}
              />
            </p>
            <p>
              <strong>CVSS Score:</strong>{' '}
              <span
                className={
                  drawerCVE.cvssScore >= 9
                    ? 'text-color-danger'
                    : drawerCVE.cvssScore >= 7
                    ? 'text-color-warning'
                    : 'text-color-success'
                }
              >
                {drawerCVE.cvssScore.toFixed(1)}
              </span>
            </p>
            <p>
              <strong>Published Date:</strong>{' '}
              <span className="text-color-secondary">
                {drawerCVE.publishedDate}
              </span>
            </p>
            <p>
              <strong>Описание:</strong>{' '}
              <span className="text-color-secondary">
                {drawerCVE.description}
              </span>
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                label="Закрыть"
                size="small"
                icon="pi pi-times"
                onClick={closeDrawer}
              />
              <Button
                label="Отправить на исправление"
                size="small"
                icon="pi pi-send"
                onClick={() => {
                  showToast({
                    severity: 'info',
                    summary: 'Отправлено',
                    detail: 'Задача на исправление создана',
                  });
                  closeDrawer();
                }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
};

export default CVESummary;
