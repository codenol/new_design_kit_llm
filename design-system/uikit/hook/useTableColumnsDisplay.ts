import { useDeferredValue, useMemo } from 'react';
import { TableColumnsConfigurationProps } from '../TableColumnsConfiguration';

export interface useTableColumnsDisplayProps<T> {
    selectedColumnsNames: string[];
    allColumns: T[];
    baseColumns?: T[];
    extendedColumns?: T[];
    field?: string;
    displayNameField?: string;
}

export interface useTableColumnsDisplayReturn<T> {
    selectedColumns: T[];
    allColumnsRepresentation: TableColumnsConfigurationProps['allColumns'];
}

export const useTableColumnsDisplay: <E>(props: useTableColumnsDisplayProps<E>) => useTableColumnsDisplayReturn<E> = (
    props
) => {
    const {
        selectedColumnsNames,
        allColumns,
        baseColumns = [],
        extendedColumns = [],
        field = 'field',
        displayNameField = 'name',
    } = props;
    const selectedColumns = useMemo(
        () => allColumns.filter((column) => selectedColumnsNames?.includes(column[field] ?? '')),
        [allColumns, field, selectedColumnsNames]
    );

    const deferredSelectedColumns = useDeferredValue(
        [...baseColumns, ...(selectedColumns ?? [])].concat(extendedColumns)
    );

    return {
        selectedColumns: deferredSelectedColumns,
        allColumnsRepresentation: allColumns.map((column) => ({
            field: column?.[field] ?? '',
            name: column?.[displayNameField] ?? '',
        })),
    };
};
