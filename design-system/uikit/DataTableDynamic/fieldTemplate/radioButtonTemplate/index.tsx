import React from 'react';
import { RadioButton, RadioButtonProps } from 'primereact/radiobutton';

interface RadioButtonTemplate extends RadioButtonProps {
    label?: string;
}

const RadioButtonTemplate = (props: RadioButtonTemplate) => {
    const { value, label } = props;
    return (
        <div className="flex align-items-center mr-4">
            <RadioButton inputId={value} value={value} {...props} />
            <label htmlFor={value} style={{ marginLeft: '10px' }}>
                {label}
            </label>
        </div>
    );
};

export default RadioButtonTemplate;
