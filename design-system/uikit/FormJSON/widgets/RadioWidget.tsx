import React, { useCallback } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import {
    schemaRequiresTrueValue,
    WidgetProps,
    enumOptionsIsSelected,
    enumOptionsValueForIndex,
    optionId,
} from '@rjsf/utils';

export const RadioWidget = (props: WidgetProps) => {
    const { schema, id, value, disabled, readonly, onChange, onBlur, onFocus, options, autofocus = false } = props;
    const { enumOptions, enumDisabled, inline, emptyValue } = options;
    const required = schemaRequiresTrueValue(schema);

    const handleBlur = useCallback(
        ({ target: { value: val } }: React.FocusEvent<HTMLInputElement>) =>
            onBlur(id, enumOptionsValueForIndex(val, enumOptions, emptyValue)),
        [onBlur, id]
    );

    const handleFocus = useCallback(
        ({ target: { value: val } }: React.FocusEvent<HTMLInputElement>) =>
            onFocus(id, enumOptionsValueForIndex(val, enumOptions, emptyValue)),
        [onFocus, id]
    );

    const style = inline ? { display: 'flex' } : {};

    return (
        <div style={style}>
            {Array.isArray(enumOptions) &&
                enumOptions.map((option, i) => {
                    const checked = enumOptionsIsSelected(option.value, value);
                    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;
                    // const disabledCls = disabled || itemDisabled || readonly ? 'disabled' : '';

                    const handleChange = () => onChange(option.value);

                    return (
                        <div key={optionId(id, i)} style={{ paddingRight: '1rem' }}>
                            <RadioButton
                                inputId={optionId(id, i)}
                                value={checked}
                                autoFocus={autofocus && i === 0}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                required={required}
                                disabled={disabled || readonly || itemDisabled}
                                checked={typeof checked === 'undefined' ? false : Boolean(checked)}
                            />
                            <label htmlFor={optionId(id, i)}>{option.label || ''}</label>
                        </div>
                    );
                })}
        </div>
    );
};
