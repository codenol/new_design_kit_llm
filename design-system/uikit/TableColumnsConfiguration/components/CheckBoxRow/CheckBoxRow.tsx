import React, { memo } from 'react';

import { Checkbox } from 'primereact/checkbox';

interface CheckBoxRowProps {
    title: string;
    isSelected: boolean;
    onChange: (event: any) => void;
    isSelectAll?: boolean;
    pt?: any;
}

export const CheckBoxRow = memo(({ title, isSelected, onChange, isSelectAll, pt }: CheckBoxRowProps) => (
    <div
        className="check-box-row"
        {...(isSelectAll
            ? pt?.overlayPanel?.ListContainer?.ListSelectAllItem
            : pt?.overlayPanel?.ListContainer?.ListItem)}
    >
        <label>
            <Checkbox checked={isSelected} onChange={onChange} />
            {title}
        </label>
    </div>
));

CheckBoxRow.displayName = 'CheckBoxRow';
