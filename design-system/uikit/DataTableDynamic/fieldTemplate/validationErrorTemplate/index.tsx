import React, { memo } from 'react';
import './index.scss';

interface validationErrorProps {
    children: React.ReactNode;
}

const validationErrorTemplate = (props: validationErrorProps) => {
    const { children } = props;
    return <div className="validation-error">{children}</div>;
};

export default memo(validationErrorTemplate);
