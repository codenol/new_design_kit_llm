import React from 'react';
import { TIconComponentProps } from './IconsComponent.types';

export const IconAcceptCircle = ({ color }: TIconComponentProps) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9 1a8 8 0 1 1 0 16A8 8 0 0 1 9 1m0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13m3.751 3.44a.75.75 0 0 1 1.101 1.006l-.048.06-4.885 5.35a1.25 1.25 0 0 1-1.74.104l-.097-.094-3.13-3.354-.05-.059a.75.75 0 0 1 1.091-1.017l.056.052 2.945 3.157 4.702-5.15z"
            fill={color || 'currentColor'}
        />
    </svg>
);
