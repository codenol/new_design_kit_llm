import React, { useState } from 'react';
import classNames from 'classnames';
import { WidgetProps } from '@rjsf/utils';
import { Calendar } from 'primereact/calendar';
import { isAfter, isBefore } from 'date-fns';
import { getValueObjectByArray } from '../../FormJSON';

export const DateTimeWidget = (props: WidgetProps) => {
    const {
        id,
        value,
        disabled,
        options,
        readonly,
        onChange,
        onBlur,
        onFocus,
        required,
        placeholder,
        rawErrors,
        uiSchema,
        formContext: { formRef },
    } = props;
    const warning = uiSchema?.['ui:warning']; // Аутлайн при ворнинге
    const showSeconds = uiSchema?.['show-seconds']; // Определяет показывать ли секунды в выборе времени
    const showMilliseconds = uiSchema?.['show-milliseconds']; // Определяет показывать ли миллисекунды в выборе времени
    const [maxDate, setMaxDate] = useState(undefined);
    const [minDate, setMinDate] = useState(undefined);

    const getDate = (path) => {
        if (!path) return false;
        const isPath = (pathStr) => {
            if (typeof pathStr === 'string' && pathStr.match(/.*?\{([^)]*)\}.*/)) {
                return pathStr.match(/.*?\{([^)]*)\}.*/);
            }
            return false;
        };

        const formData = formRef.current?.state?.formData;

        const convertDate = (data: string | number | Date) => {
            let result;
            if (data === 'now') {
                result = new Date();
            }
            if (isPath(data) && getValueObjectByArray(formData, isPath(data)?.[1].split('.'))) {
                result = getValueObjectByArray(formData, isPath(data)?.[1].split('.'));
            }

            return result ? new Date(result) : false;
        };

        const Recursion = (data, i = 0) => {
            let result;

            if (!Array.isArray(data)) {
                result = convertDate(data);
            }

            if (convertDate(data[i])) {
                result = convertDate(data[i]);
            }

            if (result) return result;
            if (data.length > i + 1) return Recursion(data, i + 1);
            return false;
        };

        return Recursion(path);
    };

    const getMinDate = () => {
        const min = uiSchema?.['min-date'];
        const minRange = uiSchema?.['min-range'];

        return minRange ? new Date(+getDate(min) + minRange) : getDate(min);
    };

    const getMaxDate = () => {
        const max = uiSchema?.['max-date'];
        const maxRange = uiSchema?.['max-range'];

        return maxRange ? new Date(+getDate(max) - maxRange) : getDate(max);
    };

    const getDateMask = () => {
        if (showMilliseconds) {
            return '99.99.9999 99:99:99.999';
        }

        if (showSeconds) {
            return '99.99.9999 99:99:99';
        }

        return '99.99.9999 99:99';
    };

    const setMaxMin = () => {
        setMaxDate(getMaxDate());
        setMinDate(getMinDate());
    };

    const _onChange = (val) => {
        const min = getMinDate();
        const max = getMaxDate();

        if (val && min && isBefore(val, min)) {
            return;
        }
        if (val && max && isAfter(val, max)) {
            return;
        }
        onChange(val === '' ? options.emptyValue : val.toISOString());
    };

    const _onBlur = (val) => {
        onBlur(id, val === '' || val === undefined ? options.emptyValue : val.toISOString());
    };

    const _onFocus = (val) => {
        onFocus(id, val === '' || val === undefined ? options.emptyValue : val.toISOString());
    };

    return (
        <Calendar
            locale={'ru'}
            panelStyle={{ maxWidth: 288 }}
            dateFormat={'dd.mm.yy'}
            inputClassName={classNames({
                'p-invalid': rawErrors && rawErrors.length > 0,
                'p-warning': warning,
            })}
            mask={getDateMask()}
            // maskSlotChar={'ДД.ММ.ГГГГ ЧЧ:ММ'}
            name={id}
            style={{ width: '100%' }}
            inputId={id}
            maxDate={maxDate}
            minDate={minDate}
            disabled={disabled || readonly}
            placeholder={placeholder}
            required={required}
            value={value ? new Date(value) : null}
            onShow={setMaxMin}
            showTime
            showSeconds={showSeconds || showMilliseconds}
            showMillisec={showMilliseconds}
            hourFormat="24"
            onChange={(event) => _onChange(event.value)}
            onBlur={(event) => _onBlur(event.target.value)}
            onFocus={(event) => _onFocus(event.target.value)}
            showIcon
            selectionMode="single"
        />
    );
};
