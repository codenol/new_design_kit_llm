import { UniqueComponentId } from 'primereact/utils';
import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Не забываем добавить импорт из dragndrop.scss для работы с дефолтными стилями !!!
 */
export interface IDragNDropProps {
    /**
     * Массив перетаскиваемых объектов.
     */
    options: any[];
    /**
     * Темплейт для визуализации элеменов из options.
     * @description Пока template не указан, options будут рендерится как есть.
     */
    template?: (option: any, index: number) => ReactNode | HTMLElement;
    /**
     * Колбек, вызываемый компонентом после конца перетаскивания пользователем любого объекта из options.
     * @return onChange возвращает внутри себя перетасованный массив options.
     */
    onChange: (reorderedOptions) => void;
    /**
     * Айдишник элемента, в который будет добавлен передвигаемый элемент.
     * @defaultValue root
     */
    grabbedOptionParentId?: string;
    /**
     * Класс главного контейнера.
     * @defaultValue dnd-container
     */
    containerClassName?: string;
    /**
     * Стили главного контейнера.
     */
    containerStyle?: CSSProperties;
    /**
     * Класс перетаскиваемого компонента.
     * @defaultValue dnd-option
     */
    optionClassName?: string;
    /**
     * Стили перетаскиваемого элемента.
     */
    optionStyle?: CSSProperties;
    /**
     * Класс контейнера для хваталки.
     * @defaultValue dnd-grab-container
     */
    grabContainerClassName?: string;
    /**
     * Стили контейнера для хваталки.
     */
    grabContainerStyle?: CSSProperties;
    /**
     * Класс хваталки.
     * @defaultValuednd-grab-icon
     */
    grabIconClassName?: string;
    /**
     * Стили хваталки.
     */
    grabIconStyle?: CSSProperties;
    /**
     * Класс перетаскиваемого элемента.
     * @description Класс добавляется к существующему optionsClassName
     * @defaultValue dnd-grabbed-option
     */
    grabbedOptionClassName?: string;
    /**
     * Класс для свободного места от компонента, которого перетаскивают.
     * @description Класс добавляется к существующему optionsClassName
     * @defaultValue dnd-vacant-space
     */
    vacantSpaceClassName?: string;
    /**
     * Кастомная хваталка.
     */
    customGrabIcon?: ReactNode;
}

const defaultGrabIcon = (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M3.2 1.6C3.2 2.48366 2.48366 3.2 1.6 3.2C0.716344 3.2 0 2.48366 0 1.6C0 0.716344 0.716344 0 1.6 0C2.48366 0 3.2 0.716344 3.2 1.6Z"
            fill="currentColor"
        />
        <path
            d="M3.2 8C3.2 8.88366 2.48366 9.6 1.6 9.6C0.716344 9.6 0 8.88366 0 8C0 7.11634 0.716344 6.4 1.6 6.4C2.48366 6.4 3.2 7.11634 3.2 8Z"
            fill="currentColor"
        />
        <path
            d="M3.2 14.4C3.2 15.2837 2.48366 16 1.6 16C0.716344 16 0 15.2837 0 14.4C0 13.5163 0.716344 12.8 1.6 12.8C2.48366 12.8 3.2 13.5163 3.2 
            14.4Z"
            fill="currentColor"
        />
        <path
            d="M11.2 1.6C11.2 2.48366 10.4837 3.2 9.6 3.2C8.71634 3.2 8 2.48366 8 1.6C8 0.716344 8.71634 0 9.6 0C10.4837 0 11.2 0.716344 11.2 1.6Z"
            fill="currentColor"
        />
        <path
            d="M11.2 8C11.2 8.88366 10.4837 9.6 9.6 9.6C8.71634 9.6 8 8.88366 8 8C8 7.11634 8.71634 6.4 9.6 6.4C10.4837 6.4 11.2 7.11634 11.2 8Z"
            fill="currentColor"
        />
        <path
            d="M11.2 14.4C11.2 15.2837 10.4837 16 9.6 16C8.71634 16 8 15.2837 8 14.4C8 13.5163 8.71634 12.8 9.6 12.8C10.4837 12.8 11.2 13.5163 11.2 
            14.4Z"
            fill="currentColor"
        />
    </svg>
);

export const DragNDrop: React.FC<IDragNDropProps> = ({
    onChange,
    options,
    template,
    grabbedOptionParentId = 'root',
    containerClassName = 'dnd-container',
    containerStyle,
    optionClassName = 'dnd-option',
    optionStyle,
    grabContainerClassName = 'dnd-grab-container',
    grabContainerStyle,
    grabIconClassName = 'dnd-grab-icon',
    grabIconStyle,
    grabbedOptionClassName = 'dnd-grabbed-option',
    vacantSpaceClassName = 'dnd-vacant-space',
    customGrabIcon,
}) => {
    const moveRef = useRef<HTMLDivElement>(null);
    const refId = UniqueComponentId('drag-container-');
    const draggedElementId = `${refId}-draggable-`;
    const [uniqueKey, setUniqueKey] = useState('');
    const [copyOptions, setCopyOptions] = useState(options);

    // было: В случае, если размер options увеличился или уменьшился - ререндерим.
    // стало: в любом случае ререндерим тк сами options могут меняться
    useEffect(() => {
        setUniqueKey(UniqueComponentId('drag-draggedElement-'));
        setCopyOptions(options);
    }, [options]);

    // Смещение элемента внутри его братьев вверх или вниз (direction -1 или 1 соотв.).
    const moveChoiceTo = (elemChoice, direction) => {
        if (moveRef.current) {
            if (direction === -1 && elemChoice.previousElementSibling) {
                moveRef.current.insertBefore(elemChoice, elemChoice.previousElementSibling);
            } else if (direction === 1 && elemChoice.nextElementSibling) {
                moveRef.current.insertBefore(elemChoice, elemChoice.nextElementSibling.nextElementSibling);
            }
        }
    };

    // Метод для обработки перетаскивания выбранного элемента.
    const dragOption = (elmnt, downEvent) => {
        const rootElement = document.getElementById(grabbedOptionParentId) || moveRef.current;

        if (!rootElement) {
            return;
        }
        downEvent.preventDefault();

        const draggingPosition = {
            x: 0,
            y: 0,
            oldX: downEvent.clientX,
            oldY: downEvent.clientY,
        };

        const draggedElement = elmnt.cloneNode(true);
        const rect = elmnt.getBoundingClientRect();

        // На свякий подбиваем размеры копии под оригинал.
        draggedElement.style.width = rect.width + 'px';
        draggedElement.style.height = rect.height + 'px';

        // Добавляем копию выбранного элемента куда-нибудь повыше в дереве и позиционируем на место выбранного.
        rootElement.appendChild(draggedElement);
        draggedElement.style.top = rect.top + 'px';
        draggedElement.style.left = rect.left + 'px';

        // Копии навешиваем класс для перетаскиваемого компонента, а оригиналу для свободного места.
        draggedElement.classList.add(grabbedOptionClassName);
        elmnt.classList.add(vacantSpaceClassName);

        const moveDraggedElement = (e) => {
            e.preventDefault();

            // Расчитываем новое положение для копии.
            draggingPosition.x = draggingPosition.oldX - e.clientX;
            draggingPosition.y = draggingPosition.oldY - e.clientY;

            // Получаем положение оригинала и верхнюю/нижнюю границу копии.
            const currentElemPos = elmnt.getBoundingClientRect();
            const currentDragPos = {
                top: draggedElement.offsetTop - draggingPosition.y,
                bottom: draggedElement.offsetTop - draggingPosition.y + currentElemPos.height,
            };

            // Если копия может занять место снизу.
            if (
                elmnt.nextElementSibling &&
                currentDragPos.top > elmnt.nextElementSibling.getBoundingClientRect().bottom - currentElemPos.height
            ) {
                // Двигаем оригинал вниз.
                moveChoiceTo(elmnt, 1);
            }
            // Если копия может занять место сверху.
            else if (
                elmnt.previousElementSibling &&
                currentDragPos.bottom <
                    currentElemPos.bottom - elmnt.previousElementSibling.getBoundingClientRect().height
            ) {
                // Двигаем оригинал вверх.
                moveChoiceTo(elmnt, -1);
            }

            // Перемещаем копию на позицию курсора.
            draggingPosition.oldX = e.clientX;
            draggingPosition.oldY = e.clientY;
            draggedElement.style.top = draggedElement.offsetTop - draggingPosition.y + 'px';
            draggedElement.style.left = draggedElement.offsetLeft - draggingPosition.x + 'px';
        };

        // Навешиваем лисенеры на документ, чтоб копия двигалась при движении мышки и закончила после отпускания кнопки.
        document.onmouseup = () => closedragOption(refId);
        document.onmousemove = moveDraggedElement;

        const closedragOption = (containerId) => {
            // Чтоб срабатывало только на нынешнем контейнере.
            if (containerId !== refId || !moveRef.current) {
                return;
            }
            // Убираем лисенеры с документа, класс с оригинального компонента и перетаскиваемую копию из DOM'а.
            document.onmouseup = null;
            document.onmousemove = null;
            rootElement.removeChild(draggedElement);
            elmnt.classList.remove(vacantSpaceClassName);

            // Собираем новую последовательность из объектов options по тому, как они сейчас расставлены в дереве.
            const currentOrder: number[] = [];
            moveRef.current.childNodes.forEach((child) => {
                currentOrder.push(Number((child as HTMLDivElement).id.replace(draggedElementId, '')));
            });
            onChange?.(currentOrder.map((index) => copyOptions[index]));
        };
    };

    return (
        <div id={refId} ref={moveRef} className={containerClassName} style={containerStyle}>
            {copyOptions.map((option, index) => (
                <div
                    id={`${draggedElementId}${index}`}
                    key={`${uniqueKey}-draggable-${index}`}
                    className={optionClassName}
                    style={optionStyle}
                >
                    <div className={grabContainerClassName} style={grabContainerStyle}>
                        <div
                            className={grabIconClassName}
                            style={grabIconStyle}
                            onMouseDown={(e) => {
                                dragOption(document.getElementById(`${draggedElementId}${index}`), e);
                            }}
                        >
                            {customGrabIcon || defaultGrabIcon}
                        </div>
                    </div>
                    {template ? template(option, index) : option}
                </div>
            ))}
        </div>
    );
};
