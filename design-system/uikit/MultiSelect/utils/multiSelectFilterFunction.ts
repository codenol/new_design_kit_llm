import { MultiSelectProps } from 'primereact/multiselect';
import { FilterService } from 'primereact/api';
import { ObjectUtils } from 'primereact/utils';
import { SelectItemOptionsType } from 'primereact/selectitem';

export interface multiSelectFilterFunctionProps {
    filterValue?: string;
    value: MultiSelectProps['value'];
    filterBy: MultiSelectProps['filterBy'];
    options: MultiSelectProps['options'];
    filterLocale: MultiSelectProps['filterLocale'];
    filterMatchMode: MultiSelectProps['filterMatchMode'];
    optionGroupChildren: MultiSelectProps['optionGroupChildren'];
    optionGroupLabel: MultiSelectProps['optionGroupLabel'];
    optionLabel: MultiSelectProps['optionLabel'];
}

/**
 * Функция фильтрации контента для обертки над MultiSelect.
 * @returns отфильтрованный контент.
 */
export const multiSelectFilterFunction = (props: multiSelectFilterFunctionProps) => {
    const {
        filterValue,
        options,
        filterMatchMode = 'contains',
        optionGroupLabel = '',
        optionGroupChildren = '',
        optionLabel,
        filterBy,
        filterLocale,
    } = props;

    if (!filterValue) return options;
    const getOptionGroupChildren = (optionGroup) => ObjectUtils.resolveFieldData(optionGroup, optionGroupChildren);

    const clearFilterValue = filterValue.trim().toLocaleLowerCase(filterLocale);
    const searchFields = filterBy ? filterBy.split(',') : [optionLabel || 'label'];

    if (optionGroupLabel) {
        const filteredGroups: SelectItemOptionsType = [];

        options?.forEach((optgroup) => {
            const filteredSubOptions = FilterService.filter(
                getOptionGroupChildren(optgroup),
                searchFields,
                filterValue,
                clearFilterValue,
                filterLocale
            );

            if (filteredSubOptions && filteredSubOptions.length) {
                filteredGroups.push({
                    ...optgroup,
                    ...{ [optionGroupChildren]: filteredSubOptions },
                });
            }
        });

        return filteredGroups;
    }
    return FilterService.filter(props.options, searchFields, filterValue, filterMatchMode, props.filterLocale);
};
