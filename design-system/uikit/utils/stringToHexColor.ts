/**
 * Функция для преобразования строки в HEX код цвета
 * @param {string} str - строка которая будет преобразована
 * @returns {string} - HEX код цвета
 */

export function stringToHexColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // eslint-disable-next-line no-bitwise
    return '#' + (hash & 0xffffff).toString(16).padStart(6, '0');
}
