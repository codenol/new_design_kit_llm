/**
 * Расширенная обертка над Message из Primereact
 *
 * @module Message
 */
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Message as MessageBase, MessageProps as MessageBaseProps } from 'primereact/message';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import omit from 'lodash/omit';

import { IconAcceptCircle, IconCloseCircle, IconInfoCircle, IconWarningCircle } from '../IconsComponent';
import './message.scss';

/**
 * Интерфейс компонента Message через ref.
 */
export interface IMessage extends Pick<MessageBase, 'getElement'> {
    /**
     * Вызывает обработчик подтверждения (onAccept).
     */
    accept: () => void;
    /**
     * Вызывает обработчик отклонения (onReject).
     */
    reject: () => void;

    /**
     * Возвращает текущее состояние видимости дополнительного контента.
     * @returns {boolean} true, если контент открыт, иначе - false.
     */
    getIsContentOpen: () => boolean;

    /**
     * Переключает видимость дополнительного контента.
     * @returns {boolean} true, если надо раскрыть контент, иначе - false.
     */
    toggleContent: () => boolean;

    /**
     * Устанавливает видимость всего сообщения.
     * @param {boolean} visibleState - true, если надо отобразить все сообщение, иначе - false.
     */
    setVisibility: (visibleState: boolean) => void;
}

/**
 * Расширенные пропсы для компонента Message.
 */ export interface MessageProps extends Omit<MessageBaseProps, 'icon' | 'text'> {
    /**
     * Основной текст сообщения. Может быть строкой, React-элементом или функцией, возвращающей React-элемент.
     */
    text?: string | React.ReactNode | ((props: MessageProps) => React.ReactNode);

    /**
     * Иконка сообщения.
     */
    icon?: React.ReactNode | ((props: MessageProps) => React.ReactNode);

    /**
     * Управляет видимостью сообщения.
     */
    visible?: boolean;

    /**
     * Дополнительный контент, который можно показать/скрыть.
     */
    toggledContent?: string | React.ReactNode | ((props: MessageProps) => React.ReactNode);

    /**
     * Заголовок сообщения.
     */
    label?: string;

    /**
     * Показывать ли стандартную метку ("Уведомление", "Ошибка" и т.д.), если label не задан.
     * По умолчанию true.
     */
    isDefaultLabelVisible?: boolean;

    /**
     * Можно ли закрыть сообщение. По умолчанию false.
     */
    closable?: boolean;

    /**
     * Обработчик события подтверждения.
     */
    onAccept?: () => void;

    /**
     * Обработчик события отклонения.
     */
    onReject?: () => void;

    /**
     * Показывать ли кнопку подтверждения. По умолчанию false.
     */
    acceptBtn?: boolean;

    /**
     * Текст на кнопке подтверждения. По умолчанию "Подтвердить".
     */
    acceptBtnLabel?: string;

    /**
     * Показывать ли кнопку отклонения. По умолчанию false.
     */
    rejectBtn?: boolean;

    /**
     * Текст на кнопке отклонения. По умолчанию "Отменить".
     */
    rejectBtnLabel?: string;

    /**
     * Текст на кнопке открытия дополнительного контента. По умолчанию "Подробнее".
     */
    openBtnLabel?: string;

    /**
     * Текст на кнопке закрытия дополнительного контента. По умолчанию "Свернуть".
     */
    closeBtnLabel?: string;
}

/**
 * Компонент сообщения с расширенной функциональностью.
 * Оборачивает PrimeReact Message, добавляя поддержку:
 * - кастомных иконок и текста
 * - кнопок действия (подтвердить/отменить)
 * - переключаемого контента
 * - управления видимостью через ref
 *
 * @component
 * @param {MessageProps} props - пропсы компонента
 * @param {React.Ref<IMessage>} ref - ref для доступа к публичному API
 * @returns {JSX.Element} React-элемент
 */
// eslint-disable-next-line react/display-name
export const Message = memo(
    forwardRef<IMessage, MessageProps>((props, ref) => {
        const {
            visible = true,
            isDefaultLabelVisible = true,
            toggledContent,
            label,
            title,
            content,
            icon,
            severity = 'info',
            text,
            closable = false,
            className,
            onAccept,
            onReject,
            acceptBtnLabel,
            acceptBtn,
            rejectBtnLabel,
            rejectBtn,
            openBtnLabel,
            closeBtnLabel,
        } = props;

        /**
         * Ref на внутренний компонент PrimeReact Message.
         */
        const messageComponentRef = useRef<MessageBase>(null!);

        /**
         * Состояние видимости сообщения.
         */
        const [isVisible, setIsVisible] = useState(true);

        /**
         * Состояние видимости дополнительного контента.
         */
        const [isContentOpen, setIsContentOpen] = useState(false);

        /**
         * Предоставляет публичный API через ref.
         */
        useImperativeHandle(ref, () => ({
            /**
             * Возвращает DOM-элемент сообщения.
             * @returns {HTMLElement} DOM-элемент
             */
            getElement() {
                return messageComponentRef.current.getElement();
            },

            /**
             * Устанавливает видимость сообщения.
             * @param {boolean} visibleState - новое состояние видимости
             */
            setVisibility(visibleState) {
                setIsVisible(visibleState);
            },

            /**
             * Возвращает состояние видимости дополнительного контента.
             * @returns {boolean} true, если контент открыт, иначе - false.
             */
            getIsContentOpen() {
                return isContentOpen;
            },

            /**
             * Вызывает обработчик подтверждения.
             */
            accept() {
                onAcceptHandler();
            },

            /**
             * Вызывает обработчик отклонения.
             */
            reject() {
                onRejectHandler();
            },

            /**
             * Переключает видимость дополнительного контента.
             * @returns {boolean} новое состояние видимости
             */
            toggleContent() {
                onToggleHandler();
                return !isContentOpen;
            },
        }));

        /**
         * Синхронизирует внутреннее состояние видимости с пропсом visible.
         */
        useEffect(() => {
            setIsVisible(visible);
        }, [visible]);

        /**
         * Возвращает стандартную метку в зависимости от severity.
         * @returns {string} стандартная метка
         */
        const MessageDefaultLabel = useCallback(() => {
            switch (severity) {
                case 'info': {
                    return 'Уведомление';
                }
                case 'success': {
                    return 'Успешно';
                }
                case 'warn': {
                    return 'Внимание';
                }
                case 'error': {
                    return 'Ошибка';
                }
                default:
                    return '';
            }
        }, [severity]);

        /**
         * Вычисляет заголовок сообщения на основе пропсов.
         * Приоритет: title > label (если нет content) > стандартная метка.
         */
        const messageTitle = useMemo(() => {
            if (title) return title;
            if (label && !content) return label;
            if (!label && !content) return MessageDefaultLabel();
            return '';
        }, [MessageDefaultLabel, content, label, title]);

        /**
         * Обработчик нажатия кнопки подтверждения.
         */
        const onAcceptHandler = () => {
            if (onAccept) onAccept();
        };

        /**
         * Обработчик нажатия кнопки отклонения.
         */
        const onRejectHandler = () => {
            if (onReject) onReject();
        };

        /**
         * Обработчик переключения видимости дополнительного контента.
         */
        const onToggleHandler = () => {
            setIsContentOpen((currentState) => !currentState);
        };

        /**
         * Рендерит стандартную иконку в зависимости от severity.
         * @returns {JSX.Element} React-элемент иконки
         */
        const MessageDefaultIcon = () => (
            <div className="p-icon p-inline-message-icon">
                {/* TODO: Поменять хэш-цвета на токены */}
                {severity === 'info' && <IconInfoCircle color="#073C64" />}
                {severity === 'success' && <IconAcceptCircle color="#18441D" />}
                {severity === 'warn' && <IconWarningCircle color="#955E02" />}
                {severity === 'error' && <IconCloseCircle color="#881415" />}
            </div>
        );

        /**
         * Рендерит кнопку закрытия сообщения.
         * @returns {JSX.Element} React-элемент кнопки закрытия
         */
        const MessageCloseBtn = () => (
            <Button className="p-inline-message-close p-button-link p-link" onClick={onRejectHandler}>
                <i className="pi pi-times" />
            </Button>
        );

        /**
         * Рендерит блок кнопок действия (подтвердить, отменить, подробнее/свернуть).
         * @returns {JSX.Element} React-элемент блока кнопок
         */
        const MessageBtnsBlock = () => (
            <div className="p-inline-message-btns-block">
                {acceptBtn && (
                    <Button className="p-inline-message-accept-btn" onClick={onAcceptHandler}>
                        {acceptBtnLabel || 'Подтвердить'}
                    </Button>
                )}
                {rejectBtn && (
                    <Button
                        className="p-inline-message-reject-btn p-button-outlined"
                        onClick={onRejectHandler}
                        outlined
                    >
                        {rejectBtnLabel || 'Отменить'}
                    </Button>
                )}
                {toggledContent && (
                    <Button className={'p-inline-message-toggle-btn'} onClick={onToggleHandler}>
                        {!isContentOpen ? openBtnLabel || 'Подробнее' : closeBtnLabel || 'Свернуть'}
                    </Button>
                )}
            </div>
        );

        /**
         * Рендерит иконку сообщения (кастомную или стандартную).
         * @returns {React.ReactNode} React-элемент иконки
         */
        const MessageIcon = (): React.ReactNode => (typeof icon === 'function' ? icon(props) : icon);

        /**
         * Рендерит основной текст сообщения.
         * @returns {React.ReactNode} React-элемент текста
         */
        const MessageText = (): React.ReactNode => (typeof text === 'function' ? text(props) : text);

        /**
         * Рендерит дополнительный контент (если он функция - вызывает её).
         * @returns {React.ReactNode} React-элемент дополнительного контента
         */
        const MessageToggledContent = (): React.ReactNode =>
            typeof toggledContent === 'function' ? toggledContent(props) : toggledContent;

        /**
         * Рендерит тело сообщения (метка, основной текст, дополнительный контент, кнопки).
         * @returns {JSX.Element} React-элемент тела сообщения
         */
        const MessageBody = () => (
            <div className="p-inline-message-body">
                <div className="p-inline-message-text">
                    {(label || isDefaultLabelVisible) && (
                        <div className="p-inline-message-text-label">{label || <MessageDefaultLabel />}</div>
                    )}
                    <MessageText />
                </div>
                {toggledContent && isContentOpen && (
                    <div className="p-inline-message-toggled-content">
                        <MessageToggledContent />
                    </div>
                )}
                {(acceptBtn || rejectBtn || toggledContent) && <MessageBtnsBlock />}
            </div>
        );

        /**
         * Рендерит содержимое сообщения (иконка, тело, кнопка закрытия).
         * @returns {JSX.Element} React-элемент содержимого сообщения
         */
        const MessageContent: MessageProps['content'] = () => (
            <div className="p-inline-message-content">
                {icon ? <MessageIcon /> : <MessageDefaultIcon />}
                <MessageBody />
                {closable && <MessageCloseBtn />}
            </div>
        );

        return (
            <>
                {isVisible && (
                    <MessageBase
                        ref={messageComponentRef}
                        className={classNames(`p-inline-message-${severity}`, className)}
                        content={!content && MessageContent}
                        title={messageTitle}
                        {...omit(props, [
                            'text',
                            'icon',
                            'visible',
                            'toggledContent',
                            'label',
                            'isDefaultLabelVisible',
                            'closable',
                            'onAccept',
                            'onReject',
                            'acceptBtnLabel',
                            'acceptBtn',
                            'rejectBtnLabel',
                            'rejectBtn',
                            'openBtnLabel',
                            'closeBtnLabel',
                        ])}
                    />
                )}
            </>
        );
    })
);
