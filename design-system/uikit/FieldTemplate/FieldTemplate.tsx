import React, { CSSProperties, ReactNode } from 'react';
import InfoCircle from '../DataTableDynamic/fieldTemplate/infoTemplate';
import ValidationErrorTemplate from '../DataTableDynamic/fieldTemplate/validationErrorTemplate';

import './fieldTemplate.scss';

export type TTextErrorWrapperProps = { children: string };

export interface FieldTemplateProps {
    children?: ReactNode;
    /**
     * НЕ ТУЛТИП!!!
     * Поле описывает лейбл сверху над детьми компонента.
     */
    tooltipName?: string;
    /**
     * Текст тултипа.
     * При непустом значении около tooltipName появляется InfoCircle, содержащий tooltipText.
     */
    tooltipText?: string;
    /**
     * Контролирует визуализацию errorText.
     */
    isErrorShown?: boolean;
    /**
     * Лейбл с ошибкой под детьми компонента.
     */
    errorText?: string;
    /**
     * Враппер для errorText.
     *
     * @default ValidationErrorTemplate
     */
    ErrorTextWrapper?: (props: TTextErrorWrapperProps) => JSX.Element;
    /**
     * Контролирует визуализацию maxLengthErrorText.
     */
    maxLengthError?: boolean;
    /**
     * Лейбл с ошибкой максимальной длины ввода.
     *
     * Фактически не реализует проверку максимальной длины.
     *
     * @example Можно использовать как второй errorText без привязывания к длине ввода.
     */
    maxLengthErrorText?: string;
    /**
     * Враппер для maxLengthErrorText.
     */
    MaxLengthErrorTextWrapper?: (props: TTextErrorWrapperProps) => JSX.Element;
    /**
     * Стиль главного контейнера компонента.
     */
    style?: CSSProperties;
}

/**
 * Компонент, визуализирующий поле с пользовательским вводом на манер FormJSON.
 *
 * @еxample - Ниже находится диалог создания корзины с S3 Поля "Название" и "Владелец" сделаны на FieldTemplate, а остальное через FormJSON
 *
 * ![s3_buckets_dialog](https://sun9-71.userapi.com/s/v1/if2/zA3undkdqNelUk2d8r8gk3nKmQDpVSWl2kb79Pk_AN3nj1G6HOopT_KTfLyhrfR-qMNdMqf17uWfw5D65K-nrHJd.jpg?quality=95&as=32x20,48x30,72x44,108x67,160x99,240x148,360x222,480x296,540x333,640x395,720x444,780x481&from=bu&cs=780x0)
 *
 */
export const FieldTemplate = (props: FieldTemplateProps) => {
    const {
        children,
        tooltipName,
        tooltipText,
        errorText = '',
        ErrorTextWrapper = ValidationErrorTemplate,
        isErrorShown,
        maxLengthError,
        maxLengthErrorText = '',
        MaxLengthErrorTextWrapper = ValidationErrorTemplate,
        style,
    } = props;
    return (
        <div className="container" style={style}>
            <div className={tooltipText ? 'tooltip-container' : 'container-without-tooltip'}>
                <div>{tooltipName}</div>
                {tooltipText ? <InfoCircle link={true} tooltip={tooltipText} /> : null}
            </div>

            {children}
            {maxLengthError ? <MaxLengthErrorTextWrapper>{maxLengthErrorText}</MaxLengthErrorTextWrapper> : null}
            {maxLengthError && isErrorShown && (
                <div>
                    <br />
                </div>
            )}
            {isErrorShown ? <ErrorTextWrapper>{errorText}</ErrorTextWrapper> : null}
        </div>
    );
};
