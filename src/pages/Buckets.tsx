import React, { useRef, useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import type { DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { StatusBadge } from 'uikit/StatusBadge';
import { useToast } from 'uikit/hook/useToast';
import { Drawer } from 'uikit/Drawer';
import { AppLayout } from '../layout/AppLayout';

export interface BucketRow {
  id: string;
  name: string;
  region: string;
  statusCode: string;
  statusName: string;
  createdAt: string;
  sizeGb: number;
}

const BUCKETS_BREADCRUMB: { label: string }[] = [{ label: "Бакеты" }];

const statusFilterOpts = [
  { label: "Все статусы", value: "" },
  { label: "OK", value: "ok" },
  { label: "Предупреждение", value: "warning" },
  { label: "Критично", value: "critical" },
  { label: "В процессе", value: "in-process" },
];

const regionOpts = [
  { label: "eu-central-1", value: "eu-central-1" },
  { label: "us-east-1", value: "us-east-1" },
  { label: "ap-northeast-1", value: "ap-northeast-1" },
];

const initialBuckets: BucketRow[] = [
  {
    id: "1",
    name: "logs-prod",
    region: "eu-central-1",
    statusCode: "ok",
    statusName: "Активен",
    createdAt: "2024-01-15",
    sizeGb: 120,
  },
  {
    id: "2",
    name: "backups-main",
    region: "eu-central-1",
    statusCode: "warning",
    statusName: "Квота 80%",
    createdAt: "2024-02-01",
    sizeGb: 890,
  },
  {
    id: "3",
    name: "static-assets",
    region: "us-east-1",
    statusCode: "ok",
    statusName: "Активен",
    createdAt: "2023-11-20",
    sizeGb: 45,
  },
  {
    id: "4",
    name: "temp-uploads",
    region: "ap-northeast-1",
    statusCode: "critical",
    statusName: "Ошибка доступа",
    createdAt: "2024-03-10",
    sizeGb: 12,
  },
  {
    id: "5",
    name: "archive-2023",
    region: "eu-central-1",
    statusCode: "in-process",
    statusName: "Миграция",
    createdAt: "2023-06-01",
    sizeGb: 2100,
  },
];

const Buckets: React.FC = () => {
  const rowMenuRef = useRef<Menu>(null);
  const [buckets, setBuckets] = useState<BucketRow[]>(initialBuckets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFilterOpts[0]);
  const [showArchived, setShowArchived] = useState(false);
  const [selection, setSelection] = useState<BucketRow[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingBucket, setEditingBucket] = useState<BucketRow | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerBucket, setDrawerBucket] = useState<BucketRow | null>(null);
  const [formName, setFormName] = useState("");
  const [formRegion, setFormRegion] = useState(regionOpts[0]);
  const { showToast } = useToast();

  const filteredBuckets = useMemo(() => {
    return buckets.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        !statusFilter.value || b.statusCode === statusFilter.value;
      return matchSearch && matchStatus;
    });
  }, [buckets, searchQuery, statusFilter]);

  const openRowMenu = (e: React.MouseEvent, _row: BucketRow) => {
    e.stopPropagation();
    rowMenuRef.current?.toggle(e);
  };

  const rowMenuItems = [
    {
      label: "Открыть",
      icon: "pi pi-eye",
      command: () => {
        if (drawerBucket) {
          setDrawerVisible(true);
        }
      },
    },
    {
      label: "Редактировать",
      icon: "pi pi-pencil",
      command: () => {
        if (drawerBucket) openEdit(drawerBucket);
      },
    },
    { separator: true },
    {
      label: "Удалить",
      icon: "pi pi-trash",
      command: () => {
        if (drawerBucket) confirmDelete(drawerBucket);
      },
    },
  ];

  const openEdit = (row: BucketRow) => {
    setEditingBucket(row);
    setFormName(row.name);
    setFormRegion(
      regionOpts.find((r) => r.value === row.region) ?? regionOpts[0],
    );
    setDialogVisible(true);
  };

  const openCreate = () => {
    setEditingBucket(null);
    setFormName("");
    setFormRegion(regionOpts[0]);
    setDialogVisible(true);
  };

  const saveBucket = () => {
    if (!formName.trim()) {
      showToast({
        severity: "warn",
        summary: "Внимание",
        detail: "Введите название бакета",
      });
      return;
    }
    if (editingBucket) {
      setBuckets((prev) =>
        prev.map((b) =>
          b.id === editingBucket.id
            ? { ...b, name: formName.trim(), region: formRegion.value }
            : b,
        ),
      );
      showToast({
        severity: "success",
        summary: "Готово",
        detail: "Бакет обновлён",
      });
    } else {
      const newId = String(
        Math.max(...buckets.map((b) => parseInt(b.id, 10)), 0) + 1,
      );
      setBuckets((prev) => [
        ...prev,
        {
          id: newId,
          name: formName.trim(),
          region: formRegion.value,
          statusCode: "ok",
          statusName: "Активен",
          createdAt: new Date().toISOString().slice(0, 10),
          sizeGb: 0,
        },
      ]);
      showToast({
        severity: "success",
        summary: "Готово",
        detail: "Бакет создан",
      });
    }
    setDialogVisible(false);
  };

  const confirmDelete = (row: BucketRow) => {
    confirmDialog({
      message: `Удалить бакет «${row.name}»?`,
      header: "Подтверждение удаления",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      accept: () => {
        setBuckets((prev) => prev.filter((b) => b.id !== row.id));
        setSelection((s) => s.filter((b) => b.id !== row.id));
        showToast({
          severity: "info",
          summary: "Удалено",
          detail: `Бакет «${row.name}» удалён`,
        });
      },
    });
  };

  const deleteSelected = () => {
    if (selection.length === 0) return;
    confirmDialog({
      message: `Удалить выбранные бакеты (${selection.length})?`,
      header: "Массовое удаление",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      accept: () => {
        const ids = new Set(selection.map((s) => s.id));
        setBuckets((prev) => prev.filter((b) => !ids.has(b.id)));
        setSelection([]);
        showToast({
          severity: "info",
          summary: "Удалено",
          detail: `Удалено бакетов: ${selection.length}`,
        });
      },
    });
  };

  const onRowClick = (e: DataTableRowClickEvent) => {
    setDrawerBucket(e.data as BucketRow);
    setDrawerVisible(true);
  };

  const dialogFooter = (
    <>
      <Button
        label="Отмена"
        className="p-button-outlined"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingBucket ? "Сохранить" : "Создать"}
        className="p-button-pr"
        onClick={saveBucket}
      />
    </>
  );

  return (
    <AppLayout breadcrumbTrail={BUCKETS_BREADCRUMB}>
      <h1 style={{ marginTop: 0 }}>Бакеты</h1>

      <div className="flex flex-wrap align-items-center gap-2 mb-3">
        <InputText
          placeholder="Поиск по названию"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-inputtext-sm"
        />
        <Dropdown
          value={statusFilter}
          options={statusFilterOpts}
          onChange={(e) => setStatusFilter(e.value)}
          optionLabel="label"
          placeholder="Статус"
          className="w-12rem p-inputtext-sm"
        />
        <div className="flex align-items-center gap-2">
          <InputSwitch
            checked={showArchived}
            onChange={(e) => setShowArchived(e.value ?? false)}
          />
          <span className="text-color-secondary">Показать архивные</span>
        </div>
        <Button
          label="Создать бакет"
          className="p-button-pr"
          size="small"
          onClick={openCreate}
        />
        <Button
          label="Экспорт"
          className="p-button-outlined"
          size="small"
          icon="pi pi-download"
        />
        {selection.length > 0 && (
          <Button
            label={`Удалить (${selection.length})`}
            className="p-button-danger p-button-outlined"
            size="small"
            onClick={deleteSelected}
          />
        )}
        <Button
          icon="pi pi-cog"
          className="p-button-rounded p-button-outlined"
          size="small"
          aria-label="Настройки"
        />
      </div>

      <div
        className="card"
        style={{ minWidth: 0, overflow: "auto", padding: 0 }}
      >
        <DataTable
          value={filteredBuckets}
          selection={selection}
          onSelectionChange={(e) =>
            setSelection(Array.isArray(e.value) ? e.value : [])
          }
          onRowClick={onRowClick}
          dataKey="id"
          sortMode="single"
          removableSort
          size="small"
          stripedRows
          selectionMode="multiple"
          rowClassName={() => "cursor-pointer"}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="name" header="Название" sortable />
          <Column field="region" header="Регион" sortable />
          <Column
            header="Статус"
            body={(row: BucketRow) => (
              <StatusBadge code={row.statusCode} name={row.statusName} />
            )}
          />
          <Column field="createdAt" header="Создан" sortable />
          <Column
            field="sizeGb"
            header="Размер (ГБ)"
            sortable
            body={(row: BucketRow) => `${row.sizeGb} ГБ`}
          />
          <Column
            headerStyle={{ width: "3rem" }}
            body={(row: BucketRow) => (
              <Button
                icon="pi pi-ellipsis-v"
                className="p-button-text p-button-rounded"
                onClick={(e) => {
                  setDrawerBucket(row);
                  openRowMenu(e, row);
                }}
              />
            )}
          />
        </DataTable>
      </div>

      <Menu model={rowMenuItems} popup ref={rowMenuRef} />

      <Dialog
        header={editingBucket ? "Редактирование бакета" : "Новый бакет"}
        visible={dialogVisible}
        style={{ width: "24rem" }}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3">
          <label htmlFor="bucket-name">Название</label>
          <InputText
            id="bucket-name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Имя бакета"
            className="w-full"
          />
          <label htmlFor="bucket-region">Регион</label>
          <Dropdown
            id="bucket-region"
            value={formRegion}
            options={regionOpts}
            onChange={(e) => setFormRegion(e.value)}
            optionLabel="label"
            className="w-full"
          />
        </div>
      </Dialog>

      <Drawer
        visible={drawerVisible}
        onHide={() => {
          setDrawerVisible(false);
          setDrawerBucket(null);
        }}
        header={drawerBucket ? `Бакет: ${drawerBucket.name}` : "Детали бакета"}
        position="right"
      >
        {drawerBucket && (
          <div className="flex flex-column gap-2">
            <p>
              <strong>ID:</strong>{" "}
              <span className="text-color-secondary">{drawerBucket.id}</span>
            </p>
            <p>
              <strong>Название:</strong>{" "}
              <span className="text-color-secondary">{drawerBucket.name}</span>
            </p>
            <p>
              <strong>Регион:</strong>{" "}
              <span className="text-color-secondary">
                {drawerBucket.region}
              </span>
            </p>
            <p>
              <strong>Статус:</strong>{" "}
              <StatusBadge
                code={drawerBucket.statusCode}
                name={drawerBucket.statusName}
              />
            </p>
            <p>
              <strong>Создан:</strong>{" "}
              <span className="text-color-secondary">
                {drawerBucket.createdAt}
              </span>
            </p>
            <p>
              <strong>Размер:</strong>{" "}
              <span className="text-color-secondary">
                {drawerBucket.sizeGb} ГБ
              </span>
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                label="Редактировать"
                size="small"
                icon="pi pi-pencil"
                onClick={() => {
                  openEdit(drawerBucket);
                  setDrawerVisible(false);
                }}
              />
              <Button
                label="Удалить"
                size="small"
                className="p-button-danger p-button-outlined"
                icon="pi pi-trash"
                onClick={() => {
                  confirmDelete(drawerBucket);
                  setDrawerVisible(false);
                }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
};

export default Buckets;
