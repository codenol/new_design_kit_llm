// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * Карточка с хлебными крошками.
 * Обёртка над 'primereact/breadcrumb'.
 *
 * @module CustomBreadCrumb
 */
import React from 'react';
import { Link } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import { BreadCrumb } from 'primereact/breadcrumb';
import type { BreadcrumbsRoute } from 'use-react-router-breadcrumbs';

import { SvgIcon } from '../SvgIcon';

import './breadcrumbs.scss';

export interface CustomBreadCrumbProps {
    /**
     * Список роутов.
     */
    router: BreadcrumbsRoute<string>[];
    /**
     * Элменент в правом конце карточки.
     */
    action?: string | JSX.Element | JSX.Element[];
    /**
     * Список путей, которые будут пропущены при формировании крошек.
     */
    excludePaths?: string[];
    /**
     * Проп для изменения стандартной ссылки на главную страницу.
     */
    home?: {
        /**
         * Иконка ссылки на главную страницу.
         */
        icon?: JSX.Element;
        /**
         * Ссылка на главную страницу.
         */
        url?: string;
    };
}

/**
 * Кастомный компонент хлебных крошек внутри карточки.
 */
export const CustomBreadCrumb: React.FC<CustomBreadCrumbProps> = ({ router, action, excludePaths = [], home }) => {
    // Получение списка хлебных крошек на основе роутера
    const breadcrumbs = useBreadcrumbs(router, { excludePaths: ['/', ...excludePaths] });
    // Формирование модели, подходящей для primereact/breadcrumb
    const breadcrumbsModel: object[] = breadcrumbs.map(({ breadcrumb, match }) => ({
        label: breadcrumb,
        url: match.pathname,
        template: (item) => tmpLinkBreadCrumb(item),
    }));

    // Стандартные параметры ссылки на главную страницу
    const homeDefault = { icon: <SvgIcon className={'pr-color'} name={'home'} size="1rem" />, url: '/' };
    // Шаблон отдельных элементов хлебной крошки
    const tmpLinkBreadCrumb = (item: { url: string; label: string }) => (
        <Link className="p-menuitem-link custom-breadcrumb__link" to={item.url}>
            <span className="p-menuitem-text">{item.label}</span>
        </Link>
    );

    return (
        <div className="custom-breadcrumb">
            <BreadCrumb
                model={breadcrumbsModel}
                home={{ ...homeDefault, ...home }}
                className={'flex-grow-1 custom-breadcrumb__control'}
            />
            {action}
        </div>
    );
};
