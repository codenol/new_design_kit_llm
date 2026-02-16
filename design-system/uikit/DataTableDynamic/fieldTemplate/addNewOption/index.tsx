import React, { memo } from 'react';
import './index.scss';

interface AddNewOptionProps {
    onClickAction?: any;
}

const AddNewOption = (props: AddNewOptionProps) => {
    const { onClickAction } = props;
    return (
        <div className={'add-new-option-container'} onClick={onClickAction}>
            <i style={{ fontWeight: '800' }} className="pi pi-plus pls-btn" />
            <p>Добавить условие</p>
        </div>
    );
};

export default memo(AddNewOption);
