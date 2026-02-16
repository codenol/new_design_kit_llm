/**
 * Цветной бейдж со статусом
 *
 * @module StatusBadge
 */
import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import cl from 'classnames';

import { CODE_TO_VARIANT } from './statusBadgeMapping';
import './statusBadge.scss';

export interface StatusBadgeProps {
    /**
     * Код статуса для определения цвета бейджа
     */
    code: string;
    /**
     * Статус для отображения
     */
    name: string;
    /**
     * Флаг состояния обновления
     */
    isUpdating?: boolean;
    /**
     * CSS-класс.
     */
    className?: string;
    /**
     * Отключает отображение имени в бейдже
     */
    isSmall?: boolean;
    /**
     * Айдишник для тестирования
     */
    testid?: string;
}

function resolveVariantClasses(statusCode: string): string[] | undefined {
  return CODE_TO_VARIANT[statusCode];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ code, name, className, isSmall, isUpdating, testid }) => {
  const variantClasses = resolveVariantClasses(code);
  const sizeModifier = isSmall ? 'status-badge--small' : ' smooth-corners';

  if (isUpdating) {
    return (
      <>
        <span className={cl('status-badge', className)} data-testid={testid}>
          <Tooltip target=".custom-target-icon" />
          <ProgressSpinner
            className="custom-target-icon"
            style={{ width: '20px', height: '20px' }}
            strokeWidth="8"
            animationDuration="2s"
            data-pr-tooltip="Выполняется операция"
          />
        </span>
      </>
    );
  }

  return (
    <span
      className={cl('status-badge', sizeModifier, variantClasses, className)}
      data-testid={testid}
    >
      {isSmall ? null : name}
    </span>
  );
};
