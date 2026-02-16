import React, { forwardRef, memo } from 'react';
import { OverlayPanel, OverlayPanelProps } from 'primereact/overlaypanel';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { Message, MessageProps } from '../Message';

enum EMessageProps {
    'severity',
    'text',
    'label',
    'icon',
    'isDefaultLabelVisible',
}

export interface IOverlayMessage extends OverlayPanel {}

export interface OverlayMessageProps extends OverlayPanelProps, Pick<MessageProps, keyof typeof EMessageProps> {}

// eslint-disable-next-line react/display-name
export const OverlayMessage = memo(
    forwardRef<IOverlayMessage, OverlayMessageProps>((props, ref) => (
        <OverlayPanel ref={ref} {...omit(props, Object.keys(EMessageProps))}>
            <Message {...pick(props, Object.keys(EMessageProps))} pt={{}} />
        </OverlayPanel>
    ))
);
