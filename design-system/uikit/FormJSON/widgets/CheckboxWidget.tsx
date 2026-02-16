import React, { useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { schemaRequiresTrueValue, WidgetProps } from '@rjsf/utils';

export const CheckboxWidget = (props: WidgetProps) => {
    const { schema, id, value, disabled, readonly, label, onChange, onBlur, onFocus, uiSchema } = props;
    const required = schemaRequiresTrueValue(schema);
    const tooltip = schema.description;
    const clearWhenDisabled = uiSchema?.['ui:clearWhenDisabled']; // Устанавливает значение чекбокса в false при блокировке

    const _onChange = (event: any) => {
        onChange(event.checked);
        onBlur(id, event.checked);
    };
    /* const _onBlur = (event: any) => {
      onBlur(id, event.target.checked);
    } */
    const _onFocus = (event: any) => onFocus(id, event.checked);

    useEffect(() => {
        if (clearWhenDisabled && (disabled || readonly) && value) {
            onChange(false);
        }
    }, [disabled, readonly]);

    return (
        <div>
            <Checkbox
                inputId={id}
                value={value}
                onChange={_onChange}
                /* onBlur={_onBlur} */
                onFocus={_onFocus}
                required={required}
                disabled={disabled || readonly}
                checked={typeof value === 'undefined' ? false : Boolean(value)}
            />
            <label style={{ marginLeft: '.5rem' }} htmlFor={id}>
                {label || ''}
            </label>
            {tooltip ? (
                <Button
                    className="cursor-auto"
                    icon="pi pi-info-circle circle"
                    tabIndex={-1}
                    link={true}
                    tooltip={tooltip}
                    style={{ padding: '0px' }}
                    type="button"
                />
            ) : null}
        </div>
    );
};
