import React from 'react';

/**
 * Фукнция, хайлайтящая выделенную подстроку в строке
 * @param text вся строка
 * @param mark подстрока
 * @returns элемент с text, где есть хайлайт первого куска с mark
 */
export const highlightText = (text: string, mark: string): React.ReactElement<HTMLElement> | string => {
    if (!mark || !text) return text;
    const index = text.toLocaleLowerCase?.().indexOf(mark.toLocaleLowerCase());
    if (index >= 0) {
        return (
            <>
                {text.substring(0, index)}
                <mark style={{ padding: 0 }}>{text.substring(index, index + mark.length)}</mark>
                {text.substring(index + mark.length)}
            </>
        );
    }
    return text;
};
