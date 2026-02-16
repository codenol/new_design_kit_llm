import React, { useState, ReactNode, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

export interface ITooltipProps {
    children: ReactNode;
    /**
     * @description Контент, который вылезет в тултипе.
     */
    content: string | ReactNode;
    /**
     * @description Позиция тултипа. (top, bottom, left, right)
     * @default 'top'
     */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * @description Будет ли жить тултип, когда на него переводят курсор.
     * @default false
     */
    aliveOnHover?: boolean;
    /**
     * @description Показывать тултип вместо хавера на клик.
     * @default false
     */
    activateOnClick?: boolean;
    /**
     * @description Стили контейнера с контентом.
     */
    contentStyle?: any;
    props?: any;
}

export const Tooltip: React.FC<ITooltipProps> = ({
    content,
    position = 'top',
    children,
    aliveOnHover,
    activateOnClick,
    contentStyle,
    ...props
}) => {
    const [hover, setHover] = useState(false);
    const hoverTimeout = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            setHover(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
        setHover(false);
    };

    return (
        <div
            className="tooltip-anchor"
            {...(activateOnClick
                ? {
                      onClick: () => {
                          setHover((prev) => !prev);
                      },
                      style: { cursor: 'pointer' },
                  }
                : {
                      onMouseEnter: handleMouseEnter,
                  })}
            onMouseLeave={handleMouseLeave}
            {...(props as any)}
        >
            <CSSTransition in={hover} timeout={300} classNames={`tooltip-anim-${position} tooltip-anim`} unmountOnExit>
                <div
                    className={`tooltip tooltip-${position}`}
                    style={{ pointerEvents: aliveOnHover ? 'auto' : 'none' }}
                >
                    <div className={`tooltip-container-${position}`}>
                        <div className="tooltip-content" style={contentStyle}>
                            {content}
                        </div>
                        <div className={`tooltip-arrow-${position}`}></div>
                    </div>
                </div>
            </CSSTransition>
            {children}
        </div>
    );
};
