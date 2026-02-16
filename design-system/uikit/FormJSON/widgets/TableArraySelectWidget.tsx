/**
 * Компонент TableArraySelectWidget представляет собой таблицу для выбора одного или нескольких элементов из списка.
 * Используется в рамках React JSON Schema Form, FormJSON в компонентах.
 *
 * @module TableArraySelectWidget
 */

import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { JSONSchema7 } from 'json-schema';
import type { WidgetProps } from '@rjsf/utils';
import { Paginator } from 'primereact/paginator';
import isEqual from 'lodash/isEqual';
import { DataTableDynamic } from '../../DataTableDynamic';

/**
 * Пропсы компонента передаются через rjsf. Основные:
 *
 * @param value - текущее значение массива.
 * @param uiSchema - UI-схема.
 * @param onChange - функция изменения значения.
 * @param onBlur - функция при потере фокуса.
 * @param schema - JSON-схема.
 * @param multiple - режим множественного выбора.
 * @param rawErrors - ошибки валидации.
 * @param id - уникальный идентификатор поля.
 * @param options - дополнительные параметры виджета.
 * @param registry - реестр, содержащий контекст формы.
 */

export const TableArraySelectWidget = ({
    value,
    uiSchema,
    onChange,
    onBlur,
    schema,
    multiple = false,
    rawErrors,
    id,
    options,
}: WidgetProps) => {
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге
    /**
     * Список доступных опций для выбора. Берётся из `schema.enum` или `schema.items.enum`.
     */
    const optionsData = useMemo(() => schema.enum || (schema?.items as JSONSchema7)?.enum, [schema.enum, schema.items]);
    const emptyValue = useMemo(() => uiSchema?.['ui:options']?.emptyValue, [uiSchema]);

    const [selection, setSelection] = useState<any[]>(value || emptyValue);
    /**
     * Поля, которые будут отображаться в таблице.
     * Берутся из `uiSchema['ui:options'].fields` или `schema.items.required`.
     */
    const uiSchemaFields = useMemo(
        () => uiSchema?.['ui:options']?.fields || ((schema?.items as JSONSchema7)?.required ?? []),
        [uiSchema, schema.items]
    );

    /**
     * Ключ данных для идентификации строк. По умолчанию — 'id'.
     */
    const dataKey = useMemo(
        () => (typeof uiSchema?.['ui:options']?.dataKey === 'string' ? uiSchema['ui:options'].dataKey : 'id'),
        [uiSchema]
    );

    /**
     * Функция проверяет, можно ли выбирать строки.
     * Если указан `ui:readonly`, то выборка запрещена.
     */
    const isDataSelectable = () => !uiSchema?.['ui:readonly'];
    /**
     * Поле, по которому определяется, заблокирована ли строка.
     * Если row[disabledField] === true, то строку не выбрать.
     */
    const disabledField = useMemo(() => {
        const field = uiSchema?.['ui:options']?.disabledField;
        if (typeof field === 'string' || typeof field === 'number') {
            return field;
        }
        return null;
    }, [uiSchema]);
    /**
     * Функция, определяющая, можно ли выбрать строку.
     */
    const isRowSelectable = (rowData: any): boolean => {
        // Если виджет в readonly — ничего не выбираем
        if (!isDataSelectable()) return false;

        // Если задано поле disabledField и оно true — не выбираем
        if (disabledField && rowData[disabledField] === true) {
            return false;
        }

        return true;
    };
    const otherSelections = useMemo(() => {
        const rawOtherSelections = uiSchema?.['ui:options']?.otherSelections;
        if (!rawOtherSelections || !Array.isArray(rawOtherSelections)) return [];

        return rawOtherSelections.map((arr) => (Array.isArray(arr) ? arr.flat() : []));
    }, [uiSchema]);

    const usePagination = useMemo(
        () =>
            uiSchema?.['ui:options']?.usePagination !== undefined
                ? Boolean(uiSchema['ui:options'].usePagination)
                : true,
        [uiSchema]
    );

    /**
     * Обновляет значение и вызывает событие onBlur при изменении selection.
     */
    useEffect(() => {
        if (!isEqual(selection, value)) {
            setSelection(value || []);
        }
    }, [value]);

    useEffect(() => {
        if (!isEqual(selection, value)) {
            if (!selection.length) {
                onChange(emptyValue);
                onBlur(id, emptyValue);
            } else {
                onChange(selection);
                onBlur(id, selection);
            }
        }
    }, [selection, value, onChange, onBlur]);

    /**
     * Подготовка колонок таблицы на основе uiSchema.fields.
     */
    const Fields = useMemo(() => {
        /**
         * Получаем объект обработчиков для любых кастомных полей, чаще булевых
         * Принимает ОБЪЕКТ вида: ключ - имя поля, значение - JSX как такое поле выводить
         */
        const customBodies = options.customBody || {};

        if (!Array.isArray(uiSchemaFields)) return [];

        return uiSchemaFields.map((item) => {
            const field = item.field;

            /**
             * Проверяет, является ли значение булевым.
             */
            const isBooleanField = (rowData, column) => typeof rowData[column.field] === 'boolean';
            const body = (rowData: any, column: any) => {
                const customBody = customBodies[field];
                if (customBody) {
                    return customBody(rowData, column);
                }
                if (isBooleanField(rowData, column)) {
                    return <p>{rowData[column.field] ? 'Да' : 'Нет'}</p>;
                }
                return <p>{rowData[column.field]}</p>;
            };

            return {
                field,
                header: item.title,
                isSortable: item.sortable,
                body,
            };
        });
    }, [uiSchemaFields, options.customBody]);

    /**
     * Фильтрует доступные опции, исключая те, которые уже выбраны в других полях формы.
     * Используется `useMemo`, чтобы избежать лишних пересчётов при каждом рендере.
     *
     * @returns {Array} Отфильтрованный массив опций, доступных для выбора.
     */
    const filteredOptionsData = useMemo(() => {
        if (!Array.isArray(optionsData) || !optionsData.length) return undefined;
        const allOtherSelectionsFlat = otherSelections.flat();

        // Фильтруем список доступных опций
        return optionsData.filter((option) => {
            if (!option) return false;
            const key = option[dataKey];

            // Проверяем, находится ли элемент в списке "уже выбранных" (из других полей)
            const inOther = allOtherSelectionsFlat.some((sel) => sel && sel[dataKey] === key);

            // Проверяем, находится ли элемент в текущем списке выбора
            const inCurrent = selection.some((sel) => sel[dataKey] === key);

            // Возвращаем true, если:
            // - Элемент не выбран нигде кроме как в текущем поле
            // - Или он уже выбран в этом поле
            return !inOther || inCurrent;
        });
    }, [optionsData, otherSelections, selection, dataKey]);

    const [pageQuery, setPageQuery] = useState(1); // Номер текущей страницы.
    const [sizeQuery, setSizeQuery] = useState(10); // Размер страницы (сколько записей отображается на одной странице).
    /**
     * Обработчик изменения страницы пагинации.
     *
     * @param e - событие изменения страницы.
     */
    const onPaginatorHandler = (e) => {
        setPageQuery(e.page + 1);
        setSizeQuery(e.rows);
    };

    return (
        <>
            <DataTableDynamic
                data={
                    usePagination
                        ? (filteredOptionsData && filteredOptionsData.length > 0
                              ? (filteredOptionsData as any[])
                              : []
                          ).slice(sizeQuery * (pageQuery - 1), sizeQuery * (pageQuery - 1) + sizeQuery)
                        : (filteredOptionsData as any[])
                }
                id={id}
                dataKey={dataKey}
                className={classNames('p-datatable-table--no-empty-msg', 'p-datatable--border', {
                    'p-invalid': rawErrors && rawErrors.length > 0,
                    'p-warning': warning,
                })}
                rowClassName={(data) => (isRowSelectable(data) ? '' : 'p-disabled p-disabled-row')}
                selectionMode={multiple ? 'multiple' : 'single'}
                ColumnSelectionModeType={multiple ? 'multiple' : 'single'}
                selection={selection.length === 0 ? value : selection}
                onSelectionChange={(e) => {
                    setSelection(e.value);
                }}
                columns={[...Fields]}
                isDataSelectable={isDataSelectable}
            />
            {usePagination && filteredOptionsData && filteredOptionsData.length > 10 ? (
                <Paginator
                    rows={sizeQuery}
                    totalRecords={filteredOptionsData.length}
                    first={sizeQuery * (pageQuery - 1)}
                    onPageChange={onPaginatorHandler}
                />
            ) : null}
        </>
    );
};
