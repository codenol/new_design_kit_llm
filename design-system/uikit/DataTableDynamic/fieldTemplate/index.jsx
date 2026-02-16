import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { StatusBadge } from '../../StatusBadge';
import { getFormatDate } from '../../app';

export const linkNameTemplate = (link, rowData, column) => {
    const item = rowData[column.field];
    let id = null;
    let name = null;
    let desc = null;

    if (typeof item === 'object') {
        id = item?.id;
        name = item.name;
        desc = item?.description;
    } else {
        id = rowData.id;
        name = rowData.name;
        desc = rowData.description;
    }

    if (item.type) {
        switch (item.type) {
            case 'SERVICE':
                link = 'services';
                break;
            case 'NODE':
                link = 'nodes';
                break;
            case 'CLUSTER':
                link = 'clusters';
                break;
            default:
                break;
        }
    }

    return (
        <>
            {id ? <Link to={`/${link}${id ? '/' + id : ''}`}>{name}</Link> : name}

            {desc && (
                <Button
                    className="p-button-link"
                    style={{ padding: '2px' }}
                    type="link"
                    icon="pi pi-info-circle"
                    tooltipOptions={{ position: 'right', event: 'focus hover' }}
                    tooltip={desc}
                />
            )}
        </>
    );
};

export const statusBodyTemplate = (rowData, column) => {
    const itemsStatus = rowData[column.field];

    return (
        <StatusBadge
            key={itemsStatus.code}
            className={'mr-2 w-12 text-center'}
            code={itemsStatus.code}
            name={itemsStatus.name}
            isUpdating={itemsStatus.is_updating}
        />
    );
};

export const FormatDate = (rowData, column, options = {}) => {
    const cellData = rowData?.[column.field]?.replace('Z', '+0000');
    const setSettingsformatDate = getFormatDate();

    if (!cellData) {
        return '-';
    }

    const date =
        setSettingsformatDate || options.ignoreTimezone ? new Date(cellData.split('+')[0]) : new Date(cellData);

    const dateString = date.toLocaleDateString('ru-ru', {
        year: options.withoutYear ? undefined : 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    if (options.withoutComma) {
        return dateString.replace(',', '');
    }

    return dateString;
};

export const sumStatusBodyTemplate = (rowData, column) => {
    const itemsStatus = rowData[column.field].map((item) => {
        const key = Object.keys(item)[0];
        return <StatusBadge key={key} className={'mr-2'} code={key} name={item[key]} />;
    });
    return itemsStatus;
};
