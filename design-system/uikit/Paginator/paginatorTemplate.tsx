import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import './paginator.scss';

export const paginatorTemplate = (totalRecords, curRowsPerPageOptions) => {
    const dropdownOptions = [...curRowsPerPageOptions, { label: 'Все', value: totalRecords }];
    return {
        layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown ',
        RowsPerPageDropdown: (options) => (
            <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
        ),
        CurrentPageReport: (options) => <span>{`(${options.currentPage} из ${options.totalPages})`}</span>,
    };
};
