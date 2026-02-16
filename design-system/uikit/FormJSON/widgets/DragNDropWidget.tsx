import React, { useEffect, useState, useRef } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { Button } from 'primereact/button';
import { v4 as uuidv4 } from 'uuid';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FormJSON } from '../index';
import { useConfirmDialog } from '../../hook/useConfirmDialog';
import { DragNDrop } from '../../DragNDrop';

import '../../DragNDrop/dragndrop.scss';
/**
 * DragNDropWidget — компонент для отображения и управления перетаскиваемыми элементами.
 * Поддерживает как массив объектов, так и текстовые массивы.
 *
 * Указывать в formSchema следующим образом:
 * uiSchema: {
 *      layout:{
 *          'ui:widget': 'DragNDrop',
 *          ...
 *      }
 *  }
 * layout: {
 *      title: '',
 *      type: 'array',
 *      items: {
 *          type: 'object',
 *          uiSchema:{   }
 *        },
 *        properties: {
 *        },
 *    },
 * },
 *
 * или если массив текстовый примитивный
 * uiSchema: {
 *    layout:{
 *        'ui:widget': 'DragNDrop',
 *        'ui:readonly': true
 *    }
 *},
 *properties: {
 *    layout: {
 *        title: 'Разделы',
 *        type: 'array',
 *        items: {
 *            type: 'string',
 *        },
 *    },
 *},

 * Поддерживаемые опции в uiSchema:
 * - 'ui:options': {
 *     header: string; // Заголовок
 *     obj_id: string; // Поле, используемое как уникальный идентификатор объекта (по умолчанию 'id')
 *     fieldsToShow: Array<{ field: string, prefix?: string, body?: Function }>; // Поля для отображения в строках
 *     showAdditionalInfo: Array<string>; // Поля для отображения в info кнопке через OverlayPanel
 *   }
 * -  'ui:writeonly' : boolean // возможность только редактирования опций массива, без возможности удаления
 * -  'ui:readonly' : boolean // возможность только чтения опций массива, без возможности редактирования и удаления
 */
interface CustomWidgetProps extends WidgetProps {
    schema: any;
}

export const DragNDropWidget = ({ id, value, onChange, onBlur, uiSchema, options, schema }: CustomWidgetProps) => {
    const [items, setItems] = useState<any[]>(value || []);
    const formSubmitDragNDrop = React.useRef<HTMLButtonElement>(null);
    const { confirmInfo, hide } = useConfirmDialog();

    const isWriteOnly = uiSchema?.['ui:writeonly'];
    const isReadOnly = uiSchema?.['ui:readonly'];
    const header: string = (uiSchema?.['ui:options']?.header as string) ?? '';
    const objID: string = (uiSchema?.['ui:options']?.obj_id as string) ?? 'id';
    const emptyValue = options.emptyValue || [];

    /**
     * OverlayPanel для отображения дополнительной информации.
     * Каждому элементу назначается свой ref.
     */
    const showAdditionalInfoFields = uiSchema?.['ui:options']?.showAdditionalInfo as [];
    const overlayPanels = useRef<Map<string, any>>(new Map());
    const createOverlayPanelRef = (itemId: string) => {
        if (!overlayPanels.current.has(itemId)) {
            overlayPanels.current.set(itemId, React.createRef());
        }
        return overlayPanels.current.get(itemId);
    };

    useEffect(() => {
        if (items.length > 0) {
            onChange(items);
            setTimeout(() => {
                onBlur(id, items);
            }, 0);
        } else {
            onChange(emptyValue);
        }
    }, [items]);

    const handleReorder = (newOrder: any[]) => {
        setItems(newOrder);
        onChange(newOrder);
        setTimeout(() => onBlur(id, newOrder), 0);
    };

    const clickNewOrEditElem = (formDataEdit?: any) => {
        confirmInfo({
            header: (formDataEdit ? 'Изменение ' : 'Добавление ') + header,
            acceptLabel: formDataEdit ? 'Изменить' : 'Добавить',
            style: { width: 800 },
            message: (
                <FormJSON
                    formSchema={schema.items}
                    formInitialData={formDataEdit}
                    onSubmitForm={(data) => {
                        if (data[objID]) {
                            setItems((prev) =>
                                prev.map((item) => (item[objID] === data[objID] ? { ...item, ...data } : item))
                            );
                        } else {
                            const getId = uuidv4();
                            setItems((prev) => [...prev, { ...data, [objID]: getId }]);
                        }
                        hide();
                    }}
                >
                    <button ref={formSubmitDragNDrop} type="submit" hidden></button>
                </FormJSON>
            ),
            acceptCb: () => {
                formSubmitDragNDrop.current?.click();
            },
        });
    };

    const confirmDeleteNode = (rowData: any) => {
        confirmInfo({
            severity: 'info',
            header: `Подтверждение удаления ${header || 'объекта'}`,
            acceptLabel: 'Удалить',
            actionClass: 'alert',
            style: { width: 800 },
            message: 'Вы уверены, что хотите удалить этот элемент?',
            acceptCb: () => {
                setItems((prev) => [...prev.filter((val) => val.id !== rowData.id)]);
                hide();
            },
        });
    };

    /**
     * Шаблон для действия над элементом (редактирование, удаление, дополнительная информация).
     */
    const actionBodyTemplate = (rowData) => {
        const op = createOverlayPanelRef(rowData.id);
        return (
            <>
                {showAdditionalInfoFields && (
                    <>
                        <Button
                            type="button"
                            icon="pi pi-info-circle"
                            className="p-button-text mr-2"
                            onClick={(e) => {
                                op.current?.toggle(e);
                            }}
                        />
                        <OverlayPanel className="tooltip" ref={op}>
                            <div>
                                {showAdditionalInfoFields.map((item) => (
                                    <>
                                        <span key={rowData[item]}>{` ${item}: ${rowData[item] ?? ' - '}`}</span>
                                        <br></br>
                                    </>
                                ))}
                            </div>
                        </OverlayPanel>
                    </>
                )}
                <i
                    className={`pi pi-pencil edit-icon ${!isReadOnly ? 'visible' : 'hidden'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        clickNewOrEditElem(rowData);
                    }}
                ></i>
                <i
                    className={`pi pi-trash delete-icon ${!isWriteOnly && !isReadOnly ? 'visible' : 'hidden'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        confirmDeleteNode(rowData);
                    }}
                />
            </>
        );
    };
    /**
     * Генерация столбцов для отображения полей объекта.
     */
    const generateColumns = (fields: any[], item: any) =>
        fields.map((field, fieldIndex) => {
            const fieldValue =
                field.showByKeyObject && item[field.field]
                    ? item[field.field][field.showByKeyObject]
                    : item[field.field];
            const columnsCount = fields.length || 1;
            const style = {
                '--columns-count': columnsCount,
            } as React.CSSProperties;
            return (
                <div key={fieldIndex} className="dragndrop-column" style={style}>
                    {field.prefix && <span>{field.prefix}</span>}
                    <span>{field.body ? field.body(item[field.field]) : fieldValue ?? ''}</span>
                </div>
            );
        });

    const renderItem = (item: any, index: number) => {
        // Если элемент — примитив (например, строка или число)
        if (typeof item !== 'object') {
            return (
                <div className="dragndrop-item" key={index}>
                    <span>{item}</span>
                    {actionBodyTemplate(item)}
                </div>
            );
        }
        // Если элемент — объект
        const fields = uiSchema?.['ui:options']?.fieldsToShow
            ? uiSchema?.['ui:options']?.fieldsToShow
            : uiSchema?.['ui:options']?.fields || [];
        return (
            <div className="dragndrop-item" key={item[objID]}>
                <div className="dragndrop-columns">{generateColumns(fields as any, item)}</div>

                {actionBodyTemplate(item)}
            </div>
        );
    };
    return (
        <div id={id}>
            <DragNDrop
                options={items}
                onChange={handleReorder}
                template={(option, index) => renderItem(option, index)}
                containerClassName="dnd-container"
                optionClassName="dnd-option"
            />

            {!isReadOnly && (
                <div className="table-header">
                    <div className="flex align-items-start justify-content-center">
                        <Button
                            type="button"
                            className="add-button dragndrop-add-btn"
                            icon="pi pi-plus p-button-icon-left"
                            onClick={() => {
                                clickNewOrEditElem();
                            }}
                        >
                            Добавить
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
