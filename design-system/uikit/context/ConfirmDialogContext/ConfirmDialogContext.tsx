/**
 * Контекст для глобального управления модальными диалогами подтверждения.
 * Позволяет вызывать `confirmInfo` из любого компонента без пропсов.
 *
 * @module ConfirmDialogContext
 */
import { createContext } from 'react';

/**
 * Интерфейс, описывающий методы контекста диалога подтверждения.
 *
 * @interface IConfirmDialog
 */
export interface IConfirmDialog {
    /**
     * Открывает модальное окно подтверждения.
     */
    confirmInfo: (any) => void;

    /**
     * Закрывает текущий диалог подтверждения.
     */
    hide: () => void;
}
/**
 * Глобальный контекст для работы с диалогами подтверждения.
 * Предоставляет методы `confirmInfo` и `hide`.
 */
export const ConfirmDialogContext = createContext<IConfirmDialog>({
    confirmInfo: () => {
        console.log('no context');
    },
    hide: () => {
        console.log('no context');
    },
});
