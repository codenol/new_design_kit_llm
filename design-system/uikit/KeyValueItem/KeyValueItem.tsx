import React, { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { SvgIcon } from '../SvgIcon';

import './keyValueItem.scss';

export const borderBottomStyle = '1px solid var(--surface-border)';

export interface IKeyValueItem {
    title: ReactNode;
    underline?: boolean;
    value?: ReactNode;
    description?: string;
    testid?: string;
    titleTestid?: string;
    valueTestid?: string;
}

export const KeyValueItem = ({
    title,
    underline = false,
    value,
    description,
    testid,
    titleTestid,
    valueTestid,
}: IKeyValueItem) => (
    <div className="key-value-item" style={{ borderTop: underline ? borderBottomStyle : 'unset' }} data-testid={testid}>
        <div className="key-value-item__inner-container">
            <div className="key-value-item__title-container" data-testid={titleTestid}>
                {title}
                {description && (
                    <Button
                        className="p-button-link p-0"
                        icon={<SvgIcon name={'info'} size="1rem" />}
                        tooltipOptions={{ position: 'right' }}
                        tooltip={description}
                        type="button"
                    />
                )}
            </div>
            {value || value === 0 ? (
                <div className="key-value-item__value-container" data-testid={valueTestid}>
                    {value}
                </div>
            ) : null}
        </div>
    </div>
);
