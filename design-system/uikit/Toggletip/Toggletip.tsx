import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { getWindowRect } from '../utils/getWindowRect';

const POSSIBLE_ATTRIBUTES = [
    'toggletipContent',
    'toggletipHeader',
    'toggletipPosition',
    'toggletipDisableChildren',
    'toggletipId',
];

/**
 * Атрибуты работают только когда вы куда-либо в приложение (желательно на самый верх дома) запихнули <AbsoluteToggletip/>
 * Для того, чтобы тоглтип показывался у вашего компонента, необходимо передать в него хотя бы один из следующих параметров:
 *  * data-toggletip-content
 *  * data-toggletip-header
 *  * data-toggletip-position
 *  * data-toggletip-disable-children
 *  * data-toggletip-id
 *
 * !!! И ДОБАВИТЬ В КОМПОНЕНТ ХОТЬ КАКОЙ-НИБУДЬ УНИКАЛЬНЫЙ ID !!!
 * !!! БЕЗ УНИКАЛЬНОГО ID ЛОГИКА ПРИВЯЗКИ ТОГЛТИПА ПОЛЕТИТ !!!
 *
 */
interface AbsoluteToggletipHTMLAttributes {
    /**
     * Контент тоглтипа.
     * @description Через атрибуты можно передавать только текст. Если надо отрисовывать что-то сложное - пользуйтесь пропсами тоглтипа.
     */
    'data-toggletip-content'?: string | undefined;
    /**
     * Хедер тоглтипа.
     * @description Через атрибуты можно передавать только текст. Если надо отрисовывать что-то сложное - пользуйтесь пропсами тоглтипа.
     */
    'data-toggletip-header'?: string | undefined;
    /**
     * Положение тоглтипа относительно компонента.
     * @default position ='top'
     */
    'data-toggletip-position'?: 'top' | 'bottom' | 'left' | 'right' | undefined;
    /**
     * Отключить pointer-events для детей компонента с тоглтипом.
     * @description Нужно, если тоглтип не показывается из-за хавера на иконку внутри кнопки.
     */
    'data-toggletip-disable-children'?: boolean | undefined;
    /**
     * Привязка к тоглтипу с выбранным id.
     */
    'data-toggletip-id'?: string | undefined;
    /**
     * Стиль враппера тоглтипа.
     * @description Принимает только обычный css в виде string, иначе завести не получилось.
     */
    'data-toggletip-style'?: string | undefined;
    /**
     * Стиль контента тоглтипа.
     * @description Принимает только обычный css в виде string, иначе завести не получилось.
     */
    'data-toggletip-content-style'?: string | undefined;
    /**
     * Стиль хедера тоглтипа.
     * @description Принимает только обычный css в виде string, иначе завести не получилось.
     */
    'data-toggletip-header-style'?: string | undefined;
    /**
     * Стиль стрелки тоглтипа.
     * @description Принимает только обычный css в виде string, иначе завести не получилось.
     */
    'data-toggletip-arrow-style'?: string | undefined;
    /**
     * Отметка для области, не вызывающая ивентов обработки состояний тоглтипов.
     */
    'data-toggletip-ignore-click'?: boolean | undefined;
    /**
     * Будет ли тоглтип игнорировать пользовательские ивенты открытия/закрытия других тоглтипов.
     * @description Принимает только обычный css в виде string, иначе завести не получилось.
     */
    'data-toggletip-ignore-others'?: boolean | undefined;
    /**
     * Поведение тоглтипа при его пересечении с областью видимости на экране.
     * * keepInView - всегда держать тоглтип в поле видимости пользователя.
     * * clip - отрезать невидимый кусок.
     * * hide - прятать весь тоглтип при хоть каком-то пересечении с границей видимости.
     * * close - закрывать тоглтип при хоть каком-то пересечении с границей видимости.
     * * closeOnFullClip - закрывать тоглтип только при полном выходе за границу видимости.
     * @default container-overflow-behaviour ='closeOnFullClip'
     */
    'data-toggletip-container-overflow-behaviour'?:
    | 'keepInView'
    | 'clip'
    | 'hide'
    | 'close'
    | 'closeOnFullClip'
    | undefined;
}

export interface IAbsoluteToggletipProps {
    header?: string | ReactNode;
    content?: string | ReactNode;
    /**
     * Стиль враппера тоглтипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки.
     */
    style?: string;
    /**
     * Стиль контента тоглтипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки.
     */
    headerStyle?: string;
    /**
     * Стиль контента тоглтипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки.
     */
    contentStyle?: string;
    /**
     * Стиль стрелки тоглтипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки.
     */
    arrowStyle?: string;
    /**
     * Позиция тоглтипа.
     * @options 'top' | 'bottom' | 'left' | 'right'
     * @defaultValue 'top'
     */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Id тоглтипа.
     */
    id?: string;
    /**
     * Поведение тоглтипа при его пересечении с областью видимости на экране.
     * * keepInView - всегда держать тоглтип в поле видимости пользователя.
     * * clip - отрезать невидимый кусок.
     * * hide - прятать весь тоглтип при хоть каком-то пересечении с границей видимости.
     * * close - закрывать тоглтип при хоть каком-то пересечении с границей видимости.
     * * closeOnFullClip - закрывать тоглтип только при полном выходе за границу видимости.
     * @default container-overflow-behaviour ='closeOnFullClip'
     */
    containerOverflowBehaviour?: 'keepInView' | 'clip' | 'hide' | 'close' | 'closeOnFullClip';
}

const Toggletip: React.FC<{
    props: IAbsoluteToggletipProps & { bounds?: DOMRect; ownerId: string; onClose: () => void };
}> = ({ props }) => {
    const {
        header, // хедер в тоглтипе
        content, // текст в тоглтипе
        position = 'top', // с какой стороны надо показывать
        headerStyle, // стиль хедера
        contentStyle, // стиль текста
        arrowStyle, // стиль стрелки
        style, // стиль враппера
        onClose, // колбек на закрытие тоглтипа
        ownerId, // id элемента, вызвавшего тоглтип
        containerOverflowBehaviour, // поведение при выходе за рамки контейнера
    } = props;

    // реф главного враппера, который используется для позиционирования
    const toggletipWrapperRef = useRef<HTMLDivElement>(null);
    // реф контейнера с текстом и кнопкой, который режут и пользуют его координаты для позиционирования
    const toggletipRef = useRef<HTMLDivElement>(null);
    // реф стрелки
    const arrowRef = useRef<HTMLDivElement>(null);
    // реф хедера
    const headerRef = useRef<HTMLDivElement>(null);
    // реф текста
    const contentRef = useRef<HTMLDivElement>(null);
    // координаты элемента, вызвавшего тоглтип
    const [bounds, setBounds] = useState(props?.bounds);
    // координаты контейнера, которые используются для определения видимости тоглтипа
    const [container, setContainer] = useState<DOMRect>(getWindowRect());

    // Сразу расчитываем координаты контейнера с учетом возможных пересечений родителей с overflow.
    useEffect(() => {
        const child = document.getElementById(ownerId);
        setContainer(getContainerSumRect(getFirstScrollableParrent(child), child));
    }, []);

    // Расчет абсолютных x,y для тоглтипа с учетом направления и координат компонента, вызвавшего тоглтип.
    const getAbsoluteCoords = (parentRect: DOMRect, hoveredPosition: string) => {
        const absoluteLeft: number =
            parentRect.left +
            (hoveredPosition === 'top' || hoveredPosition === 'bottom'
                ? parentRect.width / 2
                : hoveredPosition === 'right'
                    ? parentRect.width
                    : 0);
        const absoluteTop: number =
            parentRect.top +
            (hoveredPosition === 'left' || hoveredPosition === 'right'
                ? parentRect.height / 2
                : hoveredPosition === 'bottom'
                    ? parentRect.height
                    : 0);
        return {
            absoluteLeft,
            absoluteTop,
        };
    };

    // Проверка пересечения отрисованного тоглтипа с контейнером.
    const checkOverflow = (
        toggletipRect: DOMRect,
        parentRect: DOMRect,
        containerRect: DOMRect,
        hoveredPosition: string
    ) => {
        // Получения x,y тоглтипа, если он встанет в направлении hoveredPosition для компонента с координатами parentRect.
        const coords = getAbsoluteCoords(parentRect, hoveredPosition);

        return {
            left: hoveredPosition === 'right' ? 0 : coords.absoluteLeft - toggletipRect.width < containerRect.left,
            right: hoveredPosition === 'left' ? 0 : coords.absoluteLeft + toggletipRect.width > containerRect.right,
            top: hoveredPosition === 'bottom' ? 0 : coords.absoluteTop - toggletipRect.height < containerRect.top,
            bottom: hoveredPosition === 'top' ? 0 : coords.absoluteTop + toggletipRect.height > containerRect.bottom,
        };
    };

    // Получение информации о пересечении тоглтипом родительских контейнеров компонента, вызвавшего тоглтип.
    const getClippingAndRect = (
        absoluteCoords: {
            absoluteLeft: number;
            absoluteTop: number;
        },
        toggletipRect: DOMRect,
        containerRect: DOMRect,
        hoveredPosition: string
    ): {
        clipPath: string;
        clip: {
            left: number;
            top: number;
            right: number;
            bottom: number;
        };
        isClipping: boolean;
    } => {
        // Ищем смещение положения тоглтипа относительного выбранного направления.
        const positionMultiplier = {
            left: hoveredPosition === 'top' || hoveredPosition === 'bottom' ? -0.5 : 0,
            top: hoveredPosition === 'left' || hoveredPosition === 'right' ? -0.5 : 0,
            right: hoveredPosition === 'top' || hoveredPosition === 'bottom' ? 0.5 : 0,
            bottom: hoveredPosition === 'left' || hoveredPosition === 'right' ? 0.5 : 0,
        };
        // Получение РЕАЛЬНЫХ координат тоглтипа.
        const realPos = {
            left: absoluteCoords.absoluteLeft + toggletipRect.width * positionMultiplier.left,
            top: absoluteCoords.absoluteTop + toggletipRect.height * positionMultiplier.top,
            right: absoluteCoords.absoluteLeft + toggletipRect.width * positionMultiplier.right,
            bottom: absoluteCoords.absoluteTop + toggletipRect.height * positionMultiplier.bottom,
            width: toggletipRect.width,
            height: toggletipRect.height,
        };
        // Смотрим с какой стороны вообще есть пересечения.
        const clippingDirection = {
            left: containerRect.left - realPos.left,
            top: containerRect.top - realPos.top,
            right: realPos.right - containerRect.right,
            bottom: realPos.bottom - containerRect.bottom,
        };

        // Если надо прятать хоть при малейшем пересечении.
        if (
            containerOverflowBehaviour === 'hide' &&
            Object.entries(clippingDirection).find(([, direction]) => direction > 0)
        ) {
            return { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)', clip: clippingDirection, isClipping: true };
        }
        // Получение координат пересечения контейнера и тоглтипа для более удобного описания клиппинга через polygon().
        const clipped = {
            left: containerRect.left - realPos.left < 0 ? 0 : containerRect.left - realPos.left,
            top: containerRect.top - realPos.top < 0 ? 0 : containerRect.top - realPos.top,
            right:
                realPos.width - (realPos.right - containerRect.right) < 0
                    ? 0
                    : realPos.width - (realPos.right - containerRect.right),
            bottom:
                realPos.height - (realPos.bottom - containerRect.bottom) < 0
                    ? 0
                    : realPos.height - (realPos.bottom - containerRect.bottom),
        };
        return {
            clipPath: `polygon(${clipped.left}px ${clipped.top}px, ${clipped.right}px ${clipped.top}px, ${clipped.right}px ${clipped.bottom}px, ${clipped.left}px ${clipped.bottom}px)`,
            clip: clippingDirection,
            isClipping: !!Object.entries(clippingDirection).find(([, direction]) => direction > 0),
        };
    };

    // Проверка на то, является ли элемент ребенком другого элемента.
    const checkParent = (parent, child) => {
        let node = child.parentNode;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    // Получение первого родителя со скролом для элемента, вызвавшего тоглтип.
    const getFirstScrollableParrent = (child) => {
        let node = child.parentNode;
        while (node != null) {
            if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
                return node;
            }
            node = node.parentNode;
        }
        return undefined;
    };

    // Получение координат пересечения всех контейнеров с активными скроллами.
    const getContainerSumRect = (parent, child) => {
        let node = child.parentNode;
        const parentRect: DOMRect = parent?.getBoundingClientRect() || getWindowRect();
        const rectSum = {
            left: parentRect.left,
            top: parentRect.top,
            right: parentRect.right,
            bottom: parentRect.bottom,
        };

        while (node != null) {
            // Считаем координаты пересечения всех контейнеров с активными скроллами вверх по DOM'у.
            if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
                const nodeRect = node.getBoundingClientRect();
                rectSum.left = Math.max(rectSum.left, nodeRect.left);
                rectSum.top = Math.max(rectSum.top, nodeRect.top);
                rectSum.right = Math.min(rectSum.right, nodeRect.right);
                rectSum.bottom = Math.min(rectSum.bottom, nodeRect.bottom);
            }
            node = node.parentNode;
        }

        return new DOMRect(
            rectSum.left,
            rectSum.top,
            Math.max(0, rectSum.right - rectSum.left),
            Math.max(0, rectSum.bottom - rectSum.top)
        );
    };

    // функция для троттла и дебаунса одновременно.
    const throttleAndDebounce = (fn: (...params) => void, delay: number) => {
        let lastCall = 0;
        let timer;
        return (...args) => {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return undefined;
            }
            lastCall = now;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn(...args);
            }, delay);
            return fn(...args);
        };
    };

    // Откладываем добавление анимации перемещения тоглтипа до следующего рендер-лупа.
    useEffect(() => {
        let timeout;
        if (toggletipWrapperRef.current) {
            setTimeout(() => {
                if (toggletipWrapperRef.current) {
                    toggletipWrapperRef.current.style.transition =
                        'top 0.05s linear, left 0.05s linear, opacity 0.3s linear';
                    toggletipWrapperRef.current.style.opacity = '1';
                }
            }, 50);
        }
        return clearTimeout(timeout);
    }, [toggletipWrapperRef.current]);

    // Обработка скролла.
    useEffect(() => {
        // Каждые 50мс пытаемся получить новые координаты вызвавшего тоглтип компонента.
        const revalidateBounds = throttleAndDebounce((event: Event) => {
            setBounds(document.getElementById(ownerId)?.getBoundingClientRect());
            // Если вызвавший тоглтип компонент является ребенком елемента, который сейчас скролился,
            // то высчитываем доступное для тоглтипа место для всех контейнеров в доме, иначе контейнер = все окно.
            if (checkParent(event.target, document.getElementById(ownerId))) {
                setContainer(getContainerSumRect(event.target, document.getElementById(ownerId)));
            } else {
                setContainer(getWindowRect());
            }
        }, 50);

        window.addEventListener('scroll', revalidateBounds, true);

        return () => {
            window.removeEventListener('scroll', revalidateBounds);
        };
    }, [contentRef.current, toggletipWrapperRef.current, arrowRef.current, headerRef.current]);

    // Обновление стилей тоглтипа.
    useEffect(() => {
        if (
            contentRef.current &&
            toggletipWrapperRef.current &&
            arrowRef.current &&
            toggletipRef.current &&
            headerRef.current
        ) {
            contentRef.current.setAttribute('style', contentStyle || '');
            toggletipWrapperRef.current.setAttribute('style', style || '');
            toggletipWrapperRef.current.style.opacity = '1';
            arrowRef.current.setAttribute('style', arrowStyle || '');
            headerRef.current.setAttribute('style', headerStyle || '');
        }
    }, [
        contentRef.current,
        toggletipWrapperRef.current,
        arrowRef.current,
        toggletipRef.current,
        headerRef.current,
        contentStyle,
        style,
        arrowStyle,
    ]);

    // Обновление положения тоглтипа и его стилей.
    useEffect(() => {
        if (
            contentRef.current &&
            toggletipWrapperRef.current &&
            arrowRef.current &&
            toggletipRef.current &&
            headerRef.current &&
            bounds &&
            container
        ) {
            // Получаем размеры всего тоглтипа.
            const toggletipRect = toggletipRef?.current.getBoundingClientRect();

            // Выбираем направление для тоглтипа, чтоб влез в контейнер.
            const overflow = checkOverflow(toggletipRect, bounds, container, position);
            let currentPos: string = position || 'top';
            // Если не влезает, то суем в противоположном направлении.
            if (overflow[currentPos]) {
                currentPos = {
                    top: 'bottom',
                    bottom: 'top',
                    right: 'left',
                    left: 'right',
                }[currentPos] as string;
            }
            // TODO: Доработать выбор положения тоглтипа, чтоб он умел в влево-вверх, вправо-вниз и тд.
            // Опять проверяем пересечение.
            // const newOverflow = checkOverflow(toggletipRect, bounds, container, currentPos);

            // const translate = {
            //     x: newOverflow.left ? 1 : newOverflow.right ? -1 : 0,
            //     y: newOverflow.top ? 1 : newOverflow.bottom ? -1 : 0,
            // };
            // contentRef.current.style.transform = `translate(calc(${translate.x} * calc(50% - 1rem)), calc(${translate.y} * calc(50% - 1rem)))`;

            // Ставим стили для корректного отображения направления.
            toggletipWrapperRef.current.children[0].className = `toggletip toggletip-${currentPos} toggletip-anim-${currentPos}`;
            toggletipWrapperRef.current.children[0].children[0].className = `toggletip-container-${currentPos}`;
            toggletipWrapperRef.current.children[0].children[0].children[1].className = `toggletip-arrow-${currentPos}`;

            // Получение финальных абсолютных координат точки (left, top) для перемещения тоглтипа.
            const absoluteCoords = getAbsoluteCoords(bounds, currentPos);
            // Получаем инфу о пересечении границ контейнеров
            const clipping = getClippingAndRect(absoluteCoords, toggletipRect, container, currentPos);

            if (clipping.isClipping && containerOverflowBehaviour === 'close') {
                onClose();
                return;
            }

            // Если надо всегда держать в поле видимости.
            if (containerOverflowBehaviour === 'keepInView') {
                // Смотрим с какой стороны клипает.
                const clippingBool = {
                    inline: clipping.clip.left > 0 ? -1 : clipping.clip.right > 0 ? 1 : 0,
                    block: clipping.clip.bottom > 0 ? -1 : clipping.clip.top > 0 ? 1 : 0,
                };
                toggletipWrapperRef.current.style.left = `${clippingBool.inline === -1
                        ? absoluteCoords.absoluteLeft + clipping.clip.left
                        : clippingBool.inline === 1
                            ? absoluteCoords.absoluteLeft - clipping.clip.right
                            : absoluteCoords.absoluteLeft
                    }px`;
                toggletipWrapperRef.current.style.top = `${absoluteCoords.absoluteTop +
                    (clipping.clip.top > 0 ? clipping.clip.top : 0) -
                    (clipping.clip.bottom > 0 ? clipping.clip.bottom : 0)
                    }px`;
            } else if (
                // Если надо закрывать при полном клипе и есть полный клип с любого направления.
                containerOverflowBehaviour === 'closeOnFullClip' &&
                (clipping.clip.bottom > toggletipRect.height ||
                    clipping.clip.top > toggletipRect.height ||
                    clipping.clip.left > toggletipRect.width ||
                    clipping.clip.right > toggletipRect.width)
            ) {
                onClose();
            } else {
                // Если надо просто клипать.
                toggletipWrapperRef.current.style.left = `${absoluteCoords.absoluteLeft}px`;
                toggletipWrapperRef.current.style.top = `${absoluteCoords.absoluteTop}px`;
                toggletipRef.current.style.clipPath = clipping.clipPath;
            }
        }
    }, [
        contentRef.current,
        toggletipWrapperRef.current,
        arrowRef.current,
        toggletipRef.current,
        headerRef.current,
        bounds,
        container,
    ]);

    return (
        <div ref={toggletipWrapperRef} className="toggletip-wrapper">
            <CSSTransition
                in={true}
                timeout={300}
                classNames={`toggletip-anim-${position} toggletip-anim`}
                unmountOnExit
                nodeRef={toggletipRef}
            >
                <div ref={toggletipRef} className={`toggletip toggletip-${position}`}>
                    <div className={`toggletip-container-${position}`} data-toggletip-ignore-click>
                        <div
                            className="toggletip-content"
                            ref={contentRef}
                            id={`toggletip-${ownerId}`}
                            data-toggletip-ignore-click
                        >
                            <div
                                className="toggletip-button"
                                onClick={() => {
                                    onClose();
                                }}
                                data-toggletip-ignore-click
                            >
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9.12523 7.68863L14.5447 2.26914C14.6351 2.18495 14.7075 2.08343 14.7578 1.97063C14.8081 1.85782 14.8351 1.73605 14.8373 1.61258C14.8394 1.4891 14.8167 1.36645 14.7705 1.25195C14.7242 1.13744 14.6554 1.03343 14.5681 0.946102C14.4807 0.858778 14.3767 0.789938 14.2622 0.743687C14.1477 0.697436 14.0251 0.674722 13.9016 0.676901C13.7781 0.679079 13.6563 0.706106 13.5435 0.756367C13.4307 0.806629 13.3292 0.879096 13.245 0.969445L7.82553 6.38894L2.40604 0.969445C2.23171 0.807008 2.00114 0.718575 1.76291 0.722778C1.52467 0.726982 1.29736 0.823493 1.12888 0.991979C0.960389 1.16047 0.863878 1.38777 0.859675 1.62601C0.855471 1.86425 0.943904 2.09482 1.10634 2.26914L6.52583 7.68863L1.10634 13.1081C0.934131 13.2805 0.837402 13.5143 0.837402 13.758C0.837402 14.0017 0.934131 14.2354 1.10634 14.4078C1.27877 14.58 1.5125 14.6768 1.75619 14.6768C1.99988 14.6768 2.23361 14.58 2.40604 14.4078L7.82553 8.98833L13.245 14.4078C13.4174 14.58 13.6512 14.6768 13.8949 14.6768C14.1386 14.6768 14.3723 14.58 14.5447 14.4078C14.7169 14.2354 14.8137 14.0017 14.8137 13.758C14.8137 13.5143 14.7169 13.2805 14.5447 13.1081L9.12523 7.68863Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>

                            <div className="toggletip-header" ref={headerRef} data-toggletip-ignore-click>
                                {header}
                            </div>

                            {content}
                        </div>
                        <div className={`toggletip-arrow-${position}`} ref={arrowRef}></div>
                    </div>
                </div>
            </CSSTransition>
        </div>
    );
};

// Враппер, спавнящий тоглтипы.
export const AbsoluteToggletipWrapper: React.FC<IAbsoluteToggletipProps> = ({
    header,
    content,
    style,
    headerStyle,
    contentStyle,
    arrowStyle,
    position = 'top',
    id,
    containerOverflowBehaviour = 'closeOnFullClip',
}) => {
    // Хранилище со всеми активными тоглтипами.
    const [activeToggletips, setActiveToggletips] = useState<
        (IAbsoluteToggletipProps & {
            bounds?: DOMRect;
            ownerId: string;
            ignoreOtherToggletips: boolean;
            onClose: () => void;
        })[]
    >([]);

    // Лисенер на клик, спавнящий и валидирующий существующие тоглтипы.
    useEffect(() => {
        const updateVisibility = (event: MouseEvent) => {
            const target = event.target as any;
            // Если у компонента, по которому кликнули, есть хоть один из главных атрибутов тоглтипа.
            if (POSSIBLE_ATTRIBUTES.filter((attr) => !!target?.dataset?.[attr]).length) {
                const attrs = target?.dataset;
                // Если пользователь обращался к другому AbsoluteToggletipWrapper.
                if (id !== attrs.toggletipId) {
                    return;
                }
                // Если клик был на компонент, которому еще не заспавнили его тоглтип.
                if (!activeToggletips?.find((toggletip) => toggletip?.ownerId === target?.id)) {
                    setActiveToggletips((prev) => [
                        // Оставляем только те тоглтипы, которые закрываются сугубо по своему крестику.
                        ...prev.filter((toggletip) => toggletip?.ignoreOtherToggletips),
                        // И добавляем новый.
                        {
                            ownerId: target?.id,
                            header: attrs?.toggletipHeader || header,
                            content: attrs?.toggletipContent || content,
                            position: attrs?.toggletipPosition || position,
                            headerStyle: attrs?.toggletipHeaderStyle || headerStyle,
                            contentStyle: attrs?.toggletipContentStyle || contentStyle,
                            arrowStyle: attrs?.toggletipArrowStyle || arrowStyle,
                            style: attrs?.toggletipStyle || style,
                            bounds: target?.getBoundingClientRect(),
                            onClose: () => {
                                setActiveToggletips((prev) =>
                                    prev.filter((toggletip) => toggletip?.ownerId !== target?.id)
                                );
                            },
                            ignoreOtherToggletips: !!attrs?.toggletipIgnoreOthers,
                            containerOverflowBehaviour:
                                attrs?.toggletipContainerOverflowBehaviour || containerOverflowBehaviour,
                        },
                    ]);
                }
            } else if (target?.dataset?.toggletipIgnoreClick) {
                setActiveToggletips((prev) =>
                    prev.filter(
                        (toggletip) =>
                            `toggletip-${toggletip?.ownerId}` === target?.id || toggletip?.ignoreOtherToggletips
                    )
                );
            } else {
                setActiveToggletips((prev) => prev.filter((toggletip) => toggletip?.ignoreOtherToggletips));
            }
        };

        window.addEventListener('click', updateVisibility);

        return () => {
            window.removeEventListener('click', updateVisibility);
        };
    }, [activeToggletips]);

    return (
        <>
            {activeToggletips.map((toggletip) => (
                <Toggletip props={toggletip} key={toggletip.ownerId} />
            ))}
        </>
    );
};

declare module 'react' {
    export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T>, AbsoluteToggletipHTMLAttributes { }
}
