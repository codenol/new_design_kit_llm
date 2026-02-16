/**
 * Функция для скачивания файлов на клиента по ссылке
 * @param {string} fileUrl - ссылка на ендпоинт(GET) который возвращает фаил или на фаил
 * @param {string} fileName - имя скачиваемого файла
 * @returns {void} - функция не возвращает значения
 */

export const downloadLink = (fileUrl: string, fileName: string): void => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;

    link.setAttribute('download', fileName);

    link.setAttribute('type', 'application/x-yaml');

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
};
