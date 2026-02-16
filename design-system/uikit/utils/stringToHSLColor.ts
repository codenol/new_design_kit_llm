/**
 * Функция для преобразования строки в цвет формата HLS
 * @param {string} str - строка которая будет преобразована
 * @param {number} [saturation=50] - насыщенность цвета (в процентах)
 * @param {number} [lightness=40] - яркость цвета (в процентах)
 * @returns {string} - строка в формата HLS цвета
 */

export function stringToHSLColor(str: string, saturation: number = 50, lightness: number = 40): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash); // hash function
    }

    const hue = Math.abs(hash % 360);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
