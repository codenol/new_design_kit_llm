import React, { CSSProperties, memo } from 'react';
import './index.scss';

interface TrashProps {
    style?: CSSProperties;
    onClick?: () => void;
}
const Trash = (props: TrashProps) => {
    const { style, onClick } = props;
    return <i style={style} onClick={onClick} className="pi pi-trash trash" />;
};

export default memo(Trash);
