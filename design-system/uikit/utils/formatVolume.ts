export type Volume = 'байт' | 'КБ' | 'МБ' | 'ГБ' | 'ТБ' | 'ПБ' | 'ЭБ' | 'ЗБ';
const VOLUME_NAMES: Volume[] = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ', 'ЗБ'];

export interface formatFileSizeProps {
    /**
     * Значение, которое будем перегонять
     */
    value: number;
    /**
     * Сколько цифр оставить после запятой
     */
    toFixedCount?: number;
    /**
     * Использовать для перевода умножение на 1000 или на 1024
     */
    usePow10?: boolean;
    /**
     * Нынешняя единица объема
     */
    currentVolume?: Volume;
    /**
     * Желаемая единица объема
     */
    targetVolume?: Volume;
}

export interface formatFileSizeOutout {
    value: number | null;
    volume: Volume;
}

/**
 * Функция для получения текстовой интерпретации заскейленного объема
 * @returns строка, состоящая из числа и объема
 */
export const formatVolumeToString = (props: formatFileSizeProps): string => {
    const formatted = formatVolume(props);
    return `${formatted.value} ${formatted.volume}`;
};

/**
 * Функция для перевода числа из одной единицы измерения объема в другую
 * Если не указан targetValue, то перевод будет произведен до максимально возможной единицы объема
 * @default
 * toFixedCount = 2
 * usePow10 = true
 * currentVolume = 'байт'
 * @returns объект formatFileSizeOutput с отформатированным числом и объемом
 */
export const formatVolume = (props: formatFileSizeProps): formatFileSizeOutout => {
    const { value, toFixedCount = 2, usePow10 = true, currentVolume = 'байт', targetVolume } = props;
    if (!value) return { value: 0, volume: 'байт' };

    const desiredVolumeIndex = targetVolume
        ? VOLUME_NAMES.indexOf(targetVolume)
        : VOLUME_NAMES.indexOf(currentVolume) + Math.floor(Math.log(value) / Math.log(usePow10 ? 1000 : 1024));
    const realTargetVolume =
        VOLUME_NAMES[desiredVolumeIndex >= VOLUME_NAMES.length ? VOLUME_NAMES.length : desiredVolumeIndex];

    const formattedSize = scaleVolumeBetween(value, currentVolume, realTargetVolume, usePow10, toFixedCount);

    return { value: formattedSize, volume: realTargetVolume };
};

/**
 * Целочисленный перевод из одного измерения объема в другое
 * @param raw цифра или строка с числом.
 * @param currentVolume какая размерность сейчас.
 * @param targetVolume какую размерность надо.
 * @param usePow10 использовать возведение в степень числа 1000 или 1024.
 * @default usePow10 = false
 * @param toFixedCount сколько чисел после запятой сохранить в результате
 *
 * @return число, которое перегнали из currentVolume в targetVolume.
 */
export const scaleVolumeBetween = (
    value: number | string | null,
    currentVolume: Volume,
    targetVolume: Volume,
    usePow10: boolean = false,
    toFixedCount: number = 0
) => {
    if (value === null || (typeof value === 'number' && value <= 0)) {
        return value;
    }
    const shift = VOLUME_NAMES.indexOf(currentVolume) - VOLUME_NAMES.indexOf(targetVolume);
    return Number((Number(value) * (usePow10 ? 1000 : 1024) ** shift).toFixed(toFixedCount));
};
