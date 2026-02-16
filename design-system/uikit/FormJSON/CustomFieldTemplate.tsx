import React from 'react';
import { Button } from 'primereact/button';

const REQUIRED_FIELD_SYMBOL = '*';

export const CustomFieldTemplate = (props: any) => {
    // no used props hidden,required,classNames,readonly,onKeyChange,onDropPropertyClick,
    const {
        id,
        children,
        required,
        displayLabel,
        label,
        rawErrors = [],
        rawHelp,
        classNames,
        /* disabled, */
        uiSchema,
        schema,
    } = props;
    const isVisibleLabel =
        displayLabel &&
        label !== ' ' &&
        uiSchema?.['ui:options']?.label !== false &&
        uiSchema?.['ui:widget'] !== 'hidden';
    const dispReqSym =
        uiSchema?.['ui:options']?.requiredSymbol !== undefined
            ? uiSchema?.['ui:options']?.requiredSymbol
            : REQUIRED_FIELD_SYMBOL;
    const tooltip = schema.description;

    const warning = uiSchema?.['ui:warning'];

    return (
        <>
            <div /* disabled={disabled} */ className={classNames}>
                {isVisibleLabel ? (
                    <label htmlFor={id}>
                        {label}
                        {tooltip ? (
                            <Button
                                className="cursor-auto"
                                icon="pi pi-info-circle circle"
                                tabIndex={-1}
                                link={true}
                                tooltip={tooltip}
                                style={{ padding: '0px' }}
                                type="button"
                            />
                        ) : null}
                        {required && dispReqSym}
                        {rawHelp && (
                            <>
                                <Button
                                    className="p-button-link"
                                    style={{ padding: '1px 0 0 0' }}
                                    disabled
                                    tooltip={rawHelp}
                                    tooltipOptions={{
                                        showOnDisabled: true,
                                        style: {
                                            maxWidth: '400px',
                                        },
                                    }}
                                    icon="pi pi-info-circle"
                                />
                            </>
                        )}
                    </label>
                ) : null}
                {children}

                {warning && (
                    <div>
                        <span
                            id="username2-help"
                            className="p-warning-label block"
                            style={{ fontSize: '0.8rem', lineHeight: '0.95rem' }}
                        >
                            {warning}
                        </span>
                    </div>
                )}

                {rawErrors &&
                    rawErrors.length > 0 &&
                    rawErrors.map((error: any, i: any) => (
                        <div key={i}>
                            <span
                                id="username2-help"
                                className="p-error block"
                                style={{ fontSize: '0.8rem', lineHeight: '0.95rem' }}
                            >
                                {error}
                            </span>
                        </div>
                    ))}
            </div>
        </>
    );
};
