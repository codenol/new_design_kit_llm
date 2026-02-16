import React, { memo } from 'react';
import { SvgIcon } from '../../../SvgIcon';
import './index.scss';

interface EllipsisVProps {
    onClick?: (event: React.SyntheticEvent) => void;
    style?: React.CSSProperties | undefined;
    id?: string;
}

const EllipsisV = (props: EllipsisVProps) => {
    const { onClick, style } = props;
    return (
        <div onClick={(event) => event.stopPropagation()}>
            <i onClick={onClick} style={style} className="pi pi-ellipsis-v ellipsis" />
        </div>
    );
};

export const SvgEllipsisV = (props: EllipsisVProps) => {
    const { onClick } = props;
    return (
        <div onClick={(event) => event.stopPropagation()}>
            <i onClick={onClick} className="ellipsis">
                <SvgIcon name="ellipsis-v" />
            </i>
        </div>
    );
};

export default memo(EllipsisV);
