import React from 'react';
import classNames from 'classnames';
import { Chips } from 'primereact/chips';
import { WidgetProps } from '@rjsf/utils';

export const ChipsWidget = ({
    id,
    required,
    disabled,
    readonly,
    value,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    options,
    uiSchema,
    rawErrors = [],
}: WidgetProps) => {
    const placeholder = uiSchema ? uiSchema['ui:placeholder'] : '';
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге

    const _onChange = ({ target: { value: val } }) => onChange(!val.length ? options.emptyValue : val);
    const _onBlur = ({ target: { value: val } }) => onBlur(id, val);
    const _onFocus = ({ target: { value: val } }) => onFocus(id, val);

    return (
        <Chips
            value={value}
            id={id}
            style={{ display: 'inline' }}
            className={classNames({
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            onChange={_onChange}
            onBlur={_onBlur}
            onFocus={_onFocus}
            onKeyDown={(e) => {
                const target = e.target as HTMLInputElement;
                if (e.key === 'Enter' && !target.value.trim()) {
                    e.preventDefault();
                }
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus}
        />
    );
};
