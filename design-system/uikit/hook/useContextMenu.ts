import { useContext } from 'react';
import { ContextMenuContext } from '../context/ContextMenuContext';

export const useContextMenu = () => useContext(ContextMenuContext);
