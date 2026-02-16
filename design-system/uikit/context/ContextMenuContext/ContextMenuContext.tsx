import { createContext } from 'react';
import type { MenuItem } from 'primereact/menuitem';

export interface IContextMenu {
    toggleContextMenu: (event: any, items: MenuItem[]) => void;
}

export const ContextMenuContext = createContext<IContextMenu>({
    toggleContextMenu: () => {
        console.log('no context');
    },
});
