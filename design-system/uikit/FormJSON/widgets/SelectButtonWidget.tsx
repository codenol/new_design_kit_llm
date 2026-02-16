import React from 'react';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { schemaRequiresTrueValue, WidgetProps } from '@rjsf/utils';

export const SelectButtonWidget = (props: WidgetProps) => {
    const { schema, uiSchema, id, value, disabled, readonly, onChange, multiple = false, autofocus = false } = props;

    const options = schema.options;
    const required = schemaRequiresTrueValue(schema);
    const itemTemplate = uiSchema?.['ui:options']?.itemTemplate;

    const _onChange = ({ target: { value: val } }: SelectButtonChangeEvent) =>
        onChange(val === '' ? options.emptyValue : val);

    return (
        <SelectButton
            id={id}
            value={value}
            options={options}
            optionLabel={'title'}
            optionValue={'const'}
            multiple={multiple}
            onChange={_onChange}
            itemTemplate={itemTemplate as any}
            autoFocus={autofocus}
            required={required}
            disabled={disabled || readonly || disabled}
        />
    );
};
