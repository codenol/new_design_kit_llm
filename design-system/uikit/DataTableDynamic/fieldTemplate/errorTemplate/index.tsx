import React, { memo, ReactNode } from 'react';
import './index.scss';

interface ErrorTemplateProps {
    children: ReactNode;
}

const ErrorTemplate = (props: ErrorTemplateProps) => {
    const { children } = props;
    return <div className="error-template">{children}</div>;
};

export default memo(ErrorTemplate);
