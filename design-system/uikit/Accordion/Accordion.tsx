/**
 * Кастомный аккордеон с анимацией открытия/закрытия.
 * Поддерживает заголовок, иконку сворачивания и динамическое содержимое.
 *
 * @module Accordion
 */
import React, { Children, useEffect, useRef } from 'react';
import { SvgIcon } from '../SvgIcon';
import styles from './accordion.module.scss';

export interface AccordionProps {
    /**
     * Содержимое аккордеона.
     */
    children?: React.ReactNode;
    /**
     * Заголовок аккордеона.
     */
    header: React.ReactNode;
    /**
     * Уникальный идентификатор.
     */
    id: string | number;
    /**
     * Дополнительные пропсы.
     */
    [key: string]: any;
}

/**
 * Кастомный компонент аккордеона с анимацией.
 *
 * @component
 * @param {AccordionProps} props - параметры компонента.
 */
export const Accordion = (props: AccordionProps) => {
    // Ссылка на контейнер содержимого (для анимации высоты)
    const contentEl = useRef<HTMLDivElement | null>(null);
    // Ссылка на корневой элемент аккордеона
    const el = useRef<HTMLDivElement | null>(null);
    const { children, header, id } = props;

    /**
     * Определяет, есть ли содержимое (развёрнут ли аккордеон).
     * Если `children` есть — аккордеон может быть развёрнут.
     */
    const isExpanded = !!Children.count(children);

    const handlerClick = () => {
        if (isExpanded && contentEl.current && el.current) {
            if (contentEl.current.style.height === '0px') {
                // Открытие
                contentEl.current.style.display = 'block';
                contentEl.current.style.height = `${contentEl.current?.scrollHeight}px`;
                el.current.classList.add(styles.element__open);
                el.current.classList.remove(styles.element__close);
            } else {
                // Закрытие
                contentEl.current.style.height = `${contentEl.current?.scrollHeight}px`;
                window.getComputedStyle(contentEl.current as HTMLDivElement, null).getPropertyValue('height');
                contentEl.current.style.height = '0';
                el.current.classList.remove(styles.element__open);
                el.current.classList.add(styles.element__close);
            }
        }
    };

    /**
     * Эффект: добавляет обработчик события `transitionend`.
     * После завершения анимации:
     * - если высота не 0 — устанавливает `height: auto` (чтобы контент мог расти)
     * - если 0 — скрывает блок
     */
    useEffect(() => {
        const handleTransitionend = () => {
            if (contentEl.current) {
                if (contentEl.current.style.height !== '0px') {
                    contentEl.current.style.height = 'auto';
                } else {
                    contentEl.current.style.display = 'none';
                }
            }
        };
        contentEl.current?.addEventListener('transitionend', handleTransitionend);

        return () => {
            contentEl.current?.removeEventListener('transitionend', handleTransitionend);
        };
    });

    return (
        <div ref={el} className={`${styles.element} ${styles.element__close}`} key={id}>
            <div className={styles.element__header}>
                {/* Декоративный элемент */}
                <div className={styles.element__border_corner}></div>
                {/* Кнопка сворачивания */}
                {isExpanded && (
                    <button className={styles.element__expand_icon} disabled={!isExpanded} onClick={handlerClick}>
                        <SvgIcon style={{ width: '1rem', paddingLeft: '2px' }} name="collapse" />
                    </button>
                )}

                {/* Заголовок */}
                <div style={{ width: '100%' }}>{header}</div>
            </div>

            {/* Содержимое с анимацией высоты */}
            <div ref={contentEl} className={styles.element__children} style={{ height: 0, display: 'none' }}>
                {isExpanded && children}
            </div>
        </div>
    );
};
