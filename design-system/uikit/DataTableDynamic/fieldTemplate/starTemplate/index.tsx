import React, { CSSProperties, memo } from 'react';
import './index.scss';

interface StarProps {
    style?: CSSProperties;
    className?: string;
    onClick?: any;
}

const Star = (props: StarProps) => {
    const { style, className, onClick } = props;
    return (
        <div onClick={(event) => event.stopPropagation()}>
            <i style={style} onClick={onClick} className={className} />
        </div>
    );
};

export default memo(Star);
