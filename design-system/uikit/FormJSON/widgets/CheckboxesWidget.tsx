import React, { FocusEvent, ChangeEvent } from 'react';
import {
    enumOptionsDeselectValue,
    enumOptionsValueForIndex,
    enumOptionsIsSelected,
    optionId,
    enumOptionsSelectValue,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { Checkbox } from 'primereact/checkbox';

export function CheckboxesWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const {
        id,
        disabled,
        options,
        value,
        readonly,
        onChange,
        onBlur,
        onFocus,
        required,
        // uiSchema,
        // rawErrors = [],
    } = props;
    const { enumOptions, enumDisabled, emptyValue } = options;
    const checkboxesValues = Array.isArray(value) ? value : [value];

    const _onBlur = ({ target: { value: val } }: FocusEvent<HTMLInputElement | any>) =>
        onBlur(id, enumOptionsSelectValue<S>(val, enumOptions as any, emptyValue));
    const _onFocus = ({ target: { value: val } }: FocusEvent<HTMLInputElement | any>) =>
        onFocus(id, enumOptionsValueForIndex<S>(val, enumOptions, emptyValue));

    const row = options ? options.inline : false;

    return (
        <div style={{ display: 'flex', flexDirection: row ? 'row' : 'column', flexWrap: 'wrap' }}>
            {Array.isArray(enumOptions) &&
                enumOptions.map((option, index, array) => {
                    const checked = enumOptionsIsSelected<S>(option.value, checkboxesValues);
                    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
                        if (event.target.checked) {
                            onChange(enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions));
                        } else {
                            onChange(enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions));
                        }
                    };
                    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;

                    return (
                        <div
                            key={optionId(id, index)}
                            style={index !== array.length - 1 ? { marginBottom: '.6rem', paddingRight: '1.6rem' } : {}}
                        >
                            <Checkbox
                                inputId={optionId(id, index)}
                                value={String(index)}
                                onChange={handleChange as any}
                                onBlur={_onBlur}
                                onFocus={_onFocus}
                                required={required}
                                disabled={disabled || itemDisabled || readonly}
                                checked={checked}
                            />
                            {option.label && (
                                <label style={{ marginLeft: '.6rem' }} htmlFor={optionId(id, index)}>
                                    {option.label || ''}
                                </label>
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
