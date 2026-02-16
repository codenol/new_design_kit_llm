import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { BreadCrumb } from 'primereact/breadcrumb';

const mainNav = [
  { label: 'Витрина компонентов', to: '/', icon: 'pi pi-th-large' },
  { label: 'Бакеты', to: '/buckets', icon: 'pi pi-database' },
];

const breadcrumbRoot = { icon: 'pi pi-home', url: '/' };

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface AppLayoutProps {
  breadcrumbTrail: BreadcrumbItem[];
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ breadcrumbTrail, children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    document.body.classList.contains('layout-theme-dark')
  );

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.remove('layout-theme-light');
      document.body.classList.add('layout-theme-dark');
    } else {
      document.body.classList.remove('layout-theme-dark');
      document.body.classList.add('layout-theme-light');
    }
  }, [isDarkTheme]);

  return (
    <div className="layout-wrapper" id="layoutwrapper">
      <aside className="layout-sidebar">
        <div className="layout-menu-container h-full">
          <div className="flex flex-column justify-content-between h-full">
            <NavLink to="/" className="layout-logo">
              <span style={{ fontWeight: 900, fontSize: '1.5rem' }}>Venom UIKit</span>
            </NavLink>
            <ul className="layout-menu h-full">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      classNames('router-link', isActive && 'router-link-exact-active')
                    }
                  >
                    <i className={item.icon} />
                    <span className="menuitem-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="layout-menu layout-menu-bottom">
              <ul className="layout-menu">
                <li>
                  <NavLink to="/about" className={({ isActive }) => classNames('router-link', isActive && 'router-link-exact-active')}>
                    <i className="pi pi-info-circle" />
                    <span className="menuitem-label">О программе</span>
                  </NavLink>
                </li>
                <li>
                  <a
                    href="#"
                    className="router-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDarkTheme((v) => !v);
                    }}
                  >
                    <i className={isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'} />
                    <span>{isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <div className="layout-main-container">
        <div className="layout-main">
          <div className="flex flex-row mb-3 sticky-menu">
            <BreadCrumb
              model={breadcrumbTrail}
              home={breadcrumbRoot}
              style={{
                background: 'var(--surface-card)',
                padding: '0.6rem',
                borderRadius: 3,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
