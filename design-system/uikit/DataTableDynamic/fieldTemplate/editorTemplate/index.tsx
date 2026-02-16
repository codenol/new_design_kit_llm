import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';

export interface DefaultEditorProps {
    rowData: any;
    field: string;
    regex?: RegExp;
    validate?: boolean;
    onChange?: (value: string) => void;
    onSave: (id, value: string) => void;
    onCancel?: () => void;
    customBody?: (value: any) => React.ReactNode;
}

export const DefaultEditor: React.FC<DefaultEditorProps> = ({
    rowData,
    field,
    regex,
    validate,
    onChange,
    onSave,
    onCancel,
    customBody,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(rowData[field]);
    const [error, setError] = useState<string>('');

    const validateValue = (val: string): string => {
        if (validate) {
            if (val.length === 0) {
                return 'Строка не может быть пустой';
            }
            if (regex) {
                if (regex.test(val)) {
                    return `Недопустимые символы или пробелы в начеле/конце`; // TODO: унифицировать строку/сделать её более понятной пользователю
                }
            }
        }
        return '';
    };

    const handleEditClick = () => {
        const validationError = validateValue(rowData[field] || '');
        if (validationError) {
            setError(validationError);
        }
        setIsEditing(true);
    };

    const handleSave = () => {
        const trimmedValue = value.trim();
        const validationError = validateValue(trimmedValue);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        onSave(rowData, value);
        setIsEditing(false);
    };
    const handleCancel = () => {
        setValue(rowData[field]);
        setError('');
        setIsEditing(false);
        onCancel?.();
    };

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChange?.(newValue);

        const validationError = validateValue(newValue);
        if (validationError && newValue.length > 0) {
            setError(validationError);
        } else {
            setError('');
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-column gap-2">
                <div className="flex align-items-center">
                    <InputText
                        style={{ width: '100%' }}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        autoFocus
                        maxLength={255}
                        className={!error ? 'p-inputtext' : 'p-invalid'}
                    />
                    <i className={'pi pi-check edit-icon'} onClick={!error ? handleSave : undefined} />
                    <i className="pi pi-times edit-icon" onClick={handleCancel} />
                </div>
                {error && <small className="p-error">{error}</small>}
            </div>
        );
    }

    const displayValue = customBody ? customBody(rowData[field]) : rowData[field] ?? '';
    return (
        <>
            {displayValue}
            <i className={'pi pi-pencil edit-icon'} onClick={handleEditClick}></i>
        </>
    );
};
