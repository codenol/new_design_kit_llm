/**
 * Визард со списком шагов
 *
 * @module StepWizard
 */
import React, { CSSProperties, ReactNode, useMemo, useState } from 'react';

import classNames from 'classnames';

import { Button } from 'primereact/button';
import { WizardStep } from './components/WizardStep';
import { IconChevronCircle } from '../IconsComponent';

import './stepWizard.scss';

export interface IWizardStep {
    /**
     * Отображаемое название шага
     */
    name: string;
    /**
     * Флаг статуса загрузки шага
     */
    isLoading?: boolean;
    /**
     * Флаг активности шага
     */
    isActive?: boolean;
    /**
     * Флаг статуса готовности
     */
    isDone?: boolean;
    /**
     * Флаг статуса ошибки
     */
    isError?: boolean;
    /**
     * Флаг статуса предупреждения
     */
    isWarning?: boolean;
    /**
     * Контент, который отображается когда шаг активен
     */
    content?: ReactNode;
    /**
     * Обработчик события клика на шаг
     */
    onClick?: () => void;
    /**
     * Идентификатор для тестирования
     */
    testid?: string;
}

/**
 * Пропсы для компонента StepWizard
 */
export interface StepWizardProps {
    /**
     * Список шагов
     */
    steps: IWizardStep[];
    /**
     * Общий обработчик события клика на шаг
     */
    onStepClick?: (step: IWizardStep, index: number) => void;
    /**
     * Контент текущего шага
     */
    content?: ReactNode;
    /**
     * CSS-класс компонента
     */
    className?: string;
    /**
     * Инлайн-стили компонента
     */
    style?: CSSProperties;
    /**
     * Идентификатор для тестирования
     */
    testid?: string;
}

export const StepWizard = ({ steps, onStepClick, content, className, style, testid }: StepWizardProps) => {
    const [isStepsListWrapped, setIsStepListWrapped] = useState(false);

    const activeStep = useMemo(() => steps.find((step) => step.isActive), [steps]);

    return (
        <div className={classNames('step-wizard', className)} style={style} data-testid={testid}>
            <div
                className={classNames('step-wizard__steps', {
                    'step-wizard__steps_wrapped': isStepsListWrapped,
                })}
            >
                <div className="step-wizard__steps-list">
                    {steps?.map((step, index) => (
                        <WizardStep
                            name={isStepsListWrapped ? '' : step.name}
                            stepNumber={index + 1}
                            onClick={() => {
                                onStepClick?.(step, index);
                                step.onClick?.();
                            }}
                            isClickable={!!(onStepClick || step.onClick)}
                            isLoading={step.isLoading}
                            isActive={step.isActive}
                            isError={step.isError}
                            isWarning={step.isWarning}
                            isDone={step.isDone}
                            testid={step.testid}
                            key={index}
                        />
                    ))}
                </div>
                <div className="step-wizard__steps-footer">
                    <Button
                        onClick={() => setIsStepListWrapped((prev) => !prev)}
                        text={true}
                        icon={<IconChevronCircle />}
                        className="step-wizard__steps-wrapp-button"
                    >
                        {isStepsListWrapped ? null : 'Свернуть'}
                    </Button>
                </div>
            </div>
            <div className="step-wizard__content">{activeStep?.content || content}</div>
        </div>
    );
};
