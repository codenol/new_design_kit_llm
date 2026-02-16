/**
 * Единая обвязка для всех провайдеров uikit'а
 *
 * @module UIkitProvider
 */
import React from 'react';
import { AbsoluteTooltip, IAbsoluteTooltipProps } from '../AbsoluteTooltip';

import { ToastProvider } from '../context/ToastContext';
import { BlockUIProvider, BlockUIProviderProps } from '../context/BlockUIContext';
import { ContextMenuProvider } from '../context/ContextMenuContext';
import { ConfirmDialogProvider } from '../context/ConfirmDialogContext';
import { usePrimeReactSettings } from '../hook/usePrimeReactSettings';

export interface UIkitProviderProps extends React.PropsWithChildren {
    /**
     * @description Параметры для BlockUI провайдера
     * @default undefined
     */
    blockUIParams?: Omit<BlockUIProviderProps, 'children'>;
    /**
     * @description Добавлять ли в провайдер абсолютный тултип.
     * @default false
     */
    withAbsoluteTooltip?: boolean;
    /**
     * @description Пропсы абсолютного тултипа. (Только если параметр withAbsoluteTooltip = true)
     */
    absoluteTooltipProps?: IAbsoluteTooltipProps;
}

export const UIkitProvider: React.FC<UIkitProviderProps> = (props) => {
    const { children, blockUIParams: blockConfig, withAbsoluteTooltip: showTooltip = false, absoluteTooltipProps: tooltipConfig } = props;
    usePrimeReactSettings();

    return (
        <>
            <ToastProvider>
                <BlockUIProvider {...blockConfig}>
                    <ContextMenuProvider>
                        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
                    </ContextMenuProvider>
                </BlockUIProvider>
            </ToastProvider>
            {showTooltip && <AbsoluteTooltip {...tooltipConfig} />}
        </>
    );
};
