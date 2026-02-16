import React, { useRef, useState } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { Menu } from 'primereact/menu';

import { ContextMenuContext } from './ContextMenuContext';

/**
 * Провайдер для контекстного меню.
 * В зависимости от типа приходящего ивента показывает или Menu (click - ЛКМ), или ContextMenu (contextmenu - ПКМ)
 */
export const ContextMenuProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const contextMenuRef = useRef<any>(null);
    const menuRef = useRef<any>(null);
    const [menuItems, setMenuItems] = useState<any>([]);

    const toggleContextMenu = (event, items) => {
        setMenuItems(items);

        if (event.type === 'click') {
            contextMenuRef?.current?.hide(event);
            menuRef.current.toggle(event);
        }
        if (event.type === 'contextmenu') {
            menuRef.current.hide(event);
            contextMenuRef?.current?.show(event);
        }
    };

    return (
        <ContextMenuContext.Provider value={{ toggleContextMenu }}>
            <Menu model={menuItems} popup className="p-spectrum-menu" ref={menuRef} />
            <ContextMenu ref={contextMenuRef} model={menuItems} className="p-spectrum-menu" />
            {children}
        </ContextMenuContext.Provider>
    );
};
