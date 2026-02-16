import React from 'react';
import { Password } from 'primereact/password';
import { WidgetProps } from '@rjsf/utils';
import classNames from 'classnames';

export const PasswordWidget = (props: WidgetProps) => {
    const {
        id,
        value,
        disabled,
        placeholder,
        readonly,
        required,
        rawErrors,
        options,
        onChange,
        onBlur,
        onFocus,
        schema,
        name,
        formContext,
        uiSchema,
    } = props;

    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге

    const _onChange = ({ target: { value: val } }: React.ChangeEvent<HTMLInputElement>) =>
        onChange(val === '' ? options.emptyValue : val);

    const _onBlur = ({ target: { value: val } }: React.FocusEvent<HTMLInputElement>) => onBlur(id, val);

    const _onFocus = (val) => {
        if (schema.writeOnly && value?.[0] === '*') {
            const removeFormData = { ...formContext.formRef.current.state.formData };
            delete removeFormData[name];
            formContext.formRef.current.onChange(removeFormData);
        } else {
            onFocus(id, val);
        }
    };

    return (
        <Password
            feedback={false}
            toggleMask={true}
            inputClassName={classNames({
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            name={id}
            style={{ width: '100%' }}
            inputId={id}
            disabled={disabled || readonly}
            placeholder={placeholder}
            required={required}
            value={value || ''}
            onChange={_onChange}
            onBlur={_onBlur}
            onFocus={_onFocus}
        ></Password>
    );
};
