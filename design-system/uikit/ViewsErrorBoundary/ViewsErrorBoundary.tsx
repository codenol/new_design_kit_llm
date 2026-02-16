import React, { useState } from 'react';
import { Button } from 'primereact/button';

export interface IViewsErrorBoundary {
    resetErrorBoundary: () => void;
    error: any | null;
}
export const ViewsErrorBoundary: React.FC<IViewsErrorBoundary> = ({ error, resetErrorBoundary }) => {
    const [moreEroorm, setMoreError] = useState(false);
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginTop: '64px',
            }}
        >
            <h2 style={{ textAlign: 'center' }}>Упс, что-то пошло не так</h2>
            <Button
                label={moreEroorm ? 'Скрыть' : 'Подробнее'}
                className="p-button-link"
                style={{ padding: 0 }}
                onClick={() => setMoreError((e) => !e)}
            />

            <p>{moreEroorm && <pre>{error.stack}</pre>}</p>

            <Button type="button" onClick={resetErrorBoundary} label="Обновить" />
        </div>
    );
};
