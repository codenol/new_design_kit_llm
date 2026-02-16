import React, { ChangeEvent, FocusEvent, useRef } from 'react';
import cn from 'classnames';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { WidgetProps } from '@rjsf/utils';

export const SelectWidget = ({
    /* schema, */
    id,
    options,
    required,
    disabled,
    readonly,
    value,
    multiple = false,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    uiSchema,
    formContext,
    rawErrors = [],
}: WidgetProps) => {
    const { enumOptions, customStyle } = options;
    const emptyValue = multiple ? [] : '';
    const placeholder = uiSchema ? uiSchema['ui:placeholder'] : '';
    const testid = uiSchema?.['ui:options']?.testid; // Id для тестирования, устанавливается в атрибут data-testid.
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге
    const onChangeCustom = uiSchema?.onChangeCustom;

    const dropdownInputRef = useRef(null);

    const _onChange = (e: ChangeEvent<{ value: string }>) => {
        onChange(e.target.value);
        if (onChangeCustom !== undefined) onChangeCustom(e, formContext);
    };

    const _onBlur = ({ target }: FocusEvent<HTMLInputElement>) => {
        if (document.activeElement === dropdownInputRef.current) {
            return;
        }
        onBlur(id, target.value);
    };

    const _onFocus = ({ target: { value: val } }: FocusEvent<HTMLInputElement>) => onFocus(id, val);

    return multiple ? (
        <MultiSelect
            id={id}
            style={{ width: '100%', ...(customStyle as any) }}
            className={cn({
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            value={typeof value === 'undefined' ? emptyValue : value}
            panelHeaderTemplate={true}
            showSelectAll={false}
            options={enumOptions}
            onChange={_onChange as any}
            onBlur={_onBlur}
            onFocus={_onFocus}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus}
            data-testid={testid}
        />
    ) : (
        <Dropdown
            id={id}
            style={{ width: '100%', ...(customStyle as any) }}
            className={cn({
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            value={typeof value === 'undefined' ? emptyValue : value}
            options={enumOptions}
            placeholder={placeholder}
            onChange={_onChange as any}
            onBlur={_onBlur}
            filter={uiSchema?.['ui:filter']}
            onFocus={_onFocus}
            required={required}
            disabled={disabled || readonly}
            optionDisabled={(i) => i?.schema?.readOnly}
            autoFocus={autofocus}
            focusInputRef={dropdownInputRef}
            data-testid={testid}
        />
    );
};
