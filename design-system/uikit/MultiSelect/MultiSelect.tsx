/**
 * Обертка над MultiSelect из Primereact
 *
 * @module MultiSelect
 * @link https://primereact.org/multiselect/
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MultiSelect, MultiSelectAllEvent, MultiSelectProps } from 'primereact/multiselect';
import { multiSelectFilterFunction } from './utils/multiSelectFilterFunction';

export interface IMultiSelectAllEvent extends MultiSelectAllEvent {
    displayOptions: MultiSelectProps['options'];
    value: MultiSelectProps['value'];
}

export interface MultiSelectComponentProps extends MultiSelectProps {
    /**
     * @description Строка значения фильтрации.
     * @default undefined
     */
    filterValue?: string;
    /**
     * @description Перегрузка стандартного колбека onSelectAll, с добавлением в event отображаемых значений(displayOptions)
     * и вынесенным value на верхний уровень (аналогично с колбеком onChange).
     * @default undefined
     */
    onSelectAll?: (event: IMultiSelectAllEvent) => void;
}

export const MultiSelectComponent: React.FC<MultiSelectComponentProps> = (props) => {
    const {
        value,
        filterValue,
        options = [],
        onFilter,
        optionValue,
        filter,
        filterMatchMode,
        optionGroupChildren,
        optionGroupLabel,
        filterBy,
        filterLocale,
        optionLabel,
        selectAll,
        onSelectAll,
        showSelectAll = true,
    } = props;

    const [displayValue, setDisplayValue] = useState<any[]>();
    const [filterState, setFilterState] = useState(filterValue);

    const getValueFromOptions = useCallback(
        (node) =>
            typeof node === 'object' && optionValue && node?.[optionValue] !== undefined ? node[optionValue] : node,
        [optionValue]
    );

    const isSelectedAll: boolean = useMemo(() => {
        if (selectAll !== undefined) return selectAll;
        if (!displayValue || !displayValue.length) return false;
        if (Array.isArray(value)) return displayValue.every((node) => value.includes(getValueFromOptions(node)));
        return false;
    }, [selectAll, displayValue, value, getValueFromOptions]);

    useEffect(() => {
        if (filter && filterState) {
            setDisplayValue(
                multiSelectFilterFunction({
                    value,
                    filterValue: filterState,
                    options,
                    filterMatchMode,
                    optionGroupChildren,
                    optionGroupLabel,
                    filterBy,
                    filterLocale,
                    optionLabel,
                })
            );
        } else if (!filter || !filterState) setDisplayValue(options);
    }, [
        filter,
        filterBy,
        filterLocale,
        filterMatchMode,
        filterState,
        optionGroupChildren,
        optionGroupLabel,
        optionLabel,
        options,
        value,
    ]);

    /**
     * Функция выбора всех значений в списке доступных/отфильтрованных
     * @param event: IMultiSelectAllEvent
     */
    const selectAllHandler = (event) => {
        if (onSelectAll) {
            const setOfSelectedValue = new Set(value);
            if (event.checked) {
                displayValue?.forEach((node) => setOfSelectedValue.delete(getValueFromOptions(node)));
            } else {
                displayValue?.forEach((node) => setOfSelectedValue.add(getValueFromOptions(node)));
            }
            event.displayOptions = displayValue;
            event.value = Array.from(setOfSelectedValue);
            onSelectAll(event);
        }
    };

    const mutatedProps = { ...props };
    mutatedProps.onSelectAll = onSelectAll ? selectAllHandler : undefined;

    return (
        <MultiSelect
            options={displayValue}
            onFilter={(event) => (onFilter ? onFilter(event) : setFilterState(event.filter))}
            selectAll={showSelectAll ? isSelectedAll : undefined}
            {...mutatedProps}
        />
    );
};
