import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

const POSSIBLE_ATTRIBUTES = [
    'tooltipContent',
    'tooltipPosition',
    'tooltipDisableChildren',
    'tooltipId',
    'tooltipFollowCursor',
];

/**
 * Атрибуты работают только когда вы куда-либо в приложение (желательно на самый верх дома) запихнули <AbsoluteTooltip/>
 * Для того, чтобы тултип показывался у вашего компонента, необходимо передать в него хотя бы один из следующих параметров:
 *  * data-tooltip-content
 *  * data-tooltip-position
 *  * data-tooltip-disable-children
 *  * data-tooltip-id
 *  * data-tooltip-follow-cursor
 */
interface AbsoluteTooltipHTMLAttributes {
    /**
     * Контент тултипа.
     * @description Через атрибуты можно передавать только текст. Если надо отрисовывать что-то сложное - пользуйтесь пропсами тултипа
     */
    'data-tooltip-content'?: string | undefined;
    /**
     * Положение тултипа относительно компонента.
     * @default position ='top'
     */
    'data-tooltip-position'?: 'top' | 'bottom' | 'left' | 'right' | undefined;
    /**
     * Отключить pointer-events для детей компонента с тултипом.
     * @description Нужно, если тултип не показывается из-за хавера на иконку внутри кнопки.
     */
    'data-tooltip-disable-children'?: boolean | undefined;
    /**
     * Привязка к тултипу с выбранным id.
     */
    'data-tooltip-id'?: string | undefined;
    /**
     * Стиль враппера тултипа
     * @description Принимает только обычный css в виде string, иначе завести не получилось
     */
    'data-tooltip-style'?: string | undefined;
    /**
     * Стиль контента тултипа
     * @description Принимает только обычный css в виде string, иначе завести не получилось
     */
    'data-tooltip-content-style'?: string | undefined;
    /**
     * Стиль стрелки тултипа
     * @description Принимает только обычный css в виде string, иначе завести не получилось
     */
    'data-tooltip-arrow-style'?: string | undefined;
    /**
     * Следовать за курсором мыши
     * @description Если true, тултип будет следовать за курсором мыши вместо позиционирования относительно элемента
     */
    'data-tooltip-follow-cursor'?: boolean | undefined;
}

export interface IAbsoluteTooltipProps {
    content?: string | ReactNode;
    /**
     * Стиль враппера тултипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки
     */
    style?: string;
    /**
     * Стиль контента тултипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки
     */
    contentStyle?: string;
    /**
     * Стиль стрелки тултипа.
     * @description Для совместимости с аттрибутами пришлось оставить стиль в виде css строки
     */
    arrowStyle?: string;
    /**
     * Позиция тултипа.
     * @options 'top' | 'bottom' | 'left' | 'right'
     * @defaultValue 'top'
     */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Id тултипа.
     */
    id?: string;
    /**
     * Следовать за курсором мыши
     * @description Если true, тултип будет следовать за курсором мыши вместо позиционирования относительно элемента
     * @defaultValue false
     */
    followCursor?: boolean;
}

export const AbsoluteTooltip: React.FC<IAbsoluteTooltipProps> = ({
    content,
    style,
    contentStyle,
    arrowStyle,
    position = 'top',
    id,
    followCursor = false,
}) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [hoveredComponent, setHoveredComponent] = useState<
        IAbsoluteTooltipProps & { bounds?: any; cursorX?: number; cursorY?: number }
    >();
    const [hover, setHover] = useState(false);

    useEffect(() => {
        const updateVisibility = (event: MouseEvent) => {
            if (POSSIBLE_ATTRIBUTES.filter((attr) => !!(event.target as any)?.dataset?.[attr]).length) {
                const attrs = (event.target as any)?.dataset;
                if (id !== attrs.tooltipId) {
                    return;
                }
                setHoveredComponent({
                    content: attrs?.tooltipContent || content,
                    position: attrs?.tooltipPosition || position,
                    contentStyle: attrs?.tooltipContentStyle || contentStyle,
                    arrowStyle: attrs?.tooltipArrowStyle || arrowStyle,
                    style: attrs?.tooltipStyle || style,
                    followCursor:
                        attrs?.tooltipFollowCursor !== undefined ? attrs.tooltipFollowCursor === 'true' : followCursor,
                    bounds: (event.target as any)?.getBoundingClientRect(),
                    cursorX: event.clientX,
                    cursorY: event.clientY,
                });
                setHover(true);
            } else {
                setHover(false);
            }
        };

        window.addEventListener('mousemove', updateVisibility);

        return () => {
            window.removeEventListener('mousemove', updateVisibility);
        };
    }, [arrowStyle, content, contentStyle, id, position, style, followCursor]);

    const getPosition = (hoveredCoords, hoveredPosition, followCursor = false, cursorX = 0, cursorY = 0) => {
        if (followCursor) {
            const offsetX = hoveredPosition === 'right' ? 6 : hoveredPosition === 'left' ? -6 : 0;
            const offsetY = hoveredPosition === 'bottom' ? 6 : hoveredPosition === 'top' ? -6 : 0;
            return {
                absoluteLeft: cursorX + offsetX,
                absoluteTop: cursorY + offsetY,
            };
        }

        const absoluteLeft =
            hoveredCoords.left +
            (['top', 'bottom'].includes(hoveredPosition)
                ? hoveredCoords.width / 2
                : hoveredPosition === 'right'
                    ? hoveredCoords.width
                    : 0);
        const absoluteTop =
            hoveredCoords.top +
            (['left', 'right'].includes(hoveredPosition)
                ? hoveredCoords.height / 2
                : hoveredPosition === 'bottom'
                    ? hoveredCoords.height
                    : 0);
        return {
            absoluteLeft,
            absoluteTop,
        };
    };

    const checkOverflow = (bounds, hoveredCoords, hoveredPosition, followCursor = false, cursorX = 0, cursorY = 0) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pos = getPosition(hoveredCoords, hoveredPosition, followCursor, cursorX, cursorY);

        return {
            left: hoveredPosition === 'right' ? 0 : pos.absoluteLeft - bounds.width < 0,
            right: hoveredPosition === 'left' ? 0 : pos.absoluteLeft + bounds.width > windowWidth,
            top: hoveredPosition === 'bottom' ? 0 : pos.absoluteTop - bounds.height < 0,
            bottom: hoveredPosition === 'top' ? 0 : pos.absoluteTop + bounds.height > windowHeight,
        };
    };

    const updateTooltipPosition = () => {
        if (hover && hoveredComponent && contentRef.current && tooltipRef.current && arrowRef.current) {
            contentRef.current.setAttribute('style', hoveredComponent.contentStyle || '');
            tooltipRef.current.setAttribute('style', hoveredComponent.style || '');
            arrowRef.current.setAttribute('style', hoveredComponent.arrowStyle || '');

            const tooltipRect = (contentRef?.current as any).getBoundingClientRect();
            const overflow = checkOverflow(
                tooltipRect,
                hoveredComponent.bounds,
                hoveredComponent.position,
                hoveredComponent.followCursor,
                hoveredComponent.cursorX,
                hoveredComponent.cursorY
            );

            let currentPos: string | undefined = hoveredComponent.position || position;

            if (overflow[currentPos]) {
                currentPos = {
                    top: 'bottom',
                    bottom: 'top',
                    right: 'left',
                    left: 'right',
                }[currentPos];
            }

            const newOverflow = checkOverflow(
                tooltipRect,
                hoveredComponent.bounds,
                currentPos,
                hoveredComponent.followCursor,
                hoveredComponent.cursorX,
                hoveredComponent.cursorY
            );

            const translate = {
                x: newOverflow.left ? 1 : newOverflow.right ? -1 : 0,
                y: newOverflow.top ? 1 : newOverflow.bottom ? -1 : 0,
            };

            contentRef.current.style.transform = `translate(calc(${translate.x} * calc(50% - 1rem)), calc(${translate.y} * calc(50% - 1rem)))`;

            const pos = getPosition(
                hoveredComponent.bounds,
                currentPos,
                hoveredComponent.followCursor,
                hoveredComponent.cursorX,
                hoveredComponent.cursorY
            );

            tooltipRef.current.style.left = `${pos.absoluteLeft}px`;
            tooltipRef.current.style.top = `${pos.absoluteTop}px`;

            tooltipRef.current.children[0].className = `tooltip tooltip-${currentPos} tooltip-anim-${currentPos}`;
            tooltipRef.current.children[0].children[0].className = `tooltip-container-${currentPos}`;
            tooltipRef.current.children[0].children[0].children[1].className = `tooltip-arrow-${currentPos}`;
        }
    };

    useEffect(() => {
        updateTooltipPosition();
    }, [hover, hoveredComponent]);

    return (
        <div ref={tooltipRef} className="tooltip-wrapper">
            <CSSTransition in={hover} timeout={300} classNames={`tooltip-anim-${position} tooltip-anim`}
                nodeRef={tooltipRef} unmountOnExit>
                <div className={`tooltip tooltip-${position}`} style={{ pointerEvents: 'none' }}>
                    <div className={`tooltip-container-${position}`}>
                        <div className="tooltip-content" ref={contentRef}>
                            {hoveredComponent?.content}
                        </div>
                        <div className={`tooltip-arrow-${position}`} ref={arrowRef}></div>
                    </div>
                </div>
            </CSSTransition>
        </div>
    );
};

declare module 'react' {
    export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T>, AbsoluteTooltipHTMLAttributes { }
}
