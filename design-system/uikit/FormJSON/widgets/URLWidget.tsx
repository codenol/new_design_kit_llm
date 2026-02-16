import React, { useCallback } from 'react';
import { getInputProps, WidgetProps } from '@rjsf/utils';
import classNames from 'classnames';

export const URLWidget = (props: WidgetProps) => {
    const {
        rawErrors = [],
        id,
        value,
        placeholder,
        onChange,
        required,
        onBlur,
        onFocus,
        uiSchema,
        schema,
        disabled,
        readonly,
        options,
        formContext,
        autofocus,
        ...rest
    } = props as any;

    const { 'ui:options': uiOptions = {} } = uiSchema; // Получаем ui:options из uiSchema. Если не заданы — используем пустой объект.
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге
    const { customStyle } = options; // Кастомные стили из options.
    const inputProps = {
        // Объединяем стандартные пропсы инпута с пользовательскими.
        ...rest,
        ...getInputProps(schema, schema.type, options),
    };
    const IsAutocompleteReadonly = uiOptions?.autocomplete === 'readOnly' && formContext.isAutocomplete; // Проверяем, находится ли поле в режиме "только для автозаполнения".

    /**
     * Обработчик изменения значения.
     *
     * @param val - новое значение.
     */
    const _onChange = useCallback((val) => onChange(val === '' ? options.emptyValue : val), [onChange, options]);

    /**
     * Обработчик потери фокуса.
     *
     * @param val - значение перед выходом.
     */
    const _onBlur = useCallback((val) => onBlur(id, val), [onBlur, id]);

    const inputValue = value == null ? '' : value;

    /**
     * Обработчик получения фокуса.
     *
     * @param val - текущее значение.
     */
    const _onFocus = useCallback((val) => onFocus(id, val), [onFocus, id]);

    return (
        <input
            name={id}
            type={inputProps.type}
            disabled={disabled || readonly || IsAutocompleteReadonly}
            style={{ width: '100%', ...customStyle }}
            id={id}
            autoFocus={autofocus}
            placeholder={placeholder}
            required={required}
            onChange={(event) => _onChange(event.target.value)}
            onBlur={(event) => _onBlur(event.target.value)}
            onFocus={(event) => _onFocus(event.target.value)}
            className={classNames('p-inputtext p-component p-filled', {
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            value={inputValue}
        />
    );
};
