/**
 * Провайдер контекста для модальных диалогов подтверждения.
 * Обертка над `primereact/confirmdialog`, обеспечивающая глобальный доступ к диалогам.
 *
 * @module ConfirmDialogProvider
 */
import React from 'react';
import classNames from 'classnames';

import { confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { ConfirmDialogContext } from './ConfirmDialogContext';

/**
 * Провайдер контекста диалога подтверждения.
 * Реализует централизованное управление модальными окнами.
 *
 * @component
 * @param {React.PropsWithChildren} props - параметры компонента.
 */
export const ConfirmDialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    /**
     * Ссылка на функцию закрытия диалога.
     * Сохраняется, чтобы можно было вызвать `hide()` извне.
     */
    let hideCb;

    /**
     * Открывает диалог подтверждения с кастомной конфигурацией.
     *
     * @param message - содержимое диалога.
     * @param acceptCb - обработчик подтверждения.
     * @param acceptLabel - текст кнопки "Подтвердить".
     * @param acceptAutoFocus - автофокус на кнопку подтверждения.
     * @param actionClass - класс действия ('alert' → красная кнопка).
     * @param rejectCb - обработчик отмены.
     * @param header - заголовок диалога.
     * @param style - стили контейнера.
     * @param contentStyle - стили контента.
     * @param footer - кастомный футер.
     * @param setCallback - передаёт функцию `reject` внешнему коду.
     * @param hideFooter - скрыть футер полностью.
     * @param draggable - флаг для управления возможностью перетаскивать диалоговое окно.
     */
    const confirmInfo = ({
        message,
        acceptCb,
        acceptLabel,
        acceptAutoFocus,
        actionClass,
        rejectCb,
        header,
        style,
        contentStyle,
        footer,
        setCallback,
        hideFooter = false,
        draggable = true,
    }) => {
        const { hide } = confirmDialog({
            message,
            style,
            contentStyle,
            accept: acceptCb,
            reject: rejectCb,
            acceptLabel,
            rejectLabel: 'Отменить',
            acceptClassName: actionClass === 'alert' ? 'p-button-danger' : '',
            rejectClassName: 'p-button-outlined',
            header: header || 'Подтвердите',
            focusOnShow: false,
            draggable,
            /**
             * Кастомный футер диалога.
             * Может содержать:
             * - кнопку "Отменить"
             * - кастомный контент (footer)
             * - кнопку "Подтвердить", если не передан footer
             */
            footer: ({ reject }) => {
                if (setCallback) {
                    setCallback(reject);
                }
                if (hideFooter) return null;
                return (
                    <>
                        <Button className="p-button-outlined" label="Отменить" onClick={reject} />
                        <span>{footer}</span>
                        {!footer && acceptLabel && (
                            <Button
                                label={acceptLabel}
                                className={classNames({
                                    'p-button-danger': actionClass === 'alert',
                                })}
                                onClick={() => acceptCb(reject)}
                                autoFocus={acceptAutoFocus}
                            />
                        )}
                    </>
                );
            },
        });
        // Сохраняем функцию закрытия
        hideCb = hide;
    };

    /**
     * Функция для закрытия текущего диалога.
     */
    const hideDialog = () => {
        hideCb();
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirmInfo, hide: hideDialog }}>
            {children}
        </ConfirmDialogContext.Provider>
    );
};
