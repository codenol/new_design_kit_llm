import React from 'react';

export interface CompanyProgressSpinnerProps {
    /**
     * @description Стиль контейнера.
     */
    style?: any;
    /**
     * @description Класс контейнера.
     * @default loader-wrapper
     */
    className?: string;
    /**
     * @description Размер в rem.
     * @default 10
     */
    size?: number;
    /**
     * @description Цвет горы.
     * @default --text-color
     */
    bgMountain?: string;
    /**
     * @description Цвет заливки.
     * @default --primary-color
     */
    bgSnow?: string;
    /**
     * @description Цвет контейнера.
     * @default --surface-card
     */
    bgWrapper?: string;
    props?: any;
}

export const CompanyProgressSpinner: React.FC<CompanyProgressSpinnerProps> = ({
    size = 10,
    style,
    className = 'loader-wrapper',
    bgMountain = 'var(--text-color)',
    bgSnow = 'var(--primary-color)',
    bgWrapper = 'var(--surface-card)',
    ...props
}) => (
    <div
        className={className}
        style={{
            width: `${size}rem`,
            height: `${size}rem`,
            padding: `${size * 0.2}rem`,
            background: bgWrapper,
            ...style,
        }}
        {...props}
    >
        <div className="loader-container">
            <div className="loader-mountain" style={{ background: bgMountain }}>
                <div className="loader-snow" style={{ background: bgSnow }}>
                    <div className="loader-snow-particle-2" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-1" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-2" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-1" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-2" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-1" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-2" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-1" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-2" style={{ background: bgSnow }} />
                    <div className="loader-snow-particle-1" style={{ background: bgSnow }} />
                </div>
            </div>
        </div>
    </div>
);
