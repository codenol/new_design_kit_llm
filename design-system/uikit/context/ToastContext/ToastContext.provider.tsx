/**
 * Кастомные уведомления на основе PrimeReact
 *
 * @module ToastProvider
 */
import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ToastContext } from './ToastContext';

/**
 * Стандартные параметры уведомления.
 * Будут применены, если не переопределены при вызове `showToast`.
 */
const defaultDataToast = {
    severity: 'info', // тип: info, success, warn, error
    life: 3000, // время жизни в миллисекундах
    sticky: false, // автоматически скрыть по истечении времени
};
/**
 * Провайдер контекста уведомлений.
 * Обеспечивает централизованное управление toast-сообщениями.
 *
 * @component
 * @param {React.ReactNode} children - дочерние компоненты, которым доступен контекст.
 */
export const ToastProvider: React.FC<any> = ({ children }) => {
    // Ссылка на компонент Toast из PrimeReact
    const toastRef = useRef<any>(null);
    // Локальное состояние для хранения списка активных уведомлений
    const [toasts, setToasts] = useState<any>([]);

    /**
     * Показывает уведомление.
     *
     * @param {ToastMessage} data - параметры уведомления
     */
    const showToast = (data: any) => {
        const getId = data.id || Date.now();
        toastRef.current.show({ ...defaultDataToast, ...data, id: getId });
        if (!toasts.find((item: any) => item.id === getId)) {
            setToasts((prevData: any) => [...prevData, { ...defaultDataToast, ...data, id: getId }]);
        } else {
            setToasts((prevData: any) => [
                ...prevData.map((item: any) => (item.id === getId ? { ...item, life: data.life } : item)),
            ]);
        }
    };

    /**
     * Очищает все уведомления.
     */
    const clearAllToasts = () => {
        toastRef.current.clear();
        setToasts([]);
    };

    /**
     * Удаляет уведомление по ID.
     *
     * @param {any} id - идентификатор уведомления.
     */
    const onRemoveToastById = (id: any) => {
        if (toasts.filter((item: any) => item.id === id).length > 0) {
            setToasts((prevData: any) => {
                const editData = [...prevData.filter((item: any) => item.id !== id)];
                if (prevData.length !== editData.length) toastRef.current.replace(editData);
                return editData;
            });
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, toasts, clearAllToasts, onRemoveToastById }}>
            <Toast ref={toastRef} onRemove={(toast: any) => toast?.id && onRemoveToastById(toast.id)} />
            {children}
        </ToastContext.Provider>
    );
};
