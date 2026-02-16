import React, { CSSProperties } from 'react';
import { getSvgSpritePath } from '../app/app.settings';

export interface ISvgIcon {
    name: string;
    color?: string;
    size?: string | number;
    height?: string | number;
    viewBox?: string;
    className?: string;
    style?: CSSProperties;
}

export const SvgIcon: React.FC<ISvgIcon> = ({
    name,
    color = 'currentColor',
    size = 18,
    viewBox = '0 0 32 32',
    style,
    ...props
}) => (
    <svg style={style} {...props} width={size} viewBox={viewBox} fill={color}>
        <use href={`${getSvgSpritePath()}#${name}`} />
    </svg>
);
