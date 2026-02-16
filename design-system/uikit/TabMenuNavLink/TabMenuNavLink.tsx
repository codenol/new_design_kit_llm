import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import cl from 'classnames';
import { NavLink } from 'react-router-dom';
import { CustomLink } from './CustomLink';
import { SvgIcon } from '../SvgIcon';

import './tabMenuNavLink.scss';

export type TTabMenuNavLink = {
    /**
     * Массив элементов меню
     */
    items: TTabItem[];
    /**
     * Компонент для отображения внутри панели таба (p-tabview-panels)
     */
    context?: React.ReactNode;
};
export type TTabItem = {
    /**
     * Текст ссылки
     */
    label: string;
    /**
     * Ссылка
     */
    url?: string;
    /**
     * Название иконки
     */
    icon?: any | undefined;
    /**
     * Список элементов подменю
     */
    children?: TTabItem[];
    /**
     * Id для добавления к стандартному testid элемента для создания уникальности
     * @example
     * Если testid="home",
     * то итоговый testid пункта меню будет "tabmenu-nav-link-home"
     */
    testid?: string;
};

// Выпадающее меню
const DropDownLink = ({ label, items, icon, testid }) => {
    const menu = useRef<any>(null);
    const pathname = window.location.pathname.split('/');
    const isActive = items.some((item) => item.url === pathname[pathname.length - 1]);

    const itemTemplate = (item, opt) => (
        <NavLink
            className={({ isActive }) => (isActive ? `active ${opt.className}` : opt.className)}
            style={({ isActive }) => ({
                color: isActive ? 'var(--surface-0)' : '',
                background: isActive ? 'var(--primary-color)' : '',
            })}
            to={item.url}
            onClick={opt.onClick}
            data-testid={`tabmenu-nav-link${item.testid ? '-' + item.testid : ''}`}
        >
            <SvgIcon className="mr-2" name={item.icon} />
            {item.label}
        </NavLink>
    );

    return (
        <>
            <Menu model={items.map((item) => ({ ...item, template: itemTemplate }))} popup ref={menu} />
            <li
                className={cl('p-unselectable-text', { 'p-tabview-selected p-highlight': isActive })}
                role="presentation"
            >
                <div
                    className={cl('p-tabview-nav-link p-unselectable-text', {
                        'p-tabview-nav-link p-tabview-selected p-highlight': isActive,
                    })}
                    onClick={(event) => menu?.current?.toggle(event)}
                    data-testid={`tabmenu-nav-link${testid ? '-' + testid : ''}`}
                >
                    {!!icon && <SvgIcon className="mr-2" name={icon} />}
                    <span className="p-tabview-title">
                        {label}
                        <SvgIcon style={{ width: '1rem', paddingLeft: '4px' }} name="chevron-down" />
                    </span>
                    <span role="presentation" className="p-ink"></span>
                </div>
            </li>
        </>
    );
};

/**
 * Кастомное меню на табах с поддержкой подменю
 */
export const TabMenuNavLink = ({ items, context }: TTabMenuNavLink) => (
    <div className="p-tabview p-component p-tabview-scrollable sticky tabs-inner-page tabmenu-nav-link">
        <div className="p-tabview-nav-container">
            <div className="p-component tabmenu" data-testid="tabmenu">
                <ul className="p-tabview-nav" role="tablist">
                    {items.map(({ label, url, children, icon, testid }, index) =>
                        children ? (
                            <DropDownLink key={index} label={label} icon={icon} items={children} testid={testid} />
                        ) : (
                            <CustomLink key={index} to={url} icon={icon} testid={testid}>
                                {label}
                            </CustomLink>
                        )
                    )}
                </ul>
            </div>
        </div>
        <div className="p-tabview-panels">{context}</div>
    </div>
);
