import React, { ReactNode, useCallback, useId, useRef, useState } from 'react';

import { OverlayPanel } from 'primereact/overlaypanel';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { Button } from 'primereact/button';

import { SvgIcon } from '../SvgIcon';
import { CheckBoxRow } from './components';
import { TableColumnsConfigurationPassThrough } from './tableColumnsConfiguration.types';

import './tableColumnsConfiguration.scss';

export interface TableColumnsConfigurationProps {
    allColumns: { name: string; field: string }[];
    selectedColumnsNamesOnMount?: string[];
    selectAll?: boolean;
    selectAllTitle?: string;
    toggleButtonContent?: ReactNode;
    saveButton?: boolean;
    saveButtonContent?: ReactNode;
    onConfigurationSave?: (selectedColumnNames: string[]) => void;
    pt?: TableColumnsConfigurationPassThrough;
}

export const TableColumnsConfiguration = (props: TableColumnsConfigurationProps) => {
    const {
        allColumns,
        selectedColumnsNamesOnMount = [],
        selectAll = true,
        selectAllTitle = 'Все',
        toggleButtonContent = <SvgIcon name="settings" size={16} />,
        saveButton = true,
        saveButtonContent = 'Сохранить',
        onConfigurationSave,
        pt,
    } = props;

    const tableColumnsConfigurationId = useId();
    const [localSelectedColumnNames, setLocalSelectedColumnNames] = useState(selectedColumnsNamesOnMount);

    const settingOverlayRef = useRef<OverlayPanel>(null);

    const onCheckboxChange = useCallback((column, value) => {
        if (value) {
            setLocalSelectedColumnNames((prev) => [...prev, column]);
        } else {
            setLocalSelectedColumnNames((prev) => prev.filter((name) => name !== column));
        }
    }, []);

    const onConfigurationSaveHandler = () => {
        if (onConfigurationSave) onConfigurationSave(localSelectedColumnNames);
    };

    return (
        <div className="table-columns-configuration" style={{ paddingInline: '4px' }} {...pt?.root}>
            <Button
                onClick={(event) => settingOverlayRef.current?.toggle(event)}
                tooltip={'Настройки таблицы'}
                tooltipOptions={{
                    position: 'bottom',
                }}
                // TODO: нужно исключить onClick (так же и в типе TableColumnsConfigurationPassThrough)
                {...pt?.toggleButton}
            >
                {toggleButtonContent}
            </Button>
            <OverlayPanel
                ref={settingOverlayRef}
                className="table-columns-configuration-overlay-panel"
                // TODO: нужно исключить ref (так же и в типе TableColumnsConfigurationPassThrough)
                {...pt?.overlayPanel}
                onHide={() => {
                    if (pt?.overlayPanel?.onHide) {
                        pt.overlayPanel.onHide();
                    }
                    setLocalSelectedColumnNames(selectedColumnsNamesOnMount);
                }}
            >
                <div
                    className="table-columns-configuration-overlay-panel-checkboxes-container"
                    {...pt?.overlayPanel?.ListContainer}
                >
                    {selectAll && (
                        // TODO: добавить возможность передавать кастомный CheckBoxRow
                        <CheckBoxRow
                            title={selectAllTitle}
                            isSelected={allColumns.every((column) => localSelectedColumnNames.includes(column.field))}
                            onChange={(event) => {
                                if ((event as CheckboxChangeEvent).target.checked) {
                                    setLocalSelectedColumnNames(allColumns.map((column) => column.field));
                                } else {
                                    setLocalSelectedColumnNames([]);
                                }
                            }}
                            isSelectAll
                        />
                    )}
                    {allColumns.map((columns, index) => (
                        <CheckBoxRow
                            key={`${tableColumnsConfigurationId}-${index}`}
                            title={columns.name}
                            isSelected={localSelectedColumnNames.includes(columns.field)}
                            onChange={(event) => onCheckboxChange(columns.field, event.target.checked)}
                        />
                    ))}
                </div>

                {saveButton && (
                    <div
                        className="table-columns-configuration-overlay-panel-button-container"
                        {...pt?.overlayPanel?.SaveButtonContainer}
                    >
                        <Button outlined onClick={onConfigurationSaveHandler}>
                            {saveButtonContent}
                        </Button>
                    </div>
                )}
            </OverlayPanel>
        </div>
    );
};
