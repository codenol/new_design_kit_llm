import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { WidgetProps } from '@rjsf/utils';

export const TextareaWidget = (props: WidgetProps) => {
    const {
        uiSchema,
        id,
        value,
        disabled,
        // readonly,
        required,
        // label,
        // autofocus,
        onChange,
        onBlur,
        onFocus,
        options,
    } = props;

    const _onChange = ({ target: { value: val } }) => {
        onChange(val === '' ? options.emptyValue : val);
    };

    const _onBlur = ({ target: { value: val } }) => {
        onBlur(id, val);
    };
    const _onFocus = ({ target: { value: val } }) => {
        onFocus(id, val);
    };

    return (
        <InputTextarea
            id={id}
            required={required}
            value={value}
            rows={uiSchema?.['ui:options']?.rows}
            autoResize
            disabled={disabled}
            onChange={_onChange}
            style={{ width: '100%' }}
            onBlur={_onBlur}
            onFocus={_onFocus}
        />
    );
};
