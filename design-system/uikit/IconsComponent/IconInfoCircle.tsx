import React from 'react';
import { TIconComponentProps } from './IconsComponent.types';

export const IconInfoCircle = ({ color }: TIconComponentProps) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9 8.2a.8.8 0 0 0-.8.8v3.2a.8.8 0 1 0 1.6 0V9a.8.8 0 0 0-.8-.8m.304-3.136a.8.8 0 0 0-.608 0 .8.8 0 0 0-.264.168.9.9 0 0 0-.168.264.8.8 0 0 0 .168.872.9.9 0 0 0 .264.168A.8.8 0 0 0 9.8 5.8a.84.84 0 0 0-.232-.568.8.8 0 0 0-.264-.168M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1m0 14.4A6.4 6.4 0 1 1 9 2.6a6.4 6.4 0 0 1 0 12.8"
            fill={color || 'currentColor'}
        />
    </svg>
);
