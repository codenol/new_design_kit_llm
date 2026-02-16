import React, { memo, ReactNode } from 'react';
import './index.scss';

interface SuccessTemplateProps {
    children: ReactNode;
}

const SuccessTemplate = (props: SuccessTemplateProps) => {
    const { children } = props;
    return <div className="successTemplate">{children}</div>;
};

export default memo(SuccessTemplate);
