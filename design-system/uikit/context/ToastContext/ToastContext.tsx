/**
 * Контекст для глобального управления всплывающими уведомлениями.
 * Позволяет вызывать `showToast` из любого компонента без пропсов.
 *
 * @module ToastContext
 */
import { createContext } from 'react';
import { ToastMessage } from 'primereact/toast';

/**
 * Расширенный интерфейс сообщения уведомления с уникальным идентификатором.
 *
 * @interface IToastReducer
 * @extends {ToastMessage} - базовые свойства из PrimeReact (severity, summary, detail, life и т.д.)
 */
export interface IToastReducer extends ToastMessage {
    /**
     * Уникальный идентификатор уведомления.
     */
    id: string;
}

export type IToast = {
    /**
     * Показывает уведомление.
     *
     * @param obj - объект с параметрами уведомления (summary, detail, severity и т.д.)
     */
    showToast: (obj: ToastMessage) => void;
    /**
     * Список активных уведомлений.
     */
    toasts: IToastReducer;
    /**
     * Удаляет уведомление по ID.
     *
     * @param obj - объект уведомления с полем `id`
     */
    onRemoveToastById: (obj: IToastReducer) => void;
    /**
     * Очищает все уведомления.
     */
    clearAllToasts: () => void;
};

/**
 * Глобальный контекст для работы с уведомлениями.
 */
export const ToastContext = createContext<IToast>({
    showToast: () => console.log('no context'),
    toasts: { id: 'no context' },
    onRemoveToastById: () => console.log('no context'),
    clearAllToasts: () => console.log('no context'),
});
