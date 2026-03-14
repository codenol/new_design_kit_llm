import React, { useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { StatusBadge } from 'uikit/StatusBadge';
import { useToast } from 'uikit/hook/useToast';
import { AppLayout } from '../layout/AppLayout';

const HEALTH_DASHBOARD_BREADCRUMB: { label: string }[] = [{ label: 'Health Dashboard' }];

export interface ComponentData {
  id: string;
  name: string;
  type: 'database' | 'cache' | 'queue' | 'api' | 'service';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  errors: Array<{ message: string; timestamp: string }>;
}

export interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  component: string;
  timestamp: string;
  status: 'active' | 'resolved';
  severity: 'high' | 'medium' | 'low';
}

export interface FilterState {
  statusFilter: Array<'healthy' | 'degraded' | 'unhealthy' | 'unknown'>;
  typeFilter: Array<'database' | 'cache' | 'queue' | 'api' | 'service'>;
  searchQuery: string;
}

const initialComponents: ComponentData[] = [
  {
    id: 'comp-001',
    name: 'Primary Database',
    type: 'database',
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 12,
    activeConnections: 156,
    errors: [],
  },
  {
    id: 'comp-002',
    name: 'Redis Cache',
    type: 'cache',
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    cpuUsage: 23,
    memoryUsage: 45,
    diskUsage: 12,
    networkLatency: 5,
    activeConnections: 89,
    errors: [],
  },
  {
    id: 'comp-003',
    name: 'Message Queue',
    type: 'queue',
    status: 'degraded',
    lastCheck: new Date().toISOString(),
    cpuUsage: 78,
    memoryUsage: 85,
    diskUsage: 45,
    networkLatency: 150,
    activeConnections: 234,
    errors: [
      { message: 'High memory usage detected', timestamp: new Date().toISOString() },
    ],
  },
  {
    id: 'comp-004',
    name: 'API Gateway',
    type: 'api',
    status: 'unhealthy',
    lastCheck: new Date().toISOString(),
    cpuUsage: 92,
    memoryUsage: 95,
    diskUsage: 67,
    networkLatency: 500,
    activeConnections: 45,
    errors: [
      { message: 'Connection timeout', timestamp: new Date().toISOString() },
      { message: 'Service unavailable', timestamp: new Date().toISOString() },
    ],
  },
  {
    id: 'comp-005',
    name: 'Auth Service',
    type: 'service',
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    cpuUsage: 34,
    memoryUsage: 56,
    diskUsage: 34,
    networkLatency: 8,
    activeConnections: 67,
    errors: [],
  },
  {
    id: 'comp-006',
    name: 'Analytics Service',
    type: 'service',
    status: 'unknown',
    lastCheck: new Date().toISOString(),
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    activeConnections: 0,
    errors: [
      { message: 'Component not responding', timestamp: new Date().toISOString() },
    ],
  },
];

const initialAlerts: AlertData[] = [
  {
    id: 'alert-001',
    type: 'critical',
    message: 'API Gateway experiencing high latency',
    component: 'API Gateway',
    timestamp: new Date().toISOString(),
    status: 'active',
    severity: 'high',
  },
  {
    id: 'alert-002',
    type: 'warning',
    message: 'Message Queue memory usage above threshold',
    component: 'Message Queue',
    timestamp: new Date().toISOString(),
    status: 'active',
    severity: 'medium',
  },
  {
    id: 'alert-003',
    type: 'info',
    message: 'Scheduled maintenance window approaching',
    component: 'System',
    timestamp: new Date().toISOString(),
    status: 'active',
    severity: 'low',
  },
];

const statusFilterOpts = [
  { label: 'Все статусы', value: [] },
  { label: 'Healthy', value: ['healthy'] },
  { label: 'Degraded', value: ['degraded'] },
  { label: 'Unhealthy', value: ['unhealthy'] },
  { label: 'Unknown', value: ['unknown'] },
];

const typeFilterOpts = [
  { label: 'Все типы', value: [] },
  { label: 'Database', value: ['database'] },
  { label: 'Cache', value: ['cache'] },
  { label: 'Queue', value: ['queue'] },
  { label: 'API', value: ['api'] },
  { label: 'Service', value: ['service'] },
];

const HealthDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [components, setComponents] = useState<ComponentData[]>(initialComponents);
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusFilterOpts[0]);
  const [typeFilter, setTypeFilter] = useState(typeFilterOpts[0]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const matchSearch =
        !searchQuery ||
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter.value.length === 0 ||
        statusFilter.value.includes(component.status);
      const matchType =
        typeFilter.value.length === 0 ||
        typeFilter.value.includes(component.type);
      return matchSearch && matchStatus && matchType;
    });
  }, [components, searchQuery, statusFilter, typeFilter]);

  const handleComponentClick = (component: ComponentData) => {
    setSelectedComponent(component);
    setShowDetails(true);
  };

  const handleRefresh = () => {
    showToast({
      severity: 'success',
      summary: 'Обновлено',
      detail: 'Данные компонентов обновлены',
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      components: components,
      alerts: alerts,
    });
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({
      severity: 'success',
      summary: 'Экспорт',
      detail: 'Отчёт экспортирован в JSON',
    });
    setShowExport(true);
    setTimeout(() => setShowExport(false), 3000);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
    showToast({
      severity: 'info',
      summary: 'Разрешено',
      detail: 'Предупреждение разрешено',
    });
  };

  const formatLastCheck = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getOverallStatus = (): 'healthy' | 'degraded' | 'unhealthy' | 'unknown' => {
    const unhealthyCount = components.filter((c) => c.status === 'unhealthy').length;
    const degradedCount = components.filter((c) => c.status === 'degraded').length;
    const unknownCount = components.filter((c) => c.status === 'unknown').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0 || unknownCount > 0) return 'degraded';
    if (components.length === 0) return 'unknown';
    return 'healthy';
  };

  return (
    <AppLayout breadcrumbTrail={HEALTH_DASHBOARD_BREADCRUMB}>
      {/* Верхняя панель */}
      <section className="mb-4">
        <div className="flex flex-column md:flex-row align-items-between justify-content-between gap-3">
          {/* Общий статус */}
          <div className="flex align-items-center gap-3">
            <div className="card">
              <div className="text-sm text-color-secondary mb-1">Общий статус</div>
              <StatusBadge
                code={getOverallStatus()}
                name={getOverallStatus().charAt(0).toUpperCase() + getOverallStatus().slice(1)}
              />
            </div>
            <div className="card">
              <div className="text-sm text-color-secondary mb-1">Последнее обновление</div>
              <div className="text-color-primary">
                {new Date().toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex align-items-center gap-2">
            <Button
              label="Обновить"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-sm"
              size="small"
              onClick={handleRefresh}
            />
            <Button
              label="Экспорт отчёта"
              icon="pi pi-download"
              className="p-button-outlined p-button-sm"
              size="small"
              onClick={handleExport}
            />
          </div>
        </div>
      </section>

      {/* Фильтры и поиск */}
      <section className="mb-4">
        <div className="flex flex-wrap align-items-center gap-2">
          <InputText
            placeholder="Поиск по названию или ID компонента"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-inputtext-sm"
          />
          <Dropdown
            value={statusFilter}
            options={statusFilterOpts}
            onChange={(e) => setStatusFilter(e.value)}
            optionLabel="label"
            placeholder="Фильтр по статусу"
            className="w-12rem p-inputtext-sm"
          />
          <Dropdown
            value={typeFilter}
            options={typeFilterOpts}
            onChange={(e) => setTypeFilter(e.value)}
            optionLabel="label"
            placeholder="Фильтр по типу"
            className="w-12rem p-inputtext-sm"
          />
          <Button
            label="Сбросить фильтры"
            className="p-button-outlined p-button-sm"
            size="small"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter(statusFilterOpts[0]);
              setTypeFilter(typeFilterOpts[0]);
            }}
          />
        </div>
      </section>

      {/* Таблица компонентов */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Компоненты системы</h2>
        <div className="border-top surface-border"></div>
        <div
          className="card"
          style={{ minWidth: 0, overflow: 'auto', padding: 0 }}
        >
          <DataTable
            value={filteredComponents}
            dataKey="id"
            sortMode="single"
            removableSort
            size="small"
            stripedRows
            onRowClick={(e) => {
              const component = e.data as ComponentData;
              handleComponentClick(component);
            }}
            rowClassName={() => 'cursor-pointer'}
          >
            <Column
              headerStyle={{ width: '3rem' }}
              body={(row: ComponentData) => (
                <div
                  className="flex align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentClick(row);
                  }}
                >
                  <i className="pi pi-check" />
                </div>
              )}
            />
            <Column field="name" header="Название" sortable body={(row: ComponentData) => row.name} />
            <Column field="type" header="Тип" sortable body={(row: ComponentData) => row.type} />
            <Column field="status" header="Статус" sortable body={(row: ComponentData) => <StatusBadge code={row.status} name={row.status} />} />
            <Column field="lastCheck" header="Последняя проверка" sortable body={(row: ComponentData) => formatLastCheck(row.lastCheck)} />
            <Column
              header="Метрики"
              sortable
              body={(row: ComponentData) => (
                <div className="flex flex-column gap-2">
                  <div className="flex align-items-center gap-2">
                    <div className="text-xs text-color-secondary w-2rem">CPU</div>
                    <div className="text-xs">{row.cpuUsage}%</div>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <div className="text-xs text-color-secondary w-2rem">Mem</div>
                    <div className="text-xs">{row.memoryUsage}%</div>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <div className="text-xs text-color-secondary w-2rem">Net</div>
                    <div className="text-xs">{row.networkLatency}ms</div>
                  </div>
                </div>
              )}
            />
            <Column
              header="Ошибки"
              sortable
              body={(row: ComponentData) => (
                <span className="text-color-danger">
                  {row.errors.length}
                  {row.errors.length > 0 && `: ${row.errors.map((e) => e.message).join(', ')}`}
                </span>
              )}
            />
          </DataTable>
        </div>
      </section>

      {/* Раздел Alerts */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Предупреждения</h2>
        <div className="border-top surface-border"></div>
        <div
          className="card"
          style={{ minWidth: 0, overflow: 'auto', padding: 0 }}
        >
          {alerts.length === 0 ? (
            <div className="text-color-secondary p-4">Активных предупреждений нет</div>
          ) : (
            <DataTable
              value={alerts}
              dataKey="id"
              sortMode="single"
              removableSort
              size="small"
              stripedRows
            >
              <Column field="type" header="Тип" sortable body={(row: AlertData) => (
                <span className={`text-color-${row.type === 'critical' ? 'danger' : row.type === 'warning' ? 'warning' : 'info'}`}>
                  {row.type}
                </span>
              )} />
              <Column field="component" header="Компонент" sortable body={(row: AlertData) => row.component} />
              <Column field="message" header="Сообщение" sortable body={(row: AlertData) => row.message} />
              <Column field="timestamp" header="Время" sortable body={(row: AlertData) => formatTimestamp(row.timestamp)} />
              <Column field="status" header="Статус" sortable body={(row: AlertData) => <StatusBadge code={row.status} name={row.status} />} />
              <Column field="severity" header="Критичность" sortable body={(row: AlertData) => (
                <StatusBadge code={row.severity} name={row.severity} />
              )} />
              <Column
                header="Действия"
                body={(row: AlertData) => {
                  const buttonClass =
                    row.type === 'critical' ? 'p-button-danger p-button-sm' :
                    row.type === 'warning' ? 'p-button-warning p-button-sm' : 'p-button-info p-button-sm';
                  return (
                    <Button
                      label="Разрешить"
                      icon="pi pi-check"
                      className={buttonClass}
                      size="small"
                      onClick={() => handleResolveAlert(row.id)}
                    />
                  );
                }}
              />
            </DataTable>
          )}
        </div>
      </section>

      {/* Модальное окно: Детали компонента */}
      <Dialog
        header={selectedComponent ? `Детали: ${selectedComponent.name}` : 'Детали компонента'}
        visible={showDetails}
        style={{ width: '50rem' }}
        onHide={() => setShowDetails(false)}
      >
        {selectedComponent && (
          <div className="flex flex-column gap-3">
            {/* Карточка с базовой информацией */}
            <div className="card">
              <div className="flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="text-xl font-semibold">{selectedComponent.name}</div>
                  <div className="text-sm text-color-secondary">
                    Тип: {selectedComponent.type}
                  </div>
                </div>
                <StatusBadge
                  code={selectedComponent.status}
                  name={selectedComponent.status}
                />
              </div>
              <div className="text-sm text-color-secondary mb-2">
                ID: {selectedComponent.id}
              </div>
            </div>

            {/* Метрики */}
            <div className="card">
              <div className="text-sm text-color-secondary mb-2">Метрики</div>
              <div className="flex flex-wrap align-items-center gap-3">
                <div className="card">
                  <div className="text-sm text-color-secondary">CPU Usage</div>
                  <div className="text-xl font-bold">
                    {selectedComponent.cpuUsage}%
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-color-secondary">Memory Usage</div>
                  <div className="text-xl font-bold">
                    {selectedComponent.memoryUsage}%
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-color-secondary">Disk Usage</div>
                  <div className="text-xl font-bold">
                    {selectedComponent.diskUsage}%
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-color-secondary">Network Latency</div>
                  <div className="text-xl font-bold">
                    {selectedComponent.networkLatency}ms
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-color-secondary">Active Connections</div>
                  <div className="text-xl font-bold">
                    {selectedComponent.activeConnections}
                  </div>
                </div>
              </div>
            </div>

            {/* Ошибки */}
            {selectedComponent.errors.length > 0 && (
              <div className="card">
                <div className="text-sm text-color-secondary mb-2">Последние ошибки</div>
                <div className="flex flex-column gap-2">
                  {selectedComponent.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-color-danger text-sm"
                    >
                      <i className="pi pi-exclamation-triangle mr-2" />
                      {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Последняя проверка */}
            <div className="card">
              <div className="text-sm text-color-secondary mb-1">Последняя проверка</div>
              <div className="text-color-primary">
                {formatLastCheck(selectedComponent.lastCheck)}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Уведомление об экспорте */}
      {showExport && (
        <div
          className="card"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--surface-card)',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div className="flex align-items-center gap-3">
            <i className="pi pi-check-circle text-color-success text-xl" />
            <div>
              <div className="font-semibold">Отчёт экспортирован</div>
              <div className="text-sm text-color-secondary">
                Файл health-dashboard.json скачан
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HealthDashboard;
