/**
 * Компонент TableArrayWidget представляет собой таблицу, реализующую редактирование массива объектов.
 * Используется в рамках React JSON Schema Form, FormJSON в компонентах.
 *
 * @module TableArrayWidget
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'primereact/button';
import type { WidgetProps } from '@rjsf/utils';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FormJSON } from '../index';
import { DataTableDynamic } from '../../DataTableDynamic';
import { useConfirmDialog } from '../../hook/useConfirmDialog';

/**
 * Интерфейс для пропсов компонента TableArrayWidget.
 */
interface ITableArrayWidget extends WidgetProps {
    schema: any;
}

/**
 * Основной компонент таблицы для отображения и редактирования массива объектов.
 *
 * @param value - текущее значение массива.
 * @param uiSchema - UI-схема.
 * @param onChange - функция изменения значения.
 * @param onBlur - функция при потере фокуса.
 * @param schema - JSON-схема.
 * @param rawErrors - ошибки валидации.
 * @param id - уникальный идентификатор поля.
 * @param options - дополнительные параметры виджета.
 * @param registry - реестр, содержащий контекст формы.
 */
export const TableArrayWidget = ({
    value,
    uiSchema,
    onChange,
    onBlur,
    schema,
    rawErrors,
    id,
    options,
    registry,
}: ITableArrayWidget) => {
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге
    const [dataTable, setDataTable] = useState<any[]>(value); // Локальное состояние для хранения данных таблицы.
    const emptyValue = options.emptyValue || []; // Значение по умолчанию для пустого массива.
    /**
     * Ключ данных для идентификации строк. По умолчанию — 'id'.
     */
    const dataKey = typeof uiSchema?.['ui:options']?.dataKey === 'string' ? uiSchema['ui:options'].dataKey : 'id';

    const isDataSelectable = () => !uiSchema?.['ui:readonly']; // Проверка, доступен ли элемент для выбора (если не указан `ui:readonly`).
    const isWriteOnly = !uiSchema?.['ui:writeonly']; // Проверка, доступен ли элемент ТОЛЬКО для редактирования(если указан `ui:writeonly`).

    const dialogWidth = uiSchema?.['ui:options']?.dialogWidth; // Ширина диалога добавления/редактирования элементов
    const header = uiSchema?.['ui:options']?.header ?? ''; // Заголовок таблицы из uiSchema.
    const labelElement = uiSchema?.['ui:options']?.textLabel ?? ''; // Метка для отображения имени элемента, над которым проходит работа.
    /**
     * Список полей, указанных в `ui:options.fields` или по умолчанию в `items.required`.
     * может быть либо массивом строк (названий полей), либо массивом объектов с дополнительной конфигурацией.
     */
    const uiSchemaFields = uiSchema?.['ui:options']?.fields || schema?.items?.required;
    const schemaAllItems = schema?.items?.properties; // Все свойства items из схемы.
    const Fields: any = []; // Коллекция полей для отображения в таблице.

    const { confirmInfo, hide } = useConfirmDialog(); // Хук для работы с диалогом подтверждения действий.
    const formSubmit = useRef<HTMLButtonElement>(null); // Реф на кнопку отправки формы (скрытая).

    /**
     * Проверка элементов массива на уникальность
     */
    const setUnique = registry.formContext.setDataValidationUnique; // Функция установки уникальных значений (из контекста формы).
    const uniqueItems = schema.uniqueItemProperties; // Список уникальных свойств (из `uniqueItemProperties` в схеме).
    /**
     * Устанавливает уникальные значения для полей, если они заданы в схеме.
     *
     * @param data - данные строки.
     * @param inx - индекс строки.
     */
    const setUniqueItems = (data, inx) => {
        uniqueItems?.forEach((element) => {
            if (schema?.items?.uiSchema?.[element]?.['ui:options']?.uniqueItemPropertiesGroup) {
                setUnique(element + inx, data?.[element]);
            }
        });
    };

    /**
     * Обновляет данные при изменении таблицы и вызывает onChange/onBlur.
     */
    useEffect(() => {
        const newValue = dataTable.length > 0 ? dataTable : emptyValue;

        onChange(newValue);

        if (dataTable.length > 0) {
            dataTable.forEach((item, inx) => {
                setUniqueItems(item, inx);
            });
        }
        setTimeout(() => {
            onBlur(id, newValue);
        }, 0);
    }, [dataTable]);

    /**
     * Диалог подтверждения удаления строки.
     *
     * @param rowData - данные строки, которую нужно удалить.
     */
    const confirmDeleteNode = (rowData) => {
        confirmInfo({
            severity: 'info',
            header: `Подтверждение удаления ${header || 'объекта'}`,
            acceptLabel: 'Удалить',
            actionClass: 'alert',
            style: { minWidth: 450 },
            message: `Удалить ${labelElement ? 'объект ' + rowData[labelElement as string] : 'объект'}?`,
            acceptCb: (accept) => {
                setDataTable((prev) => [...prev.filter((val) => val.id !== rowData.id)]);
                accept();
            },
        });
    };

    /**
     * Открывает диалог для создания или редактирования записи.
     *
     * @param formDataEdit - данные для редактирования (если передано, это режим редактирования).
     */
    const clickNewOrEditNode = (formDataEdit?: any) => {
        confirmInfo({
            header: (formDataEdit ? 'Изменение ' : 'Добавление ') + header,
            acceptLabel: formDataEdit ? 'Изменить' : 'Добавить',
            style: { width: dialogWidth ?? 800 },
            message: (
                <FormJSON
                    formSchema={schema.items}
                    formInitialData={formDataEdit}
                    propUniqueData={registry.formContext.propUniqueData}
                    propUniqueGroups={registry.formContext.propUniqueGroups}
                    onSubmitForm={(data) => {
                        if (data.id) {
                            setDataTable((prev) =>
                                prev.map((item, inx) => {
                                    if (item.id === data.id) {
                                        setUniqueItems(data, inx);
                                        return data;
                                    }
                                    return item;
                                })
                            );
                            hide();
                        } else {
                            const getId = uuidv4();
                            setUniqueItems(data, dataTable.length);
                            setDataTable((prev) => [...prev, { ...data, id: getId }]);
                            hide();
                        }
                    }}
                >
                    <button ref={formSubmit} type="submit" hidden></button>
                </FormJSON>
            ),
            acceptCb: () => {
                formSubmit.current?.click();
            },
        });
    };

    /**
     * Шаблон заголовка таблицы с кнопкой добавления новой записи.
     */
    const headerTemplate = (
        <div className="table-header">
            <div className="flex align-items-start justify-content-center">
                <div>
                    {(!schema.maxItems || dataTable.length < schema.maxItems) && (
                        <Button
                            icon="pi pi-plus-circle"
                            label="Добавить"
                            onClick={(e) => {
                                e.preventDefault();
                                clickNewOrEditNode();
                            }}
                            style={{
                                color: '#073C64',
                                fontWeight: '500',
                                background: '#9BD5FF',
                                border: '1px solid #9BD5FF',
                                borderRadius: '6px',
                                padding: '0.5rem 1.5rem',
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    /**
     * OverlayPanel для отображения дополнительной информации.
     * Каждому элементу назначается свой ref.
     */
    const showAdditionalInfoFields = uiSchema?.['ui:options']?.showAdditionalInfo as [];
    const overlayPanels = useRef<Map<string, any>>(new Map());
    /**
     * Создаёт или получает ref для OverlayPanel по itemId.
     *
     * @param itemId - ID элемента.
     */
    const createOverlayPanelRef = (itemId: string) => {
        if (!overlayPanels.current.has(itemId)) {
            overlayPanels.current.set(itemId, React.createRef());
        }
        return overlayPanels.current.get(itemId);
    };
    /**
     * Шаблон действий (редактирование и удаление) для каждой строки таблицы
     * + опциональное поле вывода дополнительной информации в виде кнопки с иконкой info
     *
     * @param rowData - данные строки.
     */
    const actionBodyTemplate = (rowData) => {
        const op = createOverlayPanelRef(rowData.id);
        return (
            <div className={'action-body'}>
                {showAdditionalInfoFields && (
                    <>
                        <Button
                            type="button"
                            icon="pi pi-info-circle"
                            className="p-button-text"
                            onClick={(e) => {
                                e.preventDefault();
                                op.current?.toggle(e);
                            }}
                        />
                        <OverlayPanel className="tooltip" ref={op}>
                            <div>
                                {showAdditionalInfoFields.map((item) => (
                                    <>
                                        <span key={rowData[item]}>{` ${item}: ${rowData[item] ?? ' - '}`}</span>
                                        <br></br>
                                    </>
                                ))}
                            </div>
                        </OverlayPanel>
                    </>
                )}
                <i
                    className={'pi pi-pencil edit-icon'}
                    onClick={(e) => {
                        e.preventDefault();
                        clickNewOrEditNode(rowData);
                    }}
                ></i>
                <i
                    className={`pi pi-trash delete-icon ${isWriteOnly ? 'visible' : 'hidden'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        confirmDeleteNode(rowData);
                    }}
                />
            </div>
        );
    };

    /**
     * Дефолтное отображение булевых значений как "Да"/"Нет".
     *
     * @param rowData - данные строки.
     * @param column - столбец.
     */
    const booleanBodyDefault = (rowData, column) => <p>{rowData[column.field] ? 'Да' : 'Нет'}</p>;

    /**
     * Проверяет, является ли значение булевым.
     *
     * @param rowData - данные строки.
     * @param column - столбец.
     */
    const isBooleanRowData = (rowData, column) => typeof rowData[column.field] === 'boolean';

    /**
     * Подготовка колонок таблицы на основе uiSchema.fields.
     */
    if (uiSchemaFields && Array.isArray(uiSchemaFields)) {
        /**
         * Получаем функцию для отображения булевых значений, через options
         * или используем стандартное отображение ("Да"/"Нет").
         */
        const curBooleanBody = options.booleanBody || booleanBodyDefault;
        uiSchemaFields?.forEach((itemField) => {
            const currentField = {
                field: '',
                key: '',
            };

            let schemaItem;
            /**
             * Если itemField — это строка, значит, это просто имя поля.
             * Берём его как field и находим соответствующее описание в schemaAllItems.
             */
            if (typeof itemField === 'string') {
                currentField.field = itemField;
                schemaItem = schemaAllItems[itemField];
            } else {
                /**
                 * Если itemField — это объект, значит, он содержит дополнительные параметры:
                 * - field: имя поля
                 * - showByKeyObject: ключ для отображения значения
                 * - schemaHandler: функция для получения схемы поля (если задана)
                 */
                currentField.field = itemField.field;
                currentField.key = itemField.showByKeyObject;
                schemaItem =
                    itemField?.schemaHandler === undefined
                        ? schemaAllItems[itemField.field]
                        : itemField.schemaHandler(schemaAllItems, itemField.field);
            }
            if (schemaItem === undefined) schemaItem = itemField;

            /**
             * Функция для отрисовки содержимого ячейки таблицы.
             *
             * @param rowData - данные строки (объект)
             * @param column - информация о колонке
             * @param key - ключ для отображения значения вложенного объекта
             */
            const body = (rowData, column, key) => {
                const fieldValue = rowData[column.field];
                // Если указан префикс, генерируем значение на основе индекса строки
                if (itemField.prefix) {
                    return (
                        <>
                            <span>{itemField.prefix + column.rowIndex} </span>
                        </>
                    );
                }

                // Если тип поля — логическое, отображаем "Да"/"Нет"
                if (schemaItem.type === 'boolean') {
                    return <p>{rowData[column.field] ? 'Да' : 'Нет'}</p>;
                }

                // Если значение является булевым, используем кастомный или дефолтный рендерер
                if (isBooleanRowData(rowData, column)) {
                    return (curBooleanBody as any)(rowData, column);
                }
                // Если задан dataHandler
                if (itemField.dataHandler) {
                    const processed = itemField.dataHandler(fieldValue);

                    // Если тип поля - массив
                    if (Array.isArray(processed)) {
                        return processed.map((item, idx) => (
                            <div key={idx}>{typeof item === 'string' ? item : item[key] ? item[key] : ' '}</div>
                        ));
                    }

                    // Если dataHandler вернул объект
                    if (processed && typeof processed === 'object') {
                        return processed[key] || '';
                    }

                    // Если dataHandler вернул строку/число - возвращаем напрямую
                    return processed || '';
                }

                // Стандартная обработка массива через запятую
                if (schemaItem.type === 'array') {
                    return (
                        <>
                            <span>({fieldValue?.length ?? 0}) </span>
                            {fieldValue?.map((item, idx, arr) => (
                                <span key={idx}>
                                    {typeof item === 'string' ? item : item[key]}
                                    {arr.length !== idx + 1 ? ', ' : ''}
                                </span>
                            ))}
                        </>
                    );
                }

                return rowData[column.field];
            };
            /**
             * Добавляем новую колонку в список Fields для отображения в DataTableDynamic.
             */
            Fields.push({
                field: currentField.field,
                header: itemField.title,
                body: (rowData, column) => body(rowData, column, currentField.key),
            });
        });
    }

    return (
        <>
            <DataTableDynamic
                data={dataTable}
                id={id}
                dataKey={dataKey}
                className={classNames('p-datatable-table--no-empty-msg', 'p-datatable--border', {
                    'p-invalid': rawErrors?.length,
                    'p-warning': warning,
                })}
                selectionMode="single"
                columns={[...Fields, isDataSelectable() ? { field: 'id', header: '', body: actionBodyTemplate } : {}]}
                footer={isDataSelectable() && isWriteOnly ? headerTemplate : undefined}
            />
        </>
    );
};
