import React from 'react';
import type { ArrayFieldTemplateProps } from '@rjsf/utils';

export const ArrayFieldOnlyTextTemplate = (props: ArrayFieldTemplateProps) => (
    <div>
        {props.items.map((element, index) => (
            <div key={index}>{element.children}</div>
        ))}
    </div>
);
