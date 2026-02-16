import { createContext, ReactNode } from 'react';

export interface IBlockUI {
    setUIblocked: (state: boolean, customTemplate?: ReactNode, customClassName?: string) => void;
    resetUIblocker: () => void;
    memorizeUIblocker: (customTemplate?: ReactNode, customClassName?: string) => void;
}

export const BlockUIContext = createContext<IBlockUI>({
    setUIblocked: () => {
        console.log('no context');
    },
    resetUIblocker: () => {
        console.log('no context');
    },
    memorizeUIblocker: () => {
        console.log('no context');
    },
});
