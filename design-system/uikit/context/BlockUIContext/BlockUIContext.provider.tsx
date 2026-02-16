import React, { ReactNode, useState } from 'react';

import { BlockUI } from 'primereact/blockui';
import { ProgressSpinner } from 'primereact/progressspinner';
import { BlockUIContext } from '.';

export interface BlockUIProviderProps {
    children?: React.ReactNode;
    /**
     * @description Дефолтное наполнение контейнера
     * @default ProgressSpinner strokeWidth="8"
     */
    template?: React.ReactNode;
    /**
     * @description Дефолтный класс враппера
     * @default p-blockui
     */
    className?: string;
    /**
     * @description Заблокировать UI в момент маунта компонента
     * @default p-blockui
     */
    blockOnMount?: boolean;
}

export const BlockUIProvider: React.FC<BlockUIProviderProps> = ({
    children,
    template = <ProgressSpinner strokeWidth="8" />,
    className = 'p-blockui',
    blockOnMount = false,
}) => {
    const [blocker, setBlocker] = useState<{
        blocked: boolean;
        activeTemplate: ReactNode;
        activeClassName: string;
    }>({
        blocked: blockOnMount,
        activeTemplate: template,
        activeClassName: className,
    });

    const setUIblocked = (isBlocked: boolean, customTemplate?: ReactNode, customClassName?: string) => {
        setBlocker((prev) => ({
            blocked: isBlocked,
            activeTemplate: customTemplate || prev.activeTemplate,
            activeClassName: customClassName || prev.activeClassName,
        }));
    };

    const resetUIblocker = () => {
        setBlocker((prev) => ({
            ...prev,
            activeTemplate: template,
            activeClassName: className,
        }));
    };

    const memorizeUIblocker = (customTemplate?: ReactNode, customClassName?: string) => {
        setBlocker((prev) => ({
            ...prev,
            activeTemplate: customTemplate || prev.activeTemplate,
            activeClassName: customClassName || prev.activeClassName,
        }));
    };

    return (
        <BlockUIContext.Provider value={{ setUIblocked, resetUIblocker, memorizeUIblocker }}>
            <BlockUI
                blocked={blocker.blocked}
                fullScreen={true}
                template={blocker.activeTemplate}
                className={blocker.activeClassName}
            >
                {children}
            </BlockUI>
        </BlockUIContext.Provider>
    );
};
