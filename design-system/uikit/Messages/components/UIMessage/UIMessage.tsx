/**
 * Обертка над Message для управления временем жизни и автоудалением
 * Используется только в компоненте Messages
 *
 * @module UIMessage
 */
import React, { useEffect } from 'react';
import { Message, MessageProps } from '../../../Message';

/**
 * Пропсы для UIMessage
 */
export interface UIMessageProps extends MessageProps {
    /**
     * Время жизни сообщения в миллисекундах
     * @default 3000
     */
    life?: number;
    /**
     * Если true, сообщение не будет автоматически закрываться по таймеру
     * @default true
     */
    sticky?: boolean;
}

/**
 * Компонент-обертка над Message с управлением временем жизни
 *
 * @component
 * @param {UIMessageProps} props - пропсы компонента
 * @returns {JSX.Element} React-элемент
 */
export const UIMessage = (props: UIMessageProps) => {
    const { life = 3000, sticky = true, onReject, ...messageProps } = props;

    // Таймер автоудаления
    useEffect(() => {
        if (sticky || life <= 0) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            onReject?.();
        }, life);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [life, sticky, onReject]);

    return <Message {...messageProps} onReject={onReject} visible={true} />;
};
