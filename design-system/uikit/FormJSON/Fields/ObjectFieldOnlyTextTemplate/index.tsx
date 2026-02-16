import React from 'react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

export const ObjectFieldOnlyTextTemplate = (props: ObjectFieldTemplateProps) => (
    <>
        {props.properties.map((element, index) => (
            <div key={`${props.properties[0].content.key}${index}`}>{element.content}</div>
        ))}
    </>
);
