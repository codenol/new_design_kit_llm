import React from 'react';
import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Button } from 'primereact/button';
import { IconInfoCircle } from '../../../IconsComponent';

export const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
    title,
    description,
    properties,
    uiSchema,
}: ObjectFieldTemplateProps) => (
    <div>
        {!(uiSchema?.['ui:options']?.label === false) && (
            <>
                {!!title && (
                    <h3
                        style={{
                            fontSize: '1.2rem',
                            marginBottom: '0.5rem',
                            lineHeight: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        {title}
                        {uiSchema?.['ui:options']?.tooltip ? (
                            <Button
                                className="p-button-link"
                                tooltip={uiSchema['ui:options']?.tooltip as string}
                                tooltipOptions={{ event: 'both', position: 'bottom' }}
                                icon={<IconInfoCircle />}
                                style={{
                                    backgroundColor: 'transparent',
                                    display: 'inline-flex',
                                    padding: 0,
                                    borderRadius: '6px',
                                    marginLeft: '0.35rem',
                                    width: 'fit-content',
                                }}
                                type="button"
                            />
                        ) : null}
                    </h3>
                )}
                {!!description && <p>{description}</p>}
            </>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {properties.map((element, index, arr) => {
                const num = index + 1;
                const col: number | undefined = uiSchema?.['ui:options']?.col as number | undefined;

                let isLast = num >= arr.length;

                if (col) {
                    let allObject = arr.length;
                    if (arr.length % col) {
                        allObject = arr.length - (arr.length % col);
                    } else {
                        allObject = arr.length - col;
                    }
                    isLast = num >= allObject;
                }

                return (
                    <div
                        key={element.content.key}
                        className={`property-wrapper col-0${col || ''} 
                    ${isLast ? 'property-wrapper--last' : ''} 
                    ${element.hidden ? 'property-wrapper--hidden' : ''}`}
                    >
                        {element.content}
                    </div>
                );
            })}
        </div>
    </div>
);
