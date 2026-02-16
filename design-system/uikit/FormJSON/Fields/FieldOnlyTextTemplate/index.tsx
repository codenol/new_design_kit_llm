import React from 'react';
import type { FieldTemplateProps } from '@rjsf/utils';

export const FieldOnlyTextTemplate = (props: FieldTemplateProps) => {
    const { label, children, schema, uiSchema, rawErrors } = props;
    const isVisibleLabel = uiSchema?.['ui:options']?.label !== false && uiSchema?.['ui:widget'] !== 'hidden';

    if (schema.type && schema.type === 'object') {
        return (
            <div>
                {isVisibleLabel && (
                    <div style={{ fontSize: '1.2rem' }} className="mb-1 mt-3">
                        {label}
                    </div>
                )}
                {children}
            </div>
        );
    }

    return (
        <div>
            {isVisibleLabel && `${label}: `}
            <span style={rawErrors ? { color: 'var(--danger-color)' } : {}}>{children}</span>
            {rawErrors &&
                rawErrors.length > 0 &&
                rawErrors.map((error, i) => (
                    <div key={i}>
                        <span
                            id={`help-${i}`}
                            className="p-error block ml-3"
                            style={{ fontSize: '0.8rem', lineHeight: '0.95rem' }}
                        >
                            {`${error}`}
                        </span>
                    </div>
                ))}
        </div>
    );
};
