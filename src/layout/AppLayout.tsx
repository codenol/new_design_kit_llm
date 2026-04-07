import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import { BreadCrumb } from "primereact/breadcrumb";
import { Dialog } from "primereact/dialog";

const topSlotNav = [{ to: "/health-monitor", icon: "pi pi-th-large", label: "Модель здоровья" }];

type StubMenuItem = {
  label: string;
  icon: string;
};

type SidebarSection = {
  title?: string;
  items: StubMenuItem[];
};

const sidebarSections: SidebarSection[] = [
  {
    items: [
      { label: "Уведомления", icon: "pi pi-bell" },
      { label: "Статистика уведомлений", icon: "pi pi-chart-bar" },
    ],
  },
  {
    items: [{ label: "Дашборды", icon: "pi pi-th-large" }, { label: "Объекты", icon: "pi pi-sitemap" }],
  },
  {
    title: "Настройки",
    items: [
      { label: "Метрики", icon: "pi pi-wrench" },
      { label: "Правила оповещений", icon: "pi pi-book" },
      { label: "Конструктор выражений", icon: "pi pi-sliders-h" },
      { label: "Список получателей", icon: "pi pi-users" },
      { label: "Группы рассылки", icon: "pi pi-envelope" },
      { label: "Настройки отправки", icon: "pi pi-send" },
    ],
  },
  {
    title: "Безопасность",
    items: [
      { label: "Токены доступа", icon: "pi pi-key" },
      { label: "Ролевая модель", icon: "pi pi-user" },
    ],
  },
  {
    title: "Прочее",
    items: [{ label: "О программе", icon: "pi pi-info-circle" }],
  },
];

const breadcrumbRoot = { icon: "pi pi-home", url: "/" };

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface AppLayoutProps {
  breadcrumbTrail: BreadcrumbItem[];
  children: React.ReactNode;
  /** When true, the shell starts in light theme (layout-theme-light on body). */
  initialThemeLight?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  breadcrumbTrail,
  children,
  initialThemeLight = false,
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    initialThemeLight ? false : true,
  );
  const [stubModalItem, setStubModalItem] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.remove("layout-theme-light");
      document.body.classList.add("layout-theme-dark");
    } else {
      document.body.classList.remove("layout-theme-dark");
      document.body.classList.add("layout-theme-light");
    }
  }, [isDarkTheme]);

  return (
    <div className="layout-wrapper" id="layoutwrapper">
      <aside className="layout-sidebar">
        <div className="layout-sidebar-rail">
          <div className="layout-sidebar-rail-top">
            <button type="button" className="layout-rail-button">
              <i className="pi pi-lock" />
            </button>
            {topSlotNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  classNames(
                    "layout-rail-button",
                    isActive && "router-link-exact-active",
                  )
                }
              >
                <i className={item.icon} />
              </NavLink>
            ))}
          </div>
          <div className="layout-sidebar-rail-bottom">
            <button
              type="button"
              className="layout-rail-button"
              onClick={() => setIsDarkTheme((v) => !v)}
              title={isDarkTheme ? "Светлая тема" : "Тёмная тема"}
            >
              <i className={isDarkTheme ? "pi pi-sun" : "pi pi-moon"} />
            </button>
            <button type="button" className="layout-rail-avatar">
              AB
            </button>
          </div>
        </div>
        <div className="layout-sidebar-menu">
          <NavLink to="/health-monitor" className="layout-logo">
            <span>^геном 2.0</span>
          </NavLink>
          <ul className="layout-menu h-full">
            <li>
              <NavLink
                to="/health-monitor"
                className={({ isActive }) =>
                  classNames("router-link", isActive && "router-link-exact-active")
                }
              >
                <i className="pi pi-heart" />
                <span className="menuitem-label">Модель здоровья</span>
              </NavLink>
            </li>
            {sidebarSections.map((section) => (
              <React.Fragment key={section.title ?? section.items[0].label}>
                {section.title && (
                  <li className="layout-menuitem-category">
                    <span className="layout-menuitem-root-text">{section.title}</span>
                  </li>
                )}
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href="#"
                      className="router-link"
                      onClick={(event) => {
                        event.preventDefault();
                        setStubModalItem(item.label);
                      }}
                    >
                      <i className={item.icon} />
                      <span className="menuitem-label">{item.label}</span>
                    </a>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
          <div className="layout-menu layout-menu-bottom">
            <ul className="layout-menu">
              <li>
                <a
                  href="#"
                  className="router-link"
                  onClick={(event) => {
                    event.preventDefault();
                    setStubModalItem("Свернуть");
                  }}
                >
                  <i className="pi pi-chevron-left" />
                  <span className="menuitem-label">Свернуть</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="layout-main-container">
        <main className="layout-main">
          <div className="layout-main-stack">
            <div className="sticky-menu">
              <BreadCrumb
                model={breadcrumbTrail}
                home={breadcrumbRoot}
                className="layout-breadcrumb"
              />
            </div>
            {children}
          </div>
        </main>
      </div>
      <Dialog
        header="Раздел в разработке"
        visible={Boolean(stubModalItem)}
        style={{ width: "28rem" }}
        onHide={() => setStubModalItem(null)}
      >
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Раздел «{stubModalItem}» пока недоступен. Сейчас реализована только страница
          «Модель здоровья».
        </p>
      </Dialog>
    </div>
  );
};
