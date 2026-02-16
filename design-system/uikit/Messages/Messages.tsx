/**
 * Обертка над Message из UIKIT для отображения списка сообщений
 *
 * @module Messages
 */
import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { CSSTransitionProps } from 'primereact/csstransition';
import classNames from 'classnames';
import { UIMessage } from './components/UIMessage';
import { MessageProps } from '../Message/Message';
import './messages.scss';

/**
 * Тип сообщения для локального состояния
 */
type TStateMessage = {
    _pId: number;
    message: MessageInfo;
};

/**
 * Тип информации о сообщении
 */
export type MessageInfo = Omit<MessageProps, 'visible'> & {
    /**
     * Если false, сообщение автоматически закроется по таймеру
     * @default true
     */
    sticky?: boolean;
    /**
     * Время жизни сообщения в миллисекундах
     * @default 3000
     */
    life?: number;
};

/**
 * Интерфейс компонента Messages через ref.
 */
export interface IMessages {
    /**
     * Показывает сообщение/сообщения
     */
    show: (messageInfo: MessageInfo | MessageInfo[]) => void;
    /**
     * Заменяет текущие сообщения новыми
     */
    replace: (messageInfo: MessageInfo | MessageInfo[]) => void;
    /**
     * Удаляет конкретное сообщение
     */
    remove: (id: string | number) => void;
    /**
     * Очищает все сообщения
     */
    clear: () => void;
    /**
     * Возвращает корневой DOM-элемент
     */
    getElement: () => HTMLDivElement | null;
}

/**
 * Пропсы для компонента Messages
 */
export interface MessagesProps {
    /**
     * Уникальный идентификатор компонента
     */
    id?: string;
    /**
     * CSS-класс компонента
     */
    className?: string;
    /**
     * Инлайн-стили компонента
     */
    style?: React.CSSProperties;
    /**
     * Обработчик клика по сообщению
     */
    onClick?: (message: MessageInfo) => void;
    /**
     * Обработчик удаления сообщения
     */
    onRemove?: () => void;
    /**
     * Дополнительные опции для анимации
     */
    transitionOptions?: CSSTransitionProps;
    /**
     * Идентификатор для тестирования
     */
    testid?: string;
}

let messageIdx = 0;

/**
 * Компонент для отображения множества сообщений
 * Аналогичен Messages из PrimeReact, но использует Message компонент из UIKIT
 *
 * @component
 * @param {MessagesProps} props - пропсы компонента
 * @param {React.Ref<IMessages>} ref - ref для доступа к публичному API
 * @returns {JSX.Element} React-элемент
 */
export const Messages = memo(
    forwardRef<IMessages, MessagesProps>((props, ref) => {
        const { id, className, style, onClick, onRemove, transitionOptions, testid } = props;

        const [messages, setMessages] = useState<TStateMessage[]>([]);
        const elementRef = useRef<HTMLDivElement>(null);
        const nodeRefs = useRef<Record<string, React.RefObject<HTMLElement>>>({});

        // Присваивает идентификаторы сообщениям и формирует новый массив
        const assignIdentifiers = useCallback(
            (
                currentState: TStateMessage[],
                messageInfo: MessageInfo | MessageInfo[],
                copy: boolean
            ): TStateMessage[] => {
                let messages: TStateMessage[];

                if (Array.isArray(messageInfo)) {
                    const multipleMessages = messageInfo.reduce<TStateMessage[]>((acc, message) => {
                        acc.push({ _pId: messageIdx++, message });
                        return acc;
                    }, []);

                    if (copy) {
                        messages = currentState ? [...currentState, ...multipleMessages] : multipleMessages;
                    } else {
                        messages = multipleMessages;
                    }
                } else {
                    const message = { _pId: messageIdx++, message: messageInfo };

                    if (copy) {
                        messages = currentState ? [...currentState, message] : [message];
                    } else {
                        messages = [message];
                    }
                }

                return messages;
            },
            []
        );

        /**
         * Показывает сообщение/сообщения (добавляет к существующим)
         */
        const show = useCallback(
            (messageInfo: MessageInfo | MessageInfo[]) => {
                if (messageInfo) {
                    setMessages((prev) => assignIdentifiers(prev, messageInfo, true));
                }
            },
            [assignIdentifiers]
        );

        /**
         * Заменяет текущие сообщения новыми
         */
        const replace = useCallback(
            (messageInfo: MessageInfo | MessageInfo[]) => {
                setMessages((prev) => assignIdentifiers(prev, messageInfo, false));
            },
            [assignIdentifiers]
        );

        /**
         * Удаляет конкретное сообщение
         */
        const remove = useCallback(
            (id: number | string) => {
                setMessages((prev) => prev.filter((msg) => msg.message.id !== id));

                onRemove?.();
            },
            [onRemove]
        );

        /**
         * Очищает все сообщения
         */
        const clear = useCallback(() => {
            setMessages([]);
        }, []);

        /**
         * Предоставляет публичный API через ref
         */
        useImperativeHandle(ref, () => ({
            show,
            replace,
            remove,
            clear,
            getElement: () => elementRef.current,
        }));

        // Удаляем сообщение из списка при событии onReject
        const onReject = useCallback((messageInfo: TStateMessage) => {
            messageInfo.message.onReject?.();
            setMessages((prev) => prev.filter((msg) => msg._pId !== messageInfo._pId));
        }, []);

        const getNodeRef = (id: number) => {
            if (!nodeRefs.current[id]) {
                nodeRefs.current[id] = React.createRef<HTMLElement>();
            }
            return nodeRefs.current[id];
        }

        return (
            <div
                ref={elementRef}
                id={id}
                className={classNames('p-messages', className)}
                style={style}
                data-testid={testid}
            >
                <TransitionGroup>
                    {messages.map((message) => {
                        const nodeRef = getNodeRef(message._pId)
                        return <CSSTransition
                            unmountOnExit
                            timeout={{ enter: 300, exit: 300 }}
                            options={transitionOptions}
                            classNames="p-message"
                            key={message._pId}
                            nodeRef={nodeRef}
                        >
                            <UIMessage
                                {...message.message}
                                onReject={() => onReject(message)}
                                onClick={() => onClick?.(message.message)}
                            />
                        </CSSTransition>
                    })}
                </TransitionGroup>
            </div>
        );
    })
);

Messages.displayName = 'Messages';
