import React, { useMemo } from 'react';
import type { ArrayFieldTemplateItemType } from '@rjsf/utils';
import { Button } from 'primereact/button';

export const ArrayFieldItemTemplate = (props: ArrayFieldTemplateItemType) => {
    const {
        children,
        className,
        hasMoveDown,
        hasMoveUp,
        hasRemove,
        onReorderClick,
        onDropIndexClick,
        index,
        disabled,
    } = props;

    const hideMove = props.uiSchema?.['ui:options']?.hideMove;
    const hideRemove = props.uiSchema?.['ui:options']?.hideRemove;

    const onRemoveClick = useMemo(() => onDropIndexClick(index), [index, onDropIndexClick]);

    const onArrowUpClick = useMemo(() => onReorderClick(index, index - 1), [index, onReorderClick]);

    const onArrowDownClick = useMemo(() => onReorderClick(index, index + 1), [index, onReorderClick]);

    return (
        <div className={className + ' flex'} style={{ alignItems: 'start' }}>
            <div style={{ width: '100%' }}>{children}</div>
            <div>
                <div style={{ visibility: 'hidden', marginBottom: '0.5rem' }}>&nbsp;</div>
                <div style={{ display: 'flex' }}>
                    {(hasMoveDown || hasRemove) && !hideMove && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {hasMoveUp && (
                                <Button
                                    outlined
                                    style={{
                                        marginLeft: '.3rem',
                                        padding: hasMoveDown ? '0px 0px 1px' : '0.6rem 1rem',
                                        color: 'var(--surface-border)',
                                        background: 'var(--surface-input)',
                                        borderRadius: hasMoveDown ? '3px 3px 0 0' : '3px',
                                    }}
                                    icon="pi pi-caret-up"
                                    severity="success"
                                    onClick={onArrowUpClick}
                                    disabled={disabled}
                                ></Button>
                            )}
                            {hasMoveDown && (
                                <Button
                                    outlined
                                    style={{
                                        margin: hasMoveUp ? '-1px 0 0 .3rem' : '0 0 0 .3rem',
                                        padding: hasMoveUp ? '0px 0px 1px' : '0.6rem 1rem',
                                        color: 'var(--surface-border)',
                                        background: 'var(--surface-input)',
                                        borderRadius: hasMoveUp ? '0 0 3px 3px' : '3px',
                                    }}
                                    icon="pi pi-caret-down"
                                    severity="secondary"
                                    onClick={onArrowDownClick}
                                    disabled={disabled}
                                ></Button>
                            )}
                        </div>
                    )}
                    {hasRemove && !hideRemove && (
                        <Button
                            outlined
                            icon="pi pi-trash"
                            style={{
                                marginLeft: '.3rem',
                                padding: '0.6rem 1rem',
                                color: 'var(--danger-color)',
                                background: 'var(--surface-input)',
                            }}
                            onClick={onRemoveClick}
                            disabled={disabled}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
