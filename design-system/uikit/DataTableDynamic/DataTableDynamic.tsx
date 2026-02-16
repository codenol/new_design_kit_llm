/**
 * Кастомный динамический компонент таблицы на основе PrimeReact.
 * Поддерживает фильтрацию, пагинацию, раскрытие строк, выбор элементов.
 *
 * @module DataTableDynamic
 */
import React, { useState, useEffect, ReactNode } from 'react';
import {
    DataTable,
    DataTableFilterMeta,
    DataTableRowClassNameOptions,
    DataTableRowData,
    DataTableSortMeta,
} from 'primereact/datatable';
import { Column, ColumnSortEvent } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

import { FilterMatchMode } from 'primereact/api';
import type { VirtualScrollerProps } from 'primereact/virtualscroller';
import type { DataTableValueArray, DataTableExpandedRows } from 'primereact/datatable';

import { SvgIcon } from '../SvgIcon';
import { paginatorTemplate } from '../Paginator/paginatorTemplate';

/**
 * Опция количества строчек на странице.
 */
export interface IDataTableDynamicRowOption {
    label: string;
    value: number;
}

/**
 * Интерфейс для описания колонок таблицы.
 *
 * @interface IDataTableDynamicColumns
 */
export interface IDataTableDynamicColumns {
    /**
     * Имя поля в данных.
     */
    field: string;
    /**
     * Заголовок колонки.
     */
    header?: string | ReactNode;
    /**
     * Отображать ли колонку.
     */
    hidden?: boolean;
    /**
     * Поле для сортировки.
     */
    sortField?: string;
    /**
     * Поле для фильтрации.
     */
    filterField?: string;
    /**
     * Кастомный рендер содержимого.
     */
    body?: (rowData: any, column: any) => JSX.Element | string;
    /**
     * Сортировать ли по этой колонке.
     */
    isSortable?: boolean;
    /**
     * Включить ли фильтр для колонки.
     */
    isFilter?: boolean;
    /**
     * Стили колонки.
     */
    style?: React.CSSProperties | object;
    /**
     * Порядок сортировки.
     */
    orders?: object[];
    /**
     * Кастомная функция сортировки.
     */
    sortFunction?: (event: ColumnSortEvent) => void;
    /**
     * Выравнивание текста.
     */
    align?: 'left' | 'right' | 'center';
    /**
     * Стили заголовка.
     */
    headerStyle?: React.CSSProperties;
    /**
     * Флаг фиксирования колонки слева при прокрутке вправо.
     */
    frozen?: boolean;
    /**
     * CSS-класс.
     */
    className?: string;
    /**
     * Выравнивание зафиксированной колонки.
     */
    alignFrozen?: string;
}

/**
 * Пропсы для компонента `DataTableDynamic`.
 */
export interface DataTableDynamicProps {
    /**
     * Идентификатор таблицы.
     */
    id?: string;
    /**
     * Массив данных для отображения.
     */
    data: object[];
    /**
     * Массив колонок таблицы.
     */
    columns: IDataTableDynamicColumns[];
    /**
     * Верхняя часть таблицы: заголовок, "поиск", JSX-элемент.
     */
    header?: React.FC | 'search' | boolean | React.ReactElement;
    /**
     * Действия в правой части заголовка.
     */
    actions?: React.ReactNode;
    /**
     * Нижняя часть таблицы.
     */
    footer?: React.FC | JSX.Element;
    /**
     * Флаг экспандера строк.
     */
    isRowExpansion?: boolean;
    /**
     * ID строки, которая будет развернута.
     */
    openExpandRowById?: string;
    /**
     * Шаблон для разворачивания строки.
     */
    rowExpansionTemplate?: React.FC;
    /**
     * Фильтры таблицы.
     */
    filters?: DataTableFilterMeta;
    /**
     * Стиль контейнера.
     */
    style?: React.CSSProperties;
    /**
     * CSS-класс.
     */
    className?: string;
    /**
     * Уникальный ключ для строк.
     */
    dataKey?: string;
    /**
     * Тип выделения строк.
     */
    ColumnSelectionModeType?: 'single' | 'multiple';
    /**
     * Режим выделения.
     */
    selectionMode?: 'single' | 'multiple';
    /**
     * Флаг фиксирования колонки выделения.
     */
    ColumnSelectionFrozen?: boolean;
    /**
     * Выбранные строчки.
     */
    selection?: string[];
    /**
     * Флаг автофокуса при изменении выбора.
     */
    selectionAutoFocus?: boolean;
    /**
     * Обработчик изменения выбора.
     */
    onSelectionChange?: (any) => void;
    /**
     * Поля для глобального поиска.
     */
    globalFilterFields?: string[];
    /**
     * Обработчик нажатия по строке.
     */
    onRowClick?: (any) => void;
    /**
     * Контекстное меню.
     */
    contextMenuTemplate?: (event: any, data: any) => void;
    /**
     * Флаг отображения границы ячеек.
     */
    showGridlines?: boolean;
    /**
     * Применяется ли сортировка по умолчанию.
     */
    isDefaultSorted?: string;
    /**
     * Направление сортировки (1 - по возрастанию, -1 - по убыванию).
     */
    defaultSortOrder?: number;
    /**
     * Флаг прокручивания таблицы.
     */
    scrollable?: boolean;
    /**
     * Высота области прокрутки.
     */
    scrollHeight?: string;
    /**
     * Параметры виртуального скроллинга.
     */
    virtualScrollerOptions?: VirtualScrollerProps;
    /**
     * Обработчик сортировки таблицы. Вызывается при изменении порядка сортировки колонок.
     */
    onSort?: (event) => void;
    /**
     * Метаинформация для множественной сортировки. Массив объектов, где каждый объект описывает поле и направление сортировки.
     */
    multiSortMeta?: DataTableSortMeta[] | null;
    /**
     * Изменяется ли ширина колонок.
     */
    resizableColumns?: boolean | undefined;
    /**
     * Перетаскиваемые ли колонки.
     */
    reorderableColumns?: boolean | undefined;
    /**
     * Выделяемые ли строчки таблицы.
     */
    isDataSelectable?: (any) => boolean | null | undefined;
    /**
     * Кастомный класс для строк.
     */
    rowClassName?(data: DataTableRowData<any>, options: DataTableRowClassNameOptions<any>): object | string | undefined;
    /**
     * Тип хранения состояния.
     */
    stateStorage?: 'session' | 'local' | 'custom';
    /**
     * Ключ для сохранения состояния таблицы.
     */
    stateKey?: string;
    /**
     * Флаг пагинации.
     */
    paginator?: boolean;
    /**
     * Количество строк на странице.
     */
    rows?: number;
    /**
     * Опции для выбора количества строк на странице.
     */
    rowsPerPageOptions?: IDataTableDynamicRowOption[];
    /**
     * Дополнительные свойства, пробрасываемые в `DataTable`.
     */
    props?: any;
    /**
     * Разделитель для экспорта CSV.
     */
    csvSeparator?: string;
    /**
     * Имя файла при экспорте.
     */
    exportFilename?: string;
    /**
     * Ссылка на таблицу.
     */
    tableRef?: any;
    /**
     * Обработчик изменения состояния разворачивания строк.
     */
    onRowToggle?: (any) => void;
    /**
     * Флаг чередования цветов строк.
     */
    stripedRows?: boolean;
}

/** Дефолтное сообщение при пустом `data` */
const EMPTY_MESSAGE = 'Нет данных';

/**
 * Основной компонент таблицы
 */
export const DataTableDynamic: React.FC<DataTableDynamicProps> = ({
    data,
    columns,
    header,
    footer,
    isRowExpansion,
    style,
    actions,
    className,
    openExpandRowById,
    rowExpansionTemplate,
    ColumnSelectionModeType,
    ColumnSelectionFrozen,
    dataKey,
    selection,
    selectionMode,
    onSelectionChange,
    selectionAutoFocus,
    onRowClick,
    contextMenuTemplate,
    showGridlines,
    isDefaultSorted = '',
    defaultSortOrder = 1,
    id,
    scrollable,
    scrollHeight,
    virtualScrollerOptions,
    resizableColumns,
    reorderableColumns,
    globalFilterFields,
    isDataSelectable,
    paginator,
    rows,
    rowsPerPageOptions,
    csvSeparator = ';',
    exportFilename = `export-${new Date().toLocaleDateString('ru-RU')}`,
    tableRef,
    onRowToggle,
    stripedRows = false,
    ...props
}) => {
    const [tableVisible, setTableVisible] = useState(false);
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [first] = useState(0);
    const [curRows] = useState(rows || 15);
    const [curRowsPerPageOptions] = useState(
        rowsPerPageOptions || [
            { label: '10', value: 10 },
            { label: '15', value: 15 },
            { label: '30', value: 30 },
        ]
    );
    const [expandedRows, setExpandedRows] = useState<DataTableValueArray | DataTableExpandedRows | undefined>(
        openExpandRowById ? { [`${openExpandRowById}`]: true } : undefined
    );

    /**
     * Задержка отрисовки для корректного отображения таблицы.
     */
    useEffect(() => {
        setTimeout(() => setTableVisible(true), 0);
    }, []);

    /**
     * Динамическое создание колонок из массива `columns`.
     */
    const dynamicColumns = columns.map((col) => (
        <Column
            key={col.field}
            field={col.field}
            style={col.style}
            align={col.align ? col.align : 'left'}
            filterField={col.filterField}
            header={col.header}
            hidden={col.hidden}
            sortField={col.sortField}
            sortFunction={col.sortFunction}
            sortable={col.isSortable}
            filter={col.isFilter}
            body={col.body}
            headerStyle={col.headerStyle}
            frozen={col.frozen}
            className={col.className}
            alignFrozen={col.alignFrozen as any}
        />
    ));
    /**
     * Обработчик изменения глобального фильтра.
     *
     * @param e - событие ввода.
     */
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters.global.value = value;

        setFilters(_filters);
        setGlobalFilterValue1(value);
    };

    /**
     * Открытие контекстного меню.
     *
     * @param event - событие клика.
     * @param dataRow - данные строки.
     */
    const toggleContext = (event, dataRow?: object) => {
        const typeData = event.data ? event.data : dataRow;
        const typeEvent = event.data ? event.originalEvent : event;
        if (contextMenuTemplate) {
            contextMenuTemplate(typeEvent, typeData);
        }
    };

    /**
     * Восстановление сортировки из localStorage, если задан `stateKey`.
     */
    const storedTableState = props.stateKey && localStorage.getItem(props.stateKey);
    const storedSortField = storedTableState && JSON.parse(storedTableState).multiSortMeta;

    /**
     * Шаблон заголовка с полем поиска.
     */
    const searchHeader = (
        <div className="flex justify-content-between">
            <div className="flex">
                <span className="p-input-icon-left mr-3">
                    <i>
                        <SvgIcon className={'mr-2'} name={'search'} size="1rem" />
                    </i>
                    <InputText value={globalFilterValue1} onChange={onGlobalFilterChange} placeholder="Поиск" />
                </span>
            </div>
            <div className="flex">{!!actions && <div className="ml-3">{actions}</div>}</div>
        </div>
    );

    if (!tableVisible) {
        return null;
    }

    return (
        <DataTable
            id={id}
            value={data}
            sortMode="multiple"
            multiSortMeta={
                storedSortField || [
                    {
                        field: isDefaultSorted,
                        order: defaultSortOrder,
                    },
                ]
            }
            style={style}
            className={className}
            rowHover={true}
            filters={filters}
            scrollable={scrollable}
            showGridlines={showGridlines}
            expandedRows={expandedRows}
            header={header === 'search' ? searchHeader : header}
            footer={footer}
            emptyMessage={EMPTY_MESSAGE}
            onRowToggle={(e: any) => {
                setExpandedRows(e.data);
                onRowToggle?.(e);
            }}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey={dataKey}
            selection={selection}
            selectionMode={selectionMode}
            selectionAutoFocus={selectionAutoFocus ?? true}
            onSelectionChange={onSelectionChange}
            onContextMenu={(event) => toggleContext(event)}
            onRowClick={onRowClick}
            scrollHeight={scrollHeight}
            virtualScrollerOptions={virtualScrollerOptions}
            resizableColumns={resizableColumns}
            reorderableColumns={reorderableColumns}
            globalFilterFields={globalFilterFields}
            isDataSelectable={isDataSelectable}
            paginator={paginator}
            rows={curRows}
            rowsPerPageOptions={curRowsPerPageOptions}
            stripedRows={stripedRows}
            paginatorTemplate={paginatorTemplate(data?.length, curRowsPerPageOptions)}
            first={first}
            csvSeparator={csvSeparator}
            exportFilename={exportFilename}
            ref={tableRef}
            {...(props as any)}
        >
            {/* Колонка выбора */}
            {ColumnSelectionModeType && (
                <Column
                    selectionMode={ColumnSelectionModeType}
                    frozen={ColumnSelectionFrozen}
                    headerStyle={{ width: '3em' }}
                />
            )}
            {/* Колонка экспандера */}
            {isRowExpansion && <Column expander style={{ width: '3em' }} />}

            {/* Динамические колонки */}
            {dynamicColumns}
        </DataTable>
    );
};
