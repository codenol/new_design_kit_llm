import React from "react";
import { AppLayout } from "../layout/AppLayout";
import { DataTableDynamic } from "../../design-system/uikit/DataTableDynamic";
import { Drawer } from "../../design-system/uikit/Drawer";
import { Button } from "primereact/button";
import { useState } from "react";

interface Setting {
  id: number;
  name: string;
  value: string;
  description: string;
  editable: boolean;
}

const mockSettings: Setting[] = [
  {
    id: 1,
    name: "max_connections",
    value: "100",
    description: "Maximum DB connections",
    editable: true,
  },
  {
    id: 2,
    name: "shared_buffers",
    value: "128MB",
    description: "Shared memory buffer size",
    editable: true,
  },
  {
    id: 3,
    name: "work_mem",
    value: "4MB",
    description: "Memory for complex queries",
    editable: true,
  },
];

const columns = [
  { field: "name", header: "Параметр" },
  { field: "value", header: "Значение" },
  { field: "description", header: "Описание" },
];

const PostgresSettings: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const breadcrumbTrail = [{ label: "Настройки PostgreSQL" }];

  return (
    <AppLayout breadcrumbTrail={breadcrumbTrail}>
      <h1>Настройки PostgreSQL</h1>
      <Button
        label="Добавить"
        icon="pi pi-plus"
        onClick={() => setDrawerVisible(true)}
        className="mb-2"
      />
      <DataTableDynamic
        data={mockSettings}
        columns={columns}
        header={<div>Список настроек PostgreSQL</div>}
        rowsPerPageOptions={[{ label: "10", value: 10 }]}
        style={{ width: "100%" }}
      />
      <Drawer
        visible={drawerVisible}
        onHide={() => setDrawerVisible(false)}
        header="Новый параметр"
      >
        <p>Моковое окно для добавления/редактирования настроек.</p>
      </Drawer>
    </AppLayout>
  );
};

export default PostgresSettings;
