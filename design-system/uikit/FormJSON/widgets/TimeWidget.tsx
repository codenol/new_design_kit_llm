/**
 * Компонент TimeWidget — кастомный виджет для ввода времени в формате HH:MM:SS.
 * Используется в рамках React JSON Schema Form, FormJSON в компонентах.
 *
 * @module TimeWidget
 */

import React, { useCallback } from 'react';
import InputMask from 'react-text-mask';
import classNames from 'classnames';
import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';

/**
 * Основной компонент виджета для ввода времени.
 *
 * @param rawErrors - ошибки валидации.
 * @param id - уникальный идентификатор поля.
 * @param value - текущее значение (строка в формате "HH:MM:SS").
 * @param placeholder - подсказка, отображаемая при пустом значении.
 * @param onChange - функция изменения значения.
 * @param required - обязательное ли поле.
 * @param onBlur - функция при потере фокуса.
 * @param onFocus - функция при получении фокуса.
 * @param disabled - заблокировано ли поле.
 * @param readonly - доступно ли только для чтения.
 * @param options - дополнительные параметры виджета (например, customStyle).
 * @param type - тип инпута (по умолчанию 'text').
 */
export function TimeWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const {
        rawErrors = [],
        id,
        value,
        placeholder,
        onChange,
        required,
        onBlur,
        onFocus,
        disabled,
        readonly,
        options,
        type,
        uiSchema,
    } = props as any;
    const { customStyle } = options; // Кастомные стили из options.
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге

    /**
     * Обработчик изменения значения.
     *
     * @param val - новое значение.
     */
    const handleChange = useCallback(
        (val: any) => {
            onChange(val || undefined);
        },
        [onChange]
    );

    /**
     * Обработчик события onBlur.
     * Вызывает onBlur и onChange.
     *
     * @param val - значение перед выходом.
     */
    const _onBlur = useCallback(
        (val) => {
            onBlur(id, val);
            onChange(val || undefined);
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
     * Проверяет, начинается ли значение с цифры 2.
     * Нужно для корректной маски первой цифры часа.
     */
    const startsWithTwo = value?.[0] === '2';

    /**
     * Проверяет, начинается ли значение с цифры больше 2.
     * Если да — первая цифра может быть только 0.
     */
    const startsWithGreaterThanTwo = value?.[0]?.match(/[3-9]/);

    /**
     * Проверяет, является ли третья цифра (минуты) больше 5.
     * Если да — вторая цифра минут может быть только 0.
     */
    const startsMinWithGreaterThanFive = value?.[3]?.match(/[6-9]/);

    /**
     * Маска ввода времени в формате HH:MM:SS.
     * Учитывает ограничения:
     * - часы от 00 до 23,
     * - минуты от 00 до 59,
     * - секунды всегда 00 (только для совместимости).
     */
    const mask = [
        startsWithGreaterThanTwo ? '0' : /[0-9]/, // Первая цифра часов: если >2 → только 0
        startsWithTwo ? /[0-3]/ : /[0-9]/, // Вторая цифра часов: если 2 → только 0-3
        ':', // Разделитель
        startsMinWithGreaterThanFive ? '0' : /[0-9]/, // Первая цифра минут: если >5 → только 0
        /[0-9]/, // Вторая цифра минут
        ':', // Разделитель
        '0', // Секунды — всегда 0
        '0', // Секунды — всегда 0
    ];

    return (
        <InputMask
            guide={false}
            mask={mask}
            showMask={true}
            placeholderChar={'\u2000'}
            className={classNames('p-inputtext p-component p-filled', {
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            name={id}
            style={{ width: '100%', ...customStyle }}
            id={id}
            disabled={disabled || readonly}
            type={type || 'text'}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={(event) => _onBlur(event.target.value)}
            onFocus={(event) => _onFocus(event.target.value)}
        />
    );
}
