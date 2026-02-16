import React, { useState } from 'react';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import classNames from 'classnames';
import { WidgetProps } from '@rjsf/utils';

export const DropdownWidget = (props: WidgetProps) => {
    const { id, value, disabled, options, readonly, onChange, onBlur, onFocus, uiSchema, rawErrors } = props;
    const { customStyle } = options;
    const [autocompleteData] = useState<any>(uiSchema?.['ui:options']?.autocomplete || []);
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге

    const [filteredObject, setFilteredObject] = useState([]);

    const _onChange = ({ target: { value: val } }: DropdownChangeEvent) =>
        onChange(val === '' ? options.emptyValue : val);

    const _onBlur = ({ target: { value: val } }: React.FocusEvent<HTMLInputElement>) =>
        onBlur(id, val === '' ? options.emptyValue : val);

    const _onFocus = ({ target: { value: val } }: React.FocusEvent<HTMLInputElement>) => onFocus(id, val);

    const searchString = (event: { query: string }) => {
        setTimeout(() => {
            let _filteredCountries;
            if (!event.query.trim().length) {
                _filteredCountries = [...autocompleteData];
            } else {
                _filteredCountries = autocompleteData.filter((item) =>
                    item.toLowerCase().startsWith(event.query.toLowerCase())
                );
            }

            setFilteredObject(_filteredCountries);
        }, 250);
    };
    return (
        <AutoComplete
            id={id}
            className={classNames('', {
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            style={{ width: '100%', ...(customStyle as any) }}
            value={value}
            suggestions={filteredObject}
            completeMethod={searchString}
            dropdown={Array.isArray(autocompleteData) && autocompleteData.length > 0}
            onChange={_onChange}
            onBlur={_onBlur}
            onFocus={_onFocus}
            disabled={disabled || readonly}
        />
    );
};
