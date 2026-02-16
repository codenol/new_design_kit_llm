/**
 * Компонент TextWidget — кастомный текстовый виджет.
 * Используется в рамках React JSON Schema Form, FormJSON в компонентах.
 * Поддерживает:
 * - обычный ввод текста,
 * - числовое поле (InputNumber),
 * - маскированный ввод (например, IP-адрес),
 * - установку уникальных значений,
 * - кастомные стили и параметры из uiSchema.
 *
 * @module TextWidget
 */

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { WidgetProps, getInputProps } from '@rjsf/utils';
import InputMask from 'react-text-mask';
import { InputNumber } from 'primereact/inputnumber';
/**
 * Основной компонент текстового поля.
 *
 * @param rawErrors - ошибки валидации.
 * @param id - уникальный идентификатор поля.
 * @param value - текущее значение поля.
 * @param placeholder - текст подсказки.
 * @param onChange - функция изменения значения.
 * @param required - обязательное ли поле.
 * @param onBlur - функция при потере фокуса.
 * @param onFocus - функция при получении фокуса.
 * @param uiSchema - UI-схема.
 * @param schema - JSON-схема.
 * @param disabled - заблокировано ли поле.
 * @param readonly - доступно ли только для чтения.
 * @param options - дополнительные параметры виджета.
 * @param formContext - контекст формы, например, флаг isAutocomplete.
 * @param autofocus - автоматическое получение фокуса.
 */
export const TextWidget = (props: WidgetProps) => {
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
    const { useGrouping = false } = uiOptions; // Флаг использования группировки чисел (например, 1 000).
    const setUnique = rest.registry.formContext.setDataValidationUnique; // Функция установки уникальных значений (из контекста формы).
    const uniqueGroupName: any = uiOptions?.uniqueItemPropertiesGroup; // Группа уникальности из uiSchema.
    const inputProps = {
        // Объединяем стандартные пропсы инпута с пользовательскими.
        ...rest,
        ...getInputProps(schema, schema.type, options),
    };
    const mask = uiOptions?.mask; // Маска из uiSchema (например, 'ip', массив или регулярное выражение).
    const testid = uiOptions?.testid; // Id для тестирования, устанавливается в атрибут data-testid.
    const isNumber = inputProps.type === 'number' || inputProps.type === 'integer'; // Проверяем, является ли поле числом.
    const IsAutocompleteReadonly = uiOptions?.autocomplete === 'readOnly' && formContext.isAutocomplete; // Проверяем, находится ли поле в режиме "только для автозаполнения".
    if (uniqueGroupName?.groupName) setUnique(id, value); // Устанавливаем уникальное значение, если указана группа уникальности.

    /**
     * Обработчик изменения значения.
     *
     * @param val - новое значение.
     */
    const _onChange = useCallback(
        (val) => {
            if (uniqueGroupName?.groupName) setUnique(id, val);

            onChange(val === '' ? options.emptyValue : val);
        },
        [onChange, options]
    );

    /**
     * Обработчик потери фокуса.
     *
     * @param val - значение перед выходом.
     */
    const _onBlur = useCallback(
        (val) => {
            if (uniqueGroupName?.groupName) setUnique(id, val);

            // Чистим формат числа перед отправкой
            if (isNumber && val !== '') {
                onBlur(id, Number(val.replace(/\s/g, '').replace(/,/g, '.')));
            } else {
                onBlur(id, val);
            }
        },
        [onBlur, id]
    );

    /**
     * Обработчик получения фокуса.
     *
     * @param val - текущее значение.
     */
    const _onFocus = useCallback((val) => onFocus(id, val), [onFocus, id]);

    /**
     * Подготавливаем значение для отображения в зависимости от типа.
     */
    let inputValue;

    if (isNumber) {
        inputValue = value || value === 0 ? value : null;
    } else {
        inputValue = value == null ? '' : value;
    }

    /**
     * Создаём маску для ввода IP-адреса.
     *
     * @param val - текущее значение.
     */
    const maskIP = (val) => Array(val.length).fill(/[\d.]/);

    /**
     * Валидация IP-адреса.
     *
     * @param val - строка ввода.
     */
    const pipeIP = (val) => {
        if (val.endsWith('..')) return false;
        const parts = val.split('.');
        if (parts.length > 4 || parts.some((part) => part === '00' || part < 0 || part > 255)) return false;
        return val;
    };

    /**
     * Конфигурация маски.
     */
    const maskProps: any = {};
    if (mask === 'ip') {
        maskProps.mask = maskIP;
        maskProps.pipe = pipeIP;
    } else if (mask) {
        maskProps.mask = mask;
    } else {
        maskProps.mask = false;
    }

    return (
        <>
            {' '}
            {/* Используем InputMask, если указана маска */}
            {mask ? (
                <InputMask
                    guide={false}
                    showMask={false}
                    placeholderChar={'\u2000'}
                    {...maskProps}
                    className={classNames('p-inputtext p-component p-filled', {
                        'p-invalid': rawErrors && rawErrors.length > 0,
                        'p-warning': warning,
                    })}
                    name={id}
                    style={{ width: '100%', ...customStyle }}
                    id={id}
                    disabled={disabled || readonly || IsAutocompleteReadonly}
                    type={inputProps.type || 'text'}
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={(event) => _onChange(event.target.value)}
                    onBlur={(event) => _onBlur(event.target.value)}
                    onFocus={(event) => _onFocus(event.target.value)}
                    data-testid={testid}
                ></InputMask>
            ) : isNumber ? (
                <InputNumber /* Используем InputNumber, если тип number или integer */
                    name={id}
                    inputClassName={classNames('p-inputtext p-component p-filled', {
                        'p-invalid': rawErrors && rawErrors.length > 0,
                        'p-warning': warning,
                    })}
                    disabled={disabled || readonly || IsAutocompleteReadonly}
                    style={{ width: '100%' }}
                    inputStyle={{ ...customStyle }}
                    id={id}
                    locale="ru-RU"
                    useGrouping={useGrouping}
                    autoFocus={autofocus}
                    placeholder={placeholder}
                    required={required}
                    onBlur={(e) => _onBlur(e.target.value)}
                    onChange={(e) => _onChange(e.value)}
                    onValueChange={(e) => (e.value === null ? _onChange('') : _onChange(e.value))}
                    minFractionDigits={(uiOptions?.minFraction as number) || 0}
                    maxFractionDigits={inputProps.type === 'integer' ? 0 : (uiOptions?.maxFraction as number) || 6}
                    max={inputProps.max} // оставила валидацию только для максимального значения
                    value={inputValue}
                    data-testid={testid}
                />
            ) : (
                <input /* Используем стандартный input в остальных случаях */
                    name={id}
                    type={inputProps.type}
                    disabled={disabled || readonly || IsAutocompleteReadonly}
                    style={{ width: '100%', ...customStyle }}
                    id={id}
                    autoFocus={autofocus}
                    // keyfilter={schema.type === 'number' ? 'num' : false as any}
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
                    data-testid={testid}
                />
            )}
        </>
    );
};
