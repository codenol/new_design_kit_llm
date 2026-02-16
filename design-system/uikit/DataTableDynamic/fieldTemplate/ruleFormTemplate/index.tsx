import React from 'react';
import './index.scss';

interface RuleFormTemplateProps {
    children?: React.ReactNode;
    onClickAction?: (index: any) => void;
}

const RuleFormTemplate = (props: RuleFormTemplateProps) => {
    const { children, onClickAction } = props;
    return (
        <div className="rule-form-container">
            {children}
            <i
                onClick={onClickAction}
                className="pi pi-trash"
                style={{
                    fontSize: '22px',
                    marginLeft: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
            />
        </div>
    );
};

export default RuleFormTemplate;
