/**
 * Функция для скачивания бинарного файлов на клиенте
 * @param {Blob} blob - массив двоичных данных (файл)
 * @param {string} fileName - имя скачиваемого файла
 * @returns {void} - функция не возвращает значения
 */

export const downloadBlob = (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.visibility = 'hidden';
    link.href = url;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
