import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import cl from 'classnames';
import { SvgIcon } from '../../SvgIcon';

export const CustomLink: React.FC<any> = ({ children, to, onClick, icon, testid }) => {
    const location = useLocation();

    const pathSegments = location.pathname.split('/').filter(Boolean);

    const match = pathSegments.includes(to);

    return (
        <li className={cl('p-unselectable-text', { 'p-tabview-selected p-highlight': match })} role="presentation">
            <NavLink
                className={({ isActive }) =>
                    isActive
                        ? 'p-tabview-nav-link p-tabview-selected p-highlight'
                        : 'p-tabview-nav-link p-unselectable-text'
                }
                to={to}
                onClick={onClick}
                data-testid={`tabmenu-nav-link${testid ? '-' + testid : ''}`}
            >
                {!!icon && <SvgIcon className="mr-2" name={icon} />}
                <span className="p-tabview-title">{children}</span>
                <span role="presentation" className="p-ink"></span>
            </NavLink>
        </li>
    );
};
