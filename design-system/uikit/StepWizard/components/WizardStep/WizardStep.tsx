/**
 * Компонент шага визарда
 *
 * @module WizardStep
 */
import React from 'react';

import { ProgressSpinner } from 'primereact/progressspinner';

import classNames from 'classnames';

import './wizardStep.scss';

interface WizardStepProps {
    name: string;
    stepNumber: string | number;
    onClick: () => void;
    isClickable: boolean;
    isLoading?: boolean;
    isDone?: boolean;
    isActive?: boolean;
    isError?: boolean;
    isWarning?: boolean;
    testid?: string;
}

export const WizardStep = ({
    name,
    stepNumber,
    isClickable,
    onClick,
    isLoading,
    isDone,
    isActive,
    isError,
    isWarning,
    testid,
}: WizardStepProps) => (
    <div
        className={classNames('wizard-step', {
            'wizard-step_clickable': isClickable,
            'wizard-step_done': isDone,
            'wizard-step_processing': isActive,
            'wizard-step_error': isError,
            'wizard-step_warning': isWarning,
        })}
        onClick={onClick}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                onClick();
            }
        }}
        tabIndex={isClickable ? 0 : -1}
        data-testid={testid}
    >
        <span className="wizard-step__number">
            {stepNumber}
            {isLoading ? (
                <ProgressSpinner strokeWidth="5" animationDuration="2s" className="wizard-step__spinner" />
            ) : null}
        </span>
        {name ? <span className="wizard-step__name">{name}</span> : null}
    </div>
);
