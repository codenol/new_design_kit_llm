/**
 * Главный компонент формы, построенной на основе JSON Schema (rjsf).
 * Использует кастомные виджеты, шаблоны, валидацию и поддерживает деление формы на страницы.
 *
 * @module FormJSON
 */
import React, { useRef, useState, useEffect, ReactNode, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Form from '@rjsf/core';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import get from 'lodash/get';
import has from 'lodash/has';
import unset from 'lodash/unset';
import { customizeValidator } from '@rjsf/validator-ajv8';
import ruLocalizer from 'ajv-i18n/localize/ru';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { RJSFSchema, ErrorSchema, WidgetProps, CustomValidator } from '@rjsf/utils';
import { Messages, IMessages } from '../Messages';

// Импорты кастомных виджетов
import { transformErrors } from './utils/transformErrors';
import { FileWidget } from './widgets/FileWidget';
import { TimeWidget } from './widgets/TimeWidget';
import { SelectWidget } from './widgets/SelectWidget';
import { DateTimeWidget } from './widgets/DateTimeWidget';
import { CheckboxWidget } from './widgets/CheckboxWidget';
import { CheckboxesWidget } from './widgets/CheckboxesWidget';
import { TextareaWidget } from './widgets/TextareaWidget';
import { DropdownWidget } from './widgets/DropdownWidget';
import { TextWidget } from './widgets/TextWidget';
import { URLWidget } from './widgets/URLWidget';
import { ChipsWidget } from './widgets/ChipsWidget';
import { TableArrayWidget } from './widgets/TableArrayWidget';
import { TableArraySelectWidget } from './widgets/TableArraySelectWidget';
import { PasswordWidget } from './widgets/PasswordWidget';
import { SelectButtonWidget } from './widgets/SelectButtonWidget';
import { DragNDropWidget } from './widgets/DragNDropWidget';

// Импорты кастомных шаблонов
import { CustomFieldTemplate } from './CustomFieldTemplate';
import { ObjectFieldTemplate } from './Fields/ObjectFieldTemplate';
import { FieldOnlyTextTemplate } from './Fields/FieldOnlyTextTemplate';
import { ObjectFieldOnlyTextTemplate } from './Fields/ObjectFieldOnlyTextTemplate';
import { ArrayFieldOnlyTextTemplate } from './Fields/ArrayFieldOnlyTextTemplate';
import { ArrayFieldItemTemplate } from './Fields/ArrayFieldItemTemplate';
import { ArrayFieldTemplate } from './Fields/ArrayFieldTemplate';
import { TableField } from './Fields/TableField';

// Вспомогательные утилиты
import { isVisible } from '../utils/isVisible';

/**
 * @interface IFormJSON
 */
export interface IFormJSON {
    /**
     * Уникальный идентификатор формы. Используется для генерации ID полей.
     * По умолчанию: `'myform'`
     */
    id?: string;

    /**
     * Разделитель для ID полей (например, `'-'` или `'_'`).
     * Используется при формировании идентификаторов вложенных полей.
     * По умолчанию: `'-'`
     */
    idSeparator?: string;

    /**
     * JSON-схема, описывающая структуру и правила валидации формы.
     */
    formSchema: RJSFSchema;

    /**
     * Начальные данные формы. Могут быть пустыми или содержать предзаполненные значения.
     */
    formInitialData?: object;

    /**
     * Асинхронная функция валидации формы.
     * ИСПОЛЬЗУЕТСЯ СПЕЦИФИЧНО ДЛЯ СПЕКТРА.
     *
     * @param formData - текущие данные формы.
     * @param id - идентификатор.
     * @returns Promise с результатом валидации.
     */
    onValidationForm?: (formData: any, id: Iid) => Promise<IonValidationForm>;

    /**
     * Флаг: автоматически отправлять форму после успешной валидации.
     * ИСПОЛЬЗУЕТСЯ СПЕЦИФИЧНО ДЛЯ СПЕКТРА.
     */
    submitOnValidationSuccess?: boolean;

    /**
     * Обработчик отправки формы. Вызывается при завершении всех этапов ввода.
     *
     * @param formData - данные формы.
     * @param msgsErrors - ссылка на элемент отображения ошибок (`Messages` из UIKit).
     */
    onSubmitForm: (formData: any, msgsErrors: any) => void;

    /**
     * Дочерние элементы React — обычно кнопки действий, которые будут отображены
     * в футере формы.
     */
    children?: ReactNode;

    /**
     * Флаг: находится ли форма внутри модального окна (`Dialog`).
     * Влияет на рендеринг кнопок.
     */
    isOpenDialog?: boolean;

    /**
     * Текст на кнопке отправки формы.
     */
    submitLabel?: string;

    /**
     * Обработчик изменения шага в пошаговой форме.
     * Вызывается при переходе между шагами.
     *
     * @param formData - текущее состояние формы.
     */
    onChangeNextStep?: (formData: any, step: number) => void;

    /**
     * Флаг: включает проверку данных перед завершением формы.
     * Если true — последний шаг будет содержать предпросмотр и валидацию.
     */
    showStepValidation?: boolean;

    /**
     * Начальный активный шаг в пошаговой форме.
     * По умолчанию: 0.
     */
    initialStep?: number;

    /**
     * Внешний ID объекта, связанный с формой.
     * Может использоваться вне компонента.
     */
    objectId?: string;

    /**
     * Обработчик потери фокуса на поле формы.
     * Вызывается при onBlur для любого поля.
     *
     * @param formDataField - значение поля.
     * @param idField - ID поля, с которого был снят фокус.
     * @param formDataFull - все данные формы.
     */
    onBlur?: (formDataField: any, idField?: string, formDataFull?: any) => void;

    /**
     * Обработчик изменения данных формы.
     * Вызывается при каждом изменении состояния формы.
     *
     * @param formData - обновлённые данные формы.
     * @param idField - ID изменённого поля.
     * @param formDataFull - вся форма.
     */
    onChange?: (formData: any, idField?: string, formDataFull?: any) => void;

    /**
     * Флаг: включена ли live-валидация формы.
     * При true — показываются ошибки сразу при вводе.
     */
    isLiveValid?: boolean;

    /**
     * Группы полей, для которых требуется уникальность значений.
     */
    propUniqueGroups?: string[];

    /**
     * Хранилище уникальных значений.
     * Используется для проверки дубликатов в группах.
     */
    propUniqueData?: object;

    /**
     * Блокирует submit формы, если начальные данные формы не изменялись
     */
    disableSubmitWithoutChanges?: boolean;
    /**
     * Кастомные ошибки.
     * @description Можно использовать для внешней асинхронной валидации данных формы.
     *
     * @warning Кастомные ошибки не влияют на валидацию формы.
     *
     * @example
     * customExtraErrors = {
     *  fieldName1: {
     *    __errors: ['errorText'],
     *    fieldName2: {
     *      __errors: ['abiba', 'aboba]
     *      }
     *   }
     * }
     */
    customExtraErrors?: ErrorSchema;
    /**
     * Синхронная функция валидации данных.
     * @description Используется для добавления ошибок в приходящий
     * объект errors через метод полей объекта addError
     *
     * @warning - Важно в return функции запихнуть приходящий объект errors
     *
     * @example
     * customValidateFunction={(formData, errors, uiSchema) => {
     *  if (formData?.ns_count !== formData?.os_count) {
     *   errors.ns_count?.addError('не равно OS')
     *   errors.os_count?.addError('не равно NS')
     *  }
     *  return errors
     * }}
     */
    customValidateFunction?: CustomValidator<any, RJSFSchema, any>;
}

/**
 * Результат асинхронной валидации формы.
 * ИСПОЛЬЗУЕТСЯ СПЕЦИФИЧНО ДЛЯ СПЕКТРА.
 *
 * @interface IonValidationForm
 */
interface IonValidationForm {
    status: 'waiting' | 'failed' | 'success';
    id: Iid;
    errors: ErrorSchema;
    progress: string;
    activeStep: string;
}

type Iid = number | string | null;

// Настройка валидатора с русской локализацией
const validator = customizeValidator({}, ruLocalizer as any);

// Регистрация кастомных шаблонов
const templates = {
    FieldTemplate: CustomFieldTemplate,
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate,
};

// Регистрация кастомных полей
const fields = {
    TableField,
};

// Регистрация кастомных виджетов
const widgets = {
    TextWidget,
    URLWidget,
    DateTimeWidget,
    TimeWidget,
    TextareaWidget,
    CheckboxWidget,
    CheckboxesWidget,
    TableArray: TableArrayWidget,
    TableArraySelect: TableArraySelectWidget,
    PasswordWidget,
    Chips: ChipsWidget,
    SelectWidget,
    SelectButtonWidget,
    Dropdown: DropdownWidget,
    FileWidget,
    DragNDrop: DragNDropWidget,
    OnlyTextWidget: ({ value }: WidgetProps) => <div style={{ padding: '10px 0 10px 0' }}>{value || '-'}</div>,
};

/**
 * Рекурсивно создает вложенную структуру объекта на основе массива ключей.
 * Используется для обновления errorSchema по цепочке полей.
 *
 * @param array - массив ключей, представляющий путь до поля
 * @param value - значение, которое нужно установить в конец пути
 * @param data - начальный объект, в который будет добавлено значение
 */
const nestedObjectByArray = (array: string[], value: any, data: any = {}): object => {
    let pointer = data;
    array.forEach((item, idx) => {
        if (!pointer[item]) {
            // Если это последний элемент — записываем значение
            if (idx === array.length - 1) {
                pointer[item] = value;
            } else {
                pointer[item] = {};
            }
        }
        pointer = pointer[item];
    });
    return data;
};

/**
 * Формирует JSX из объекта для отображения только текстовых данных.
 */
export const getValueObjectByArray = (obj, arr, ind = 0) => {
    if (ind !== arr.length && !obj[arr[ind]]) return false;
    return ind !== arr.length ? getValueObjectByArray(obj[arr[ind]], arr, ind + 1) : obj;
};

/**
 * Расширение базового класса `Form` из `@rjsf/core`.
 * Переопределяет метод `onBlur`, чтобы обеспечить:
 * - кросс-валидацию полей,
 * - обновление ошибок по цепочке вложенных полей,
 * - корректную работу с `errorSchema`.
 *
 * @class CustomForm
 * @extends {Form}
 */
class CustomForm extends Form {
    constructor(props) {
        super(props);

        const superOnBlur = this.onBlur;

        /**
         * Переопределённый метод onBlur.
         * Вызывается при потере фокуса на любом поле формы.
         *
         * @param {...any} args - стандартные аргументы onBlur.
         */
        this.onBlur = (...args) => {
            const { formData, errors, errorSchema } = this.state;
            // Валидируем форму после потери фокуса
            const { errors: _errors, errorSchema: _errorSchema } = this.validate(formData);

            if (_errors.length && _errorSchema.length) return;

            const currentError = {
                errors: _errors,
                errorSchema: _errorSchema,
            };

            if (props.schema.type === 'object') {
                const splitter = props.idPrefix + props.idSeparator;
                const field = args[0].split(splitter)[1]; // ID изменённого поля
                const arrField = field.split(props.idSeparator); // Разбиваем путь
                const prevOtherFieldErrors = filter(errors, (error) => error.property !== `.${field}`); // Получаем ошибки других полей
                const fieldErrors = filter(_errors, ['property', `.${field}`]); // Получаем ошибки только этого поля
                const fieldErrorSchema = getValueObjectByArray(_errorSchema, arrField); // Получаем errorSchema для этого поля
                // Объединяем ошибки
                currentError.errors = uniqWith([...prevOtherFieldErrors, ...fieldErrors], isEqual);
                currentError.errorSchema = { ...errorSchema, ...nestedObjectByArray(arrField, fieldErrorSchema) };
            }
            // Обновляем состояние формы и вызываем оригинальный onBlur
            this.setState(currentError, () => {
                superOnBlur(...args);
            });
        };
    }
}

/**
 * Основной компонент формы, работающий с JSON Schema.
 */
export const FormJSON = React.forwardRef<Form, IFormJSON>(
    (
        {
            id = 'myform',
            idSeparator = '-',
            formSchema,
            formInitialData,
            onSubmitForm,
            children,
            isOpenDialog = false,
            submitLabel,
            onChangeNextStep = undefined,
            showStepValidation,
            onValidationForm,
            submitOnValidationSuccess,
            isLiveValid = false,
            initialStep = 0,
            onBlur,
            onChange,
            propUniqueGroups,
            propUniqueData,
            disableSubmitWithoutChanges,
            customExtraErrors,
            customValidateFunction,
        },
        ref
    ) => {
        // refs
        const formRef = useRef<Form | null>(null);
        const topStepsRef = useRef<Steps>(null);
        const formSubmitNext = useRef<HTMLInputElement>(null);
        const msgsErrors = useRef<IMessages>(null);

        // Состояния
        const [step, setStep] = useState(initialStep || 0);
        const [steps, setSteps] = useState<object[]>([]);
        const [progressSteps, setProgressSteps] = useState(initialStep + 1 || 1);
        const [isLiveValidate, setIsLiveValidate] = useState(isLiveValid);
        const [formData, setFormData] = useState(formInitialData);
        const [isAutocomplete, setIsAutocomplete] = useState(false);
        const [visible, setVisible] = useState<Iid>(null);
        const [validUniqueGroups, setValidUniqueGroups] = useState<string[]>(propUniqueGroups || []);
        const [uniqueData, setUniqueData] = useState<object>(propUniqueData || {});
        const [activeStepValidation, setActiveStepValidation] = useState('');
        const [isValidationSuccess, setIsValidationSuccess] = useState(false);
        const [progressBar, setProgressBar] = useState('0%');
        const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

        // Переменная для определения заблокированна ли форма без изменений
        const isUnchangedFormBlocked = useMemo(() => {
            if (!disableSubmitWithoutChanges || !formInitialData) {
                return false;
            }

            return isEqual(formInitialData, formData);
        }, [disableSubmitWithoutChanges, formInitialData, formData]);

        const allExtraErrors = useMemo(
            () => ({
                ...customExtraErrors,
                ...extraErrors,
            }),
            [customExtraErrors, extraErrors]
        );

        /**
         * Сохраняет уникальное значение для последующей проверки дубликатов.
         * Используется внутри виджетов для поддержки `uniqueItemPropertiesGroup`.
         *
         * @function setDataValidationUnique
         * @param {string} rowField - полный путь до поля.
         * @param {any} value - значение поля.
         * @param {string} [group='id'] - группа уникальности (по умолчанию `'id'`).
         */
        const setDataValidationUnique = (rowField, value, group = 'id') => {
            // Преобразуем путь поля в точку доступа в JSON-объекте
            const field = rowField.replace(`${id}${idSeparator}`, '').replaceAll(`${idSeparator}`, '.');

            if (!value) {
                setUniqueData((prev = {}) => {
                    delete prev[group]?.[field];
                    return prev;
                });
                return;
            }
            if (validUniqueGroups.find((item) => item === group)) {
                setValidUniqueGroups((prev = []) => [group, ...prev.filter((item) => item !== group)]);
            } else {
                setValidUniqueGroups((prev = []) => [group, ...prev]);
            }
            setUniqueData((prev = {}) => {
                if (prev?.[group]?.[field]) {
                    prev[group][field] = value;
                }
                prev[group] = { [field]: value, ...(prev[group] ? prev[group] : {}) };
                return prev;
            });
        };

        // Инициализация шагов
        useEffect(() => {
            const tempSteps: object[] = [];
            if (formSchema.length) {
                tempSteps.push(
                    ...formSchema.map((item, index) => ({ label: item.label, disabled: progressSteps < index }))
                );
            }

            if (showStepValidation) {
                tempSteps.push({ label: 'Проверка', disabled: progressSteps < formSchema.length });
            }
            setSteps(tempSteps);
        }, [progressSteps]);

        // Обновление данных при изменении formInitialData
        useEffect(() => {
            formRef.current?.onChange(formInitialData);
            // setIsAutocomplete(true);
            if (!isEmpty(formInitialData)) {
                setIsAutocomplete(true);
                setFormData((prev) => merge(prev, cloneDeep(formInitialData)));
            }
        }, [formInitialData]);

        let containerActions: Element | null;
        if (isOpenDialog) {
            containerActions = document.querySelector('.p-dialog-footer');
        }

        /**
         * Формирует JSX из объекта для отображения только текстовых данных.
         */
        function ObjectParseToJSX(object: Record<string, any>): React.ReactNode {
            let depth = 0;
            return Object.entries(object).map(([key, value]) => {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    depth += 1;
                    return (
                        <div style={{ marginLeft: `${depth}rem` }} key={key}>
                            {`${key}: `} {ObjectParseToJSX(value)}
                        </div>
                    );
                }
                depth = Math.max(0, depth - 1);
                if (Array.isArray(value)) {
                    return (
                        <div key={key}>
                            {`${key}: `} {ArrayFieldNotInputTemplate({ value })}
                        </div>
                    );
                }
                return (
                    <p key={key} style={{ margin: '0 0 0 1rem' }}>
                        {key}: {PrimitiveFieldTemplate(value)}
                    </p>
                );
            });
        }

        /**
         * Отображает массив без возможности редактирования.
         */
        function ArrayFieldNotInputTemplate(props: any) {
            return (
                <ol>
                    {props.value.map((element, index) => (
                        <li style={{ marginBottom: '1rem' }} key={index}>
                            {typeof element === 'object' ? ObjectParseToJSX(element) : PrimitiveFieldTemplate(element)}
                        </li>
                    ))}
                </ol>
            );
        }
        /**
         * Отображает примитивный тип данных
         */
        function PrimitiveFieldTemplate(value: any): React.ReactNode {
            if (typeof value === 'boolean') {
                value = value ? 'Да' : 'Нет';
            }
            if (value === undefined) return '-';
            return <b style={{ padding: '10px 0 10px 0' }}>{String(value)}</b>;
        }
        // Виджеты только для отображения текста - используется на странице валидации, для вывода всех ранее введенных данных
        const widgetsOnlyText = {
            TextWidget: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            TextareaWidget: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            CheckboxWidget: ({ value }: WidgetProps) => (
                <b style={{ padding: '10px 0 10px 0' }}>{value ? 'Да' : 'Нет'}</b>
            ),
            Password: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            Chips: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            SelectWidget: ({ value }: WidgetProps) => (
                <b style={{ padding: '10px 0 10px 0' }}>{typeof value === 'object' ? value.label : value || '-'}</b>
            ),
            Dropdown: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            OnlyTextWidget: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            SelectButtonWidget: ({ value }: WidgetProps) => <b style={{ padding: '10px 0 10px 0' }}>{value || '-'}</b>,
            TableArray: ArrayFieldNotInputTemplate,
            TableArraySelect: ArrayFieldNotInputTemplate,
        };

        // Шаблоны только для отображения текста
        const templatesOnlyText = {
            ArrayFieldTemplate: ArrayFieldOnlyTextTemplate,
            ObjectFieldTemplate: ObjectFieldOnlyTextTemplate,
            FieldTemplate: FieldOnlyTextTemplate,
        };

        /**
         * Переключатель шагов в пошаговой форме.
         * Позволяет переходить между шагами, проверяя валидность при переходе вперёд.
         *
         * @function onChangeTab
         * @param {number} num - номер целевого шага.
         */
        const onChangeTab = (num) => {
            onChangeNextStep?.(formData, num); // Вызываем внешний обработчик изменения шага

            if (step === num) return; // Не меняем, если уже активен
            if (step > num) {
                // Если возвращаемся назад, просто переключаемся
                if (!isValidForm()) {
                    // Но сохраняем прогресс
                    setProgressSteps(step);
                }
                setStep(num);
                if (topStepsRef.current) {
                    topStepsRef.current.getElement().scrollIntoView({ behavior: 'auto', block: 'center' });
                }
                return;
            }

            // Если двигаемся вперёд — проверяем валидность
            if (isValidForm()) {
                setStep(num);
                if (progressSteps <= num) {
                    setProgressSteps((prev) => prev + 1);
                }
                if (topStepsRef.current) {
                    topStepsRef.current.getElement().scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }
        };

        /**
         * Проверяет форму на валидность.
         * Используется перед переходом на следующий шаг или отправкой.
         *
         * @function isValidForm
         * @returns {boolean} true, если форма валидна, иначе false.
         */
        const isValidForm = () => {
            if (
                formRef?.current?.validate(formData).errors.length &&
                formRef?.current?.validate(formData).errors.length > 0
            ) {
                // Если есть ошибки — кликаем скрытую кнопку submit, чтобы показать их
                formSubmitNext?.current?.click();
                return false;
            }
            setIsLiveValidate(false);
            return true;
        };

        /**
         * Обрабатывает ошибки формы: скроллит к полю с ошибкой и фокусируется на нём.
         * Также может вызывать модальные окна или другие действия при ошибках.
         *
         * @function onError
         * @param {Array<Error>} elements - список ошибок формы.
         */
        const onError = (elements) => {
            setIsLiveValidate(true);
            const container: HTMLElement | null = document.querySelector('.layout-main');
            let element: HTMLElement | null;
            if (elements[0].property) {
                element = document.getElementById(
                    id + idSeparator + elements[0].property.replace(/^[.]+/i, '').replaceAll(/\./g, idSeparator)
                );
            } else {
                element = document.getElementById(id);
            }

            const isVisibleElement =
                container &&
                element &&
                !isVisible({
                    target: element,
                    viewport: container,
                    offset: { top: 90 },
                    threshold: 1,
                });

            if (element) {
                if (isVisibleElement) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        element?.focus();
                    }, 500);
                } else {
                    element.focus();
                }
            }
        };

        /** Запуск внешней валидации
         *  используется в спектре
         */
        const onValidation = async (ident: Iid = null) => {
            if (onValidationForm) {
                onValidationForm(formData, ident).then((res) => {
                    setProgressBar(res.progress);
                    setActiveStepValidation(res.activeStep);
                    if (res.status === 'waiting') {
                        setVisible(res.id);
                        setTimeout(() => {
                            onValidation(res.id);
                        }, 5000);
                        return;
                    }

                    Object.entries(res.errors).forEach(([key, value]) => {
                        if (has(formData, key)) {
                            setExtraErrors((prev) => ({ ...prev, [key]: value } as any));
                        }
                    });

                    setVisible(null);

                    if (res.status === 'success') setIsValidationSuccess(true);

                    if (res.status === 'success' && submitOnValidationSuccess) {
                        onSubmitForm(formData, msgsErrors);
                        return;
                    }

                    if (msgsErrors.current) {
                        setVisible(null);
                        msgsErrors.current.replace([
                            {
                                severity: res.status === 'failed' ? 'error' : res.status,
                                label:
                                    res.status === 'success'
                                        ? 'Проверка выполнена успешно, можно запускать операцию'
                                        : 'Проверка выполнена с ошибкой, проверьте параметры и исправьте их',
                                sticky: true,
                                closable: false,
                            },
                        ]);
                    }
                    if (topStepsRef.current) {
                        topStepsRef.current.getElement().scrollIntoView({ behavior: 'auto', block: 'center' });
                    }
                });
            }
        };

        // Кнопки действий (шаги)
        const ActionFormForSteps = (): any => {
            const jsx = (
                <>
                    {step > 0 && (
                        <Button
                            label="Предыдущий шаг"
                            className="p-button ml-2"
                            onMouseUp={() => {
                                onChangeTab(step - 1);
                            }}
                            outlined
                        />
                    )}
                    {step + 1 < steps.length && (
                        <Button
                            label="Следующий шаг"
                            className="ml-2"
                            onMouseUp={() => {
                                onChangeTab(step + 1);
                            }}
                        />
                    )}
                    {step + 1 >= steps.length &&
                        (onValidationForm && !isValidationSuccess ? (
                            <Button
                                label={submitOnValidationSuccess ? submitLabel : 'Проверить'}
                                disabled={!isEmpty(extraErrors) || isUnchangedFormBlocked}
                                className="ml-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onValidation();
                                }}
                            />
                        ) : (
                            children || (
                                <Button
                                    label={submitLabel}
                                    className="p-button ml-2"
                                    type="submit"
                                    form="myform"
                                    disabled={isUnchangedFormBlocked}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (isValidForm()) {
                                            onSubmitForm(formData, msgsErrors);
                                        }
                                    }}
                                />
                            )
                        ))}
                </>
            );
            if (!isOpenDialog || !containerActions) {
                return <div className="flex justify-content-end mt-3">{jsx}</div>;
            }
            return ReactDOM.createPortal(jsx, containerActions);
        };

        // Дополнительная валидация на уникальность
        const AdditionValidator: CustomValidator = (_, errors, uiSchema) => {
            if (customValidateFunction) {
                customValidateFunction(_, errors, uiSchema);
            }
            const group = Object.keys(uniqueData)[0];
            if (group) {
                const dataGroup = uniqueData[group];
                const fieldsArr = Object.keys(dataGroup);

                const uiSchemaUnique =
                    fieldsArr[0] &&
                    uiSchema?.[fieldsArr[0].split('.')[0]] &&
                    getValueObjectByArray(uiSchema, fieldsArr[0].split('.'));

                const findErrorByArray = (arr, current = 0): void => {
                    const field = arr[current];
                    const fieldArr = field && field.split('.');
                    const message =
                        uiSchemaUnique['ui:options'].uniqueItemPropertiesGroup?.errorMessage || 'Значение используется';
                    let err = 0;
                    if (arr.length === current) return;

                    for (let i = 0; i < arr.length; i++) {
                        const str = arr[i];
                        if (!uniqueData[group][field]) break;
                        if (field !== str && uniqueData[group][field] === uniqueData[group][str]) {
                            if (err > 0) {
                                findErrorByArray(arr, current + 1);
                                break;
                            }
                            const addError = getValueObjectByArray(errors, fieldArr);
                            addError.addError(message);
                            err += 1;
                            break;
                        }
                    }
                    if (err === 0) findErrorByArray(arr, current + 1);
                };
                if (uiSchemaUnique) findErrorByArray(fieldsArr);
            }
            return errors;
        };

        return (
            <>
                {/* Модальное окно с прогрессом валидации */}
                <Dialog
                    showHeader={false}
                    modal={true}
                    appendTo="self"
                    visible={!!visible}
                    onHide={() => setVisible(null)}
                >
                    <p className="m-0 text-center flex flex-column">
                        <ProgressSpinner strokeWidth="3" style={{ width: '80px', height: '80px' }} />
                        <span>{activeStepValidation}</span>
                        <div
                            style={{
                                width: progressBar,
                                minWidth: '5%',
                                height: 5,
                                background: 'var(--primary-color)',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                            }}
                        ></div>
                    </p>
                </Dialog>
                {/* Шаги формы */}
                {steps.length > 0 && (
                    <Steps
                        model={steps}
                        activeIndex={step}
                        onSelect={(e) => {
                            onChangeTab(e.index);
                        }}
                        ref={topStepsRef}
                        className="mt-3 mb-3"
                        readOnly={false}
                    />
                )}
                {/* Сообщения об ошибках */}
                <Messages ref={msgsErrors} />

                {/* Шаговая форма с предпросмотром */}
                {showStepValidation && step === steps.length - 1 ? (
                    <>
                        <Accordion
                            expandIcon={'pi pi-angle-down'}
                            collapseIcon={'pi pi-angle-up'}
                            multiple
                            activeIndex={Array.from({ length: steps.length }, (_, idx) => idx)}
                        >
                            {formSchema.map((item, index) => (
                                <AccordionTab key={index} header={`${index + 1}. ${item.label}`}>
                                    <CustomForm
                                        className={'steps-form__confirmation-item'}
                                        schema={item}
                                        id={`confirmation${index}`}
                                        uiSchema={item.uiSchema}
                                        validator={validator}
                                        formData={formData}
                                        showErrorList={false}
                                        extraErrors={extraErrors}
                                        widgets={widgetsOnlyText}
                                        templates={templatesOnlyText}
                                    >
                                        <div className="mt-3">
                                            <a
                                                className="link mt-3"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    onChangeTab(index);
                                                }}
                                            >
                                                <span className="pi pi-pencil pr-1"></span>
                                                Изменить данные
                                            </a>
                                        </div>
                                    </CustomForm>
                                </AccordionTab>
                            ))}
                        </Accordion>
                    </>
                ) : (
                    /* Основная форма */
                    <CustomForm
                        id={id}
                        idPrefix={id}
                        idSeparator={idSeparator}
                        validator={validator}
                        customValidate={AdditionValidator}
                        schema={formSchema.length ? formSchema[step] : formSchema}
                        formData={formData}
                        ref={(node) => {
                            if (formRef) {
                                formRef.current = node;
                            }

                            if (ref && 'current' in ref) {
                                ref.current = node;
                            }
                        }}
                        liveValidate={isLiveValidate || !isEmpty(extraErrors)}
                        onBlur={(name, data) => {
                            const idField = name.replace(`${id}${idSeparator}`, '');
                            if (!isEmpty(extraErrors)) {
                                setExtraErrors((prev) => {
                                    function delObject(obj: object, arr: string[]) {
                                        unset(obj, arr);
                                        arr.pop();
                                        if (linkArr.length && isEmpty(get(obj, arr))) delObject(obj, arr);
                                        return true;
                                    }
                                    const linkArr = idField.split('-');
                                    delObject(prev, linkArr);
                                    if (isEmpty(prev)) {
                                        msgsErrors?.current?.replace([
                                            {
                                                severity: 'info',
                                                label: 'Данные исправлены, можно повторить проверку',
                                            },
                                        ]);
                                    }

                                    return { ...prev };
                                });
                            }
                            onBlur?.(data, idField, formData);
                        }}
                        onChange={({ formData: data }, idField) => {
                            setFormData(data);

                            setIsValidationSuccess(false);

                            onChange?.(data, idField, formRef);
                        }}
                        uiSchema={formSchema.length ? formSchema[step].uiSchema : formSchema?.uiSchema}
                        showErrorList={false}
                        widgets={widgets}
                        fields={fields}
                        extraErrors={allExtraErrors}
                        templates={templates}
                        onError={(err) => onError(err)}
                        noHtml5Validate
                        formContext={{
                            isAutocomplete,
                            formRef,
                            isValidForm,
                            setDataValidationUnique,
                            propUniqueGroups: validUniqueGroups,
                            propUniqueData: uniqueData,
                        }}
                        transformErrors={transformErrors}
                        onSubmit={() => {
                            if (isUnchangedFormBlocked) {
                                return;
                            }
                            onSubmitForm(formData, msgsErrors);
                        }}
                    >
                        <div className="flex justify-content-end">
                            <input ref={formSubmitNext} hidden type="submit"></input>
                            {step >= steps.length && children}
                        </div>
                    </CustomForm>
                )}

                {/* Кнопки действий */}
                {steps.length > 0 && <ActionFormForSteps />}
            </>
        );
    }
);

FormJSON.displayName = 'FormJSON';

// Упрощённая версия формы без шагов
export const SimpleForm: React.FC<IFormJSON> = ({
    id = 'myform',
    idSeparator = '-',
    formSchema,
    formInitialData,
    onChange,
    onBlur,
}) => {
    const formRef = useRef<Form>(null);
    return (
        <CustomForm
            id={id}
            ref={formRef}
            idPrefix={id}
            idSeparator={idSeparator}
            validator={validator}
            schema={formSchema}
            formData={formInitialData}
            onChange={(data, idField) => {
                onChange?.(data, idField, formRef?.current?.validate(data.formData).errors.length);
            }}
            onBlur={(_, data) => onBlur?.(data)}
            uiSchema={formSchema?.uiSchema}
            showErrorList={false}
            widgets={widgets}
            fields={fields}
            templates={templates}
            noHtml5Validate
            transformErrors={transformErrors}
        >
            <input hidden type="submit"></input>
        </CustomForm>
    );
};
