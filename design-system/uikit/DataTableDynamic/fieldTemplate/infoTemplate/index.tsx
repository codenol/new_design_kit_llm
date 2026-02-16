import React, { memo } from 'react';
import './index.scss';
import { Button } from 'primereact/button';

interface InfoCircleProps {
    tooltip?: string;
    link?: boolean;
    tooltipOptions?: any;
}

const InfoCircle = (props: InfoCircleProps) => {
    const { tooltip, tooltipOptions, link } = props;
    return (
        <div className="flex align-items-center p-button-icon-only info-circle-wrapper">
            <Button
                className="cursor-auto"
                icon="pi pi-info-circle circle"
                tabIndex={-1}
                link={link}
                tooltip={tooltip}
                tooltipOptions={tooltipOptions}
            />
        </div>
    );
};

export default memo(InfoCircle);
