/**
 * Drawer — выдвижная панель (обёртка над PrimeReact Sidebar).
 * По поведению похож на модальное окно: оверлей, закрытие по клику на маску и Escape.
 *
 * @module Drawer
 */
import React from 'react';
import { Sidebar, SidebarProps } from 'primereact/sidebar';
import classNames from 'classnames';
import './drawer.scss';

export interface DrawerProps extends Omit<SidebarProps, 'onHide'> {
    /**
     * Видимость панели.
     */
    visible: boolean;
    /**
     * Вызывается при закрытии (крестик, маска, Escape).
     */
    onHide: () => void;
    /**
     * Заголовок в шапке панели.
     */
    header?: React.ReactNode;
    /**
     * С какой стороны выезжает панель.
     * @default 'right'
     */
    position?: 'left' | 'right' | 'top' | 'bottom';
    /**
     * Дочерний контент панели.
     */
    children?: React.ReactNode;
    /**
     * Дополнительный CSS-класс корня.
     */
    className?: string;
    /**
     * Ширина панели (для left/right) или высота (для top/bottom).
     * @default '28rem' для left/right
     */
    width?: string;
}

const defaultWidth = '28rem';

/**
 * Drawer — выдвижная панель с оверлеем и опциональным заголовком.
 */
export const Drawer: React.FC<DrawerProps> = ({
    visible,
    onHide,
    header,
    position = 'right',
    children,
    className,
    width = defaultWidth,
    showCloseIcon = true,
    dismissable = true,
    modal = true,
    closeOnEscape = true,
    blockScroll = true,
    style: styleProp,
    ...rest
}) => {
    const isHorizontal = position === 'left' || position === 'right';
    const style: React.CSSProperties = isHorizontal
        ? { width, minWidth: width, maxWidth: '90vw' }
        : { height: width, minHeight: width, maxHeight: '90vh' };

    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            position={position}
            showCloseIcon={showCloseIcon}
            dismissable={dismissable}
            modal={modal}
            closeOnEscape={closeOnEscape}
            blockScroll={blockScroll}
            className={classNames('uikit-drawer', className)}
            style={{ ...style, ...styleProp }}
            icons={header != null ? <span className="uikit-drawer__title">{header}</span> : undefined}
            {...rest}
        >
            {children}
        </Sidebar>
    );
};
