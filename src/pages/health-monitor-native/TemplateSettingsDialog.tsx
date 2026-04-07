import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { HmSearchField } from "./HmSearchField";
import { PAK_TEMPLATE_ASSIGNMENT_ROWS } from "./model/pakTemplateRows";
import { isPresetTemplateId } from "./model/presetTemplates";
import { PakAssignments, PakTemplate } from "./model/templateTypes";
import { parseConfig } from "./model/yamlParser";

const ALL_PAK_TYPES_VALUE = "";

const PAK_TYPE_FILTER_OPTIONS = [
  { label: "Все типы", value: ALL_PAK_TYPES_VALUE },
  ...PAK_TEMPLATE_ASSIGNMENT_ROWS.map((row) => ({
    label: row.label,
    value: row.id,
  })),
];

interface Props {
  visible: boolean;
  templates: PakTemplate[];
  assignments: PakAssignments;
  onSave: (templates: PakTemplate[], assignments: PakAssignments) => void;
  onHide: () => void;
}

export const TemplateSettingsDialog: React.FC<Props> = ({
  visible,
  templates,
  assignments,
  onSave,
  onHide,
}) => {
  const [localTemplates, setLocalTemplates] = useState<PakTemplate[]>(templates);
  const [localAssignments, setLocalAssignments] =
    useState<PakAssignments>(assignments);
  const [yamlText, setYamlText] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [errorText, setErrorText] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [pakTypeFilter, setPakTypeFilter] = useState(ALL_PAK_TYPES_VALUE);
  const [showAddBlock, setShowAddBlock] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalTemplates(templates);
      setLocalAssignments(assignments);
      setErrorText("");
      setPakTypeFilter(ALL_PAK_TYPES_VALUE);
    }
  }, [visible, templates, assignments]);

  const footer = (
    <div className="hm-template-dialog__footer">
      <Button label="Отмена" outlined type="button" onClick={onHide} />
      <Button
        label="Применить"
        type="button"
        onClick={() => onSave(localTemplates, localAssignments)}
      />
    </div>
  );

  const knownTypes = useMemo(
    () => Array.from(new Set(localTemplates.map((t) => t.pakType).filter(Boolean))),
    [localTemplates],
  );

  const templatesForPakTypeLabel = (label: string) =>
    localTemplates.filter((t) => (t.pakType || "").trim() === label);

  const templateOptionsForRow = (rowLabel: string, rowId: string) => {
    const list = templatesForPakTypeLabel(rowLabel);
    const opts = [
      { label: "— не назначен —", value: "" },
      ...list.map((t) => ({
        label: t.name,
        value: t.id,
      })),
    ];
    const currentId = localAssignments[rowId];
    if (
      currentId &&
      !opts.some((o) => o.value === currentId)
    ) {
      const orphan = localTemplates.find((x) => x.id === currentId);
      if (orphan) {
        opts.push({
          label: `${orphan.name} (${orphan.pakType || "тип не указан"})`,
          value: orphan.id,
        });
      }
    }
    return opts;
  };

  const filteredTemplates = useMemo(() => {
    let list = localTemplates;
    const q = templateSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.pakType && t.pakType.toLowerCase().includes(q)),
      );
    }
    if (pakTypeFilter) {
      const label = PAK_TEMPLATE_ASSIGNMENT_ROWS.find(
        (r) => r.id === pakTypeFilter,
      )?.label;
      if (label) {
        list = list.filter((t) => (t.pakType || "").trim() === label);
      }
    }
    return list;
  }, [localTemplates, templateSearch, pakTypeFilter]);

  const isTemplateInUse = (id: string) =>
    Object.values(localAssignments).includes(id);

  /** Строка справа (id) для типа ПАК шаблона. */
  const rowIdForTemplate = (t: PakTemplate): string | undefined => {
    const label = (t.pakType || "").trim();
    if (!label) return undefined;
    return PAK_TEMPLATE_ASSIGNMENT_ROWS.find((r) => r.label === label)?.id;
  };

  const assignTemplateToPakRow = (t: PakTemplate) => {
    const rowId = rowIdForTemplate(t);
    if (!rowId) {
      setErrorText("Укажите тип ПАК у шаблона — иначе его нельзя назначить.");
      return;
    }
    setErrorText("");
    setLocalAssignments((prev) => ({ ...prev, [rowId]: t.id }));
  };

  const templateNameById = (id: string | undefined): string | undefined => {
    if (!id) return undefined;
    return localTemplates.find((x) => x.id === id)?.name;
  };

  const addTemplate = () => {
    setErrorText("");
    if (!yamlText.trim() || !templateName.trim()) {
      setErrorText("Заполните YAML и название шаблона.");
      return;
    }
    try {
      parseConfig(yamlText);
      const newTemplate: PakTemplate = {
        id: `tpl_${Date.now()}`,
        name: templateName.trim(),
        pakType: templateType.trim(),
        yaml: yamlText,
        uploadedAt: new Date().toISOString(),
      };
      setLocalTemplates((prev) => [...prev, newTemplate]);
      setYamlText("");
      setTemplateName("");
      setTemplateType("");
    } catch (error) {
      setErrorText(
        `YAML невалиден: ${error instanceof Error ? error.message : "ошибка"}`,
      );
    }
  };

  const removeTemplate = (id: string) => {
    if (isPresetTemplateId(id)) {
      return;
    }
    setLocalTemplates((prev) => prev.filter((t) => t.id !== id));
    setLocalAssignments((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === id) {
          delete next[key];
        }
      }
      return next;
    });
  };

  const downloadYaml = (t: PakTemplate) => {
    const blob = new Blob([t.yaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.replace(/\s+/g, "_")}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      className="hm-template-dialog"
      header="Настройка шаблонов"
      visible={visible}
      style={{ width: "960px", maxWidth: "min(960px, 95vw)" }}
      onHide={onHide}
      footer={footer}
      draggable={false}
      resizable={false}
    >
      <div className="hm-template-dialog__columns">
        <div className="hm-template-card hm-template-card--drawer-style">
          <div className="hm-template-card__toolbar">
            <HmSearchField
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
            <Dropdown
              value={pakTypeFilter}
              options={PAK_TYPE_FILTER_OPTIONS}
              onChange={(e) => setPakTypeFilter(e.value ?? ALL_PAK_TYPES_VALUE)}
              optionLabel="label"
              optionValue="value"
              placeholder="Тип ПАК"
              className="hm-template-card__filter"
              appendTo={typeof document !== "undefined" ? document.body : undefined}
            />
            <Button
              type="button"
              icon="pi pi-plus"
              rounded
              className="hm-template-card__add-btn"
              aria-label={
                showAddBlock ? "Скрыть форму добавления" : "Добавить шаблон"
              }
              aria-expanded={showAddBlock}
              onClick={() => setShowAddBlock((v) => !v)}
            />
          </div>

          {errorText ? (
            <div className="hm-template-card__error hm-template-card__error--toolbar" role="alert">
              {errorText}
            </div>
          ) : null}

          {showAddBlock && (
            <div className="hm-template-card__add">
              <InputText
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Название шаблона"
                className="p-inputtext-sm w-full"
              />
              <InputText
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                placeholder={`Тип ПАК (${knownTypes.slice(0, 3).join(", ") || "МБД.П"})`}
                className="p-inputtext-sm w-full"
              />
              <textarea
                value={yamlText}
                onChange={(e) => setYamlText(e.target.value)}
                className="w-full hm-yaml-input"
                placeholder="Вставьте YAML шаблона"
              />
              <Button
                label="Добавить шаблон"
                type="button"
                onClick={addTemplate}
              />
            </div>
          )}

          <div className="hm-template-list">
            {filteredTemplates.length === 0 ? (
              <div className="hm-template-list__empty">
                {localTemplates.length === 0
                  ? "Нет шаблонов."
                  : "Ничего не найдено."}
              </div>
            ) : (
              filteredTemplates.map((t) => (
                <div key={t.id} className="hm-template-row">
                  <div className="hm-template-row__text">
                    <div className="hm-template-row__title">{t.name}</div>
                    <div className="hm-template-row__meta">
                      Тип ПАК: {t.pakType || "—"}
                      {isTemplateInUse(t.id) ? " — Используется" : ""}
                    </div>
                  </div>
                  <div className="hm-template-row__actions">
                    {!isPresetTemplateId(t.id) ? (
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        className="p-button-text p-button-rounded hm-template-row__icon-btn hm-template-row__icon-btn--danger"
                        aria-label={`Удалить ${t.name}`}
                        onClick={() => removeTemplate(t.id)}
                      />
                    ) : null}
                    <Button
                      type="button"
                      icon="pi pi-download"
                      className="p-button-text p-button-rounded hm-template-row__icon-btn"
                      aria-label={`Скачать ${t.name}`}
                      onClick={() => downloadYaml(t)}
                    />
                    <Button
                      type="button"
                      icon="pi pi-angle-double-right"
                      className={`p-button-rounded hm-template-row__assign ${
                        isTemplateInUse(t.id) ? "hm-template-row__assign--active" : ""
                      }`}
                      aria-label={`Назначить «${t.name}» для типа ПАК ${t.pakType || "—"}`}
                      title="Назначить для ПАК справа"
                      disabled={!rowIdForTemplate(t)}
                      onClick={() => assignTemplateToPakRow(t)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hm-pak-assign-card">
          {PAK_TEMPLATE_ASSIGNMENT_ROWS.map((row) => {
            const assignedId = localAssignments[row.id];
            const assignedName = templateNameById(assignedId);
            return (
            <div key={row.id} className="hm-pak-assign-row">
              <div className="hm-pak-assign-label-block">
                <div className="hm-pak-assign-name-row">
                  <span className="hm-pak-assign-name">{row.label}</span>
                  {assignedName ? (
                    <span className="hm-pak-assign-mark" title="Текущее назначение">
                      <span className="hm-pak-assign-mark__icon" aria-hidden>
                        ✓
                      </span>
                      <span className="hm-pak-assign-mark__text">{assignedName}</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <Dropdown
                value={localAssignments[row.id] ?? ""}
                options={templateOptionsForRow(row.label, row.id)}
                onChange={(e) =>
                  setLocalAssignments((prev) => {
                    const next = { ...prev };
                    const v = e.value as string;
                    if (!v) {
                      delete next[row.id];
                    } else {
                      next[row.id] = v;
                    }
                    return next;
                  })
                }
                optionLabel="label"
                optionValue="value"
                placeholder="— не назначен —"
                className="p-inputtext-sm hm-pak-assign-dropdown"
                appendTo={typeof document !== "undefined" ? document.body : undefined}
              />
            </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};
