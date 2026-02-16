import { HTMLAttributes } from 'react';

import { ButtonProps } from 'primereact/button';
import { OverlayPanelProps } from 'primereact/overlaypanel';

export interface TableColumnsConfigurationListItemPassThrough extends HTMLAttributes<HTMLDivElement> {}

export interface TableColumnsConfigurationPassThrough {
    root?: HTMLAttributes<HTMLDivElement>;
    toggleButton?: ButtonProps;
    overlayPanel?: OverlayPanelProps & {
        ListContainer?: HTMLAttributes<HTMLDivElement> & {
            ListSelectAllItem?: HTMLAttributes<HTMLDivElement> & {
                ListSelectAllItemLabel?: HTMLAttributes<HTMLDivElement>;
            };
            ListItem?: HTMLAttributes<HTMLDivElement> & {
                ListItemLabel?: HTMLAttributes<HTMLDivElement>;
            };
        };
        SaveButtonContainer?: HTMLAttributes<HTMLDivElement> & {
            overlayPanelSaveButton?: ButtonProps;
        };
    };
}
