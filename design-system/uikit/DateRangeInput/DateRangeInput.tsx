import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar, CalendarProps } from 'primereact/calendar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { format } from 'date-fns';
import classNames from 'classnames';

import './dateRangeInput.scss';

export type TQuickInterval = {
    /**
     * Айдишник интервала
     */
    id: string | number;
    /**
     * Лейбл, выводимый в списке интервалов
     */
    label: string;
} & Record<string, any>;

type TDateRangeInputProps = {
    /**
     * Значение инпута
     */
    value: (Date | null | undefined)[];
    /**
     * Колбэк, вызываемый при нажатии на кнопку "Применить"
     */
    onSubmit?: (value: (Date | null | undefined)[]) => void;
    /**
     * Колбэк, вызываемый при нажатии на кнопку "Очистить"
     */
    onClear?: () => void;
    /**
     * Текст кнопки применения интервала
     * @default Применить
     */
    submitLabel?: string;
    /**
     * Текст кнопки очистки интервала
     * @default Очистить
     */
    clearLabel?: string;
    /**
     * Список "быстрых" интервалов
     */
    quickIntervals?: TQuickInterval[];
    /**
     * Колбэк, вызываемый при нажатии на интервал
     */
    onQuickIntervalClick?: (interval: TQuickInterval) => void;
    /**
     * Активный интервал
     */
    activeQuickInterval?: TQuickInterval;
    /**
     * Текст, выводимый в случае отсутствия значения инпута
     */
    placeholder?: string;
    /**
     * Максимальная дата, доступная для выбора
     */
    maxDate?: Date;
    /**
     * Пропсы для инпута начала и конца интервала
     */
    calendarProps?: CalendarProps;
    /**
     * Класс, применяемый к контейнеру span
     */
    className?: string;
    /**
     * Стили, применяемые к контейнеру span
     */
    style?: React.CSSProperties;
    /**
     * Класс, применяемый к всплывающей панели
     */
    panelClassName?: string;
    /**
     * Стили, применяемые к всплывающей панели
     */
    panelStyle?: React.CSSProperties;
};

/**
 * Кастомный инпут с выбором даты начала и конца интервала.
 * Поддерживает использование "быстрых" интервалов.
 */
export const DateRangeInput = ({
    value,
    onSubmit,
    onClear,
    submitLabel = 'Применить',
    clearLabel = 'Очистить',
    quickIntervals,
    onQuickIntervalClick,
    activeQuickInterval,
    placeholder,
    maxDate,
    calendarProps,
    className,
    style,
    panelClassName,
    panelStyle,
}: TDateRangeInputProps) => {
    const panelRef = useRef<OverlayPanel>(null);

    const [startLocal, setStartLocal] = useState<Date | null | undefined>(value[0]);
    const [endLocal, setEndLocal] = useState<Date | null | undefined>(value[1]);

    // Текст в основном инпуте
    const inputValue = useMemo(() => {
        if (activeQuickInterval) {
            return activeQuickInterval.label;
        }

        let valueString = '';

        if (value[0]) {
            valueString += `с ${format(value[0], 'dd.MM.yyyy')}`;
        }

        if (value[1]) {
            valueString += ` по ${format(value[1], 'dd.MM.yyyy HH:mm')}`;
        }

        return valueString || placeholder;
    }, [value, activeQuickInterval, placeholder]);

    useEffect(() => {
        setStartLocal(value[0]);
        setEndLocal(value[1]);
    }, [value]);

    const handleSubmit = () => {
        onSubmit?.([startLocal, endLocal]);
        panelRef.current?.hide();
    };

    const handleClear = () => {
        onClear?.();
        panelRef.current?.hide();
    };

    const handleQuickIntervalClick = (interval: TQuickInterval) => {
        onQuickIntervalClick?.(interval);
        panelRef.current?.hide();
    };

    return (
        <>
            <span
                className={classNames(
                    'p-calendar p-component p-inputwrapper p-calendar-w-btn p-calendar-w-btn-right date-range-input',
                    className
                )}
                style={style}
            >
                <input
                    readOnly
                    value={inputValue ?? ''}
                    onClick={(e) => panelRef.current?.toggle(e)}
                    className="p-inputtext p-component"
                    type="text"
                />
                <Button
                    onClick={(e) => panelRef.current?.toggle(e)}
                    icon="pi pi-calendar"
                    className="p-datepicker-trigger"
                />
            </span>
            <OverlayPanel
                ref={panelRef}
                className={classNames('p-column-filter-overlay p-column-filter-overlay-menu p-fluid', panelClassName)}
                style={panelStyle}
            >
                <div className="date-range-input__panel-content">
                    <div className="date-range-input__panel-inputs">
                        <div>
                            <Calendar
                                locale="ru"
                                panelStyle={{ maxWidth: 288 }}
                                dateFormat="yy-mm-dd"
                                mask="9999-99-99 99:99"
                                placeholder="Начало"
                                value={startLocal}
                                showTime
                                hourFormat="24"
                                onChange={(event) => {
                                    if (event.value instanceof Date) {
                                        setStartLocal(event.value);
                                    }
                                }}
                                showIcon
                                selectionMode="single"
                                maxDate={endLocal || maxDate}
                                className="mb-3"
                                {...calendarProps}
                            />
                            <Calendar
                                locale="ru"
                                panelStyle={{ maxWidth: 288 }}
                                dateFormat="yy-mm-dd"
                                mask="9999-99-99 99:99"
                                placeholder="Окончание"
                                value={endLocal}
                                showTime
                                hourFormat="24"
                                onChange={(event) => {
                                    if (event.value instanceof Date) {
                                        setEndLocal(event.value);
                                    }
                                }}
                                showIcon
                                selectionMode="single"
                                minDate={startLocal ?? undefined}
                                maxDate={maxDate}
                                {...calendarProps}
                            />
                        </div>
                        <div className="p-column-filter-buttonbar">
                            <Button label={clearLabel} outlined size="small" onClick={handleClear} />
                            <Button
                                label={submitLabel}
                                size="small"
                                onClick={handleSubmit}
                                disabled={!startLocal || !endLocal}
                            />
                        </div>
                    </div>
                    {quickIntervals && quickIntervals?.length > 0 && (
                        <ul className="date-range-input__quick-intervals">
                            {quickIntervals.map((interval) => (
                                <li
                                    onClick={() => handleQuickIntervalClick(interval)}
                                    key={interval.id}
                                    className={classNames(
                                        'date-range-input__quick-interval',
                                        activeQuickInterval?.id === interval.id &&
                                            'date-range-input__quick-interval_active'
                                    )}
                                >
                                    {interval.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </OverlayPanel>
        </>
    );
};
