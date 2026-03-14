import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import type { DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { StatusBadge } from 'uikit/StatusBadge';
import { StepWizard } from 'uikit/StepWizard';
import { useToast } from 'uikit/hook/useToast';
import { Messages, IMessages, MessageInfo } from 'uikit/Messages';
import { Drawer } from 'uikit/Drawer';
import { AppLayout } from '../layout/AppLayout';
import { demoTableRows, type DemoTableRow } from '../data/demoTableRows';

const statusFilterOpts = [
  { label: "Все статусы", value: "" },
  { label: "OK", value: "ok" },
  { label: "Предупреждение", value: "warning" },
  { label: "Критично", value: "critical" },
];

const categoryFilterOpts = [
  { label: "Все категории", value: "" },
  { label: "Категория A", value: "a" },
  { label: "Категория B", value: "b" },
];

const showcaseBreadcrumbTrail = [{ label: "Витрина компонентов" }];

const wizardSteps = [
  {
    name: "Шаг 1",
    isActive: true,
    isDone: false,
    content: <p>Контент первого шага.</p>,
  },
  {
    name: "Шаг 2",
    isActive: false,
    isDone: false,
    content: <p>Контент второго шага.</p>,
  },
  {
    name: "Шаг 3",
    isActive: false,
    isDone: false,
    content: <p>Контент третьего шага.</p>,
  },
];

const Showcase: React.FC = () => {
  const actionMenuRef = useRef<Menu>(null);
  const messagesRef = useRef<IMessages>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFilterOpts[0]);
  const [categoryFilter, setCategoryFilter] = useState(categoryFilterOpts[0]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [tableSelection, setTableSelection] = useState<DemoTableRow[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerRow, setDrawerRow] = useState<DemoTableRow | null>(null);

  const { showToast } = useToast();

  const openActionMenu = (e: React.MouseEvent) => {
    actionMenuRef.current?.toggle(e);
  };

  const showMessages = (msg: MessageInfo) => {
    messagesRef.current?.show(msg);
  };

  const rowActions = [
    { label: "Редактировать", icon: "pi pi-pencil", command: () => {} },
    { label: "Удалить", icon: "pi pi-trash", command: () => {} },
    { separator: true },
    { label: "Экспорт", icon: "pi pi-download", command: () => {} },
  ];

  const onTableRowClick = (e: DataTableRowClickEvent) => {
    setDrawerRow(e.data as DemoTableRow);
    setDrawerVisible(true);
  };

  return (
    <AppLayout breadcrumbTrail={showcaseBreadcrumbTrail}>
      <h1 style={{ marginTop: 0 }}>Витрина компонентов</h1>

      {/* Секция: Кнопки, поля, переключатели, меню */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Кнопки, поля, переключатели
        </h2>
        <div className="flex flex-wrap align-items-center gap-2 mb-3">
          <InputText
            placeholder="Поиск"
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
          <Dropdown
            value={categoryFilter}
            options={categoryFilterOpts}
            onChange={(e) => setCategoryFilter(e.value)}
            optionLabel="label"
            placeholder="Категория"
            className="w-12rem p-inputtext-sm"
          />
          <Button
            label="Основная кнопка"
            className="p-button-pr"
            size="small"
          />
          <Button
            label="Вторичная"
            className="p-button-outlined"
            size="small"
          />
          <Button
            icon="pi pi-download"
            className="p-button-rounded p-button-outlined"
            size="small"
          />
          <Button
            icon="pi pi-cog"
            className="p-button-rounded p-button-outlined"
            size="small"
          />
          <div className="flex align-items-center gap-2">
            <InputSwitch
              checked={switchChecked}
              onChange={(e) => setSwitchChecked(e.value ?? false)}
            />
            <span className="text-color secondary">Переключатель</span>
          </div>
          <Button
            icon="pi pi-ellipsis-v"
            className="p-button-rounded p-button-text"
            size="small"
            onClick={openActionMenu}
            aria-controls="action_menu"
            aria-haspopup
          />
          <Menu model={rowActions} popup ref={actionMenuRef} id="action_menu" />
        </div>
      </section>

      {/* Секция: Модальное окно (Dialog) */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Модальное окно (Dialog)</h2>
        <Button
          label="Открыть модалку"
          onClick={() => setModalVisible(true)}
          className="mb-2"
        />
        <Dialog
          header="Заголовок модального окна"
          visible={modalVisible}
          style={{ width: "24rem" }}
          onHide={() => setModalVisible(false)}
        >
          <p>
            Контент модального окна. Закройте по крестику или клику по фону.
          </p>
        </Dialog>
      </section>

      {/* Секция: Степпер (StepWizard) */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Степпер (StepWizard)</h2>
        <div className="card p-3">
          <StepWizard steps={wizardSteps} content={wizardSteps[0].content} />
        </div>
      </section>

      {/* Секция: Toast */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Toast-уведомления</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            label="Info"
            size="small"
            onClick={() =>
              showToast({
                severity: "info",
                summary: "Инфо",
                detail: "Сообщение информационного характера",
              })
            }
          />
          <Button
            label="Успех"
            size="small"
            onClick={() =>
              showToast({
                severity: "success",
                summary: "Готово",
                detail: "Операция выполнена успешно",
              })
            }
          />
          <Button
            label="Предупреждение"
            size="small"
            onClick={() =>
              showToast({
                severity: "warn",
                summary: "Внимание",
                detail: "Проверьте введённые данные",
              })
            }
          />
          <Button
            label="Ошибка"
            size="small"
            className="p-button-danger"
            onClick={() =>
              showToast({
                severity: "error",
                summary: "Ошибка",
                detail: "Что-то пошло не так",
              })
            }
          />
        </div>
      </section>

      {/* Секция: Messages (инлайн-сообщения) */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Messages (список сообщений)
        </h2>
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            label="Показать info"
            size="small"
            onClick={() =>
              showMessages({
                severity: "info",
                text: "Информационное сообщение в блоке.",
              })
            }
          />
          <Button
            label="Показать success"
            size="small"
            onClick={() =>
              showMessages({ severity: "success", text: "Успешное сообщение." })
            }
          />
          <Button
            label="Показать warn"
            size="small"
            onClick={() =>
              showMessages({ severity: "warn", text: "Предупреждение." })
            }
          />
          <Button
            label="Очистить"
            size="small"
            className="p-button-outlined"
            onClick={() => messagesRef.current?.clear()}
          />
        </div>
        <Messages ref={messagesRef} />
      </section>

      {/* Таблица: клик по строке открывает Drawer */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Таблица (клик по строке открывает Drawer)
        </h2>
        <div
          className="card"
          style={{ minWidth: 0, overflow: "auto", padding: 0 }}
        >
          <DataTable
            value={demoTableRows}
            selection={tableSelection}
            onSelectionChange={(e) =>
              setTableSelection(
                Array.isArray(e.value) ? e.value : e.value ? [e.value] : [],
              )
            }
            onRowClick={onTableRowClick}
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
            <Column field="version" header="Версия" sortable />
            <Column
              header="Статус"
              body={(row: DemoTableRow) => (
                <StatusBadge code={row.statusCode} name={row.statusName} />
              )}
            />
            <Column
              header="Категория"
              body={(row: DemoTableRow) => (
                <span
                  className={classNames(
                    "status-badge",
                    "smooth-corners",
                    row.category === "Основные" && "status-badge--ok",
                    row.category === "Дополнительные" && "status-badge--info",
                    row.category === "Служебные" &&
                      "status-badge--not-available",
                  )}
                >
                  {row.category}
                </span>
              )}
            />
            <Column
              header={() => (
                <Button
                  icon="pi pi-cog"
                  className="p-button-text p-button-rounded"
                  aria-label="Настройки колонок"
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionMenu(e as unknown as React.MouseEvent);
                  }}
                />
              )}
              headerStyle={{ width: "3rem" }}
              body={() => (
                <Button
                  icon="pi pi-ellipsis-v"
                  className="p-button-text p-button-rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionMenu(e as unknown as React.MouseEvent);
                  }}
                />
              )}
            />
          </DataTable>
        </div>
      </section>

      <Drawer
        visible={drawerVisible}
        onHide={() => {
          setDrawerVisible(false);
          setDrawerRow(null);
        }}
        header={drawerRow ? `Детали: ${drawerRow.name}` : "Детали"}
        position="right"
      >
        {drawerRow && (
          <div className="flex flex-column gap-2">
            <p>
              <strong>ID:</strong>{" "}
              <span className="text-color-secondary">{drawerRow.id}</span>
            </p>
            <p>
              <strong>Название:</strong>{" "}
              <span className="text-color-secondary">{drawerRow.name}</span>
            </p>
            <p>
              <strong>Версия:</strong>{" "}
              <span className="text-color-secondary">{drawerRow.version}</span>
            </p>
            <p>
              <strong>Статус:</strong>{" "}
              <span className="text-color-secondary">
                {drawerRow.statusName} ({drawerRow.statusCode})
              </span>
            </p>
            <p>
              <strong>Категория:</strong>{" "}
              <span className="text-color-secondary">{drawerRow.category}</span>
            </p>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
};

export default Showcase;
