import { ToastMessage } from 'primereact/toast';

/**
 * Функция для копирования строки в буфер обмена
 * @param text строка, которую засунут в буфер
 * @param denyText текст ошибки
 * @param acceptText текст при успешном копировании
 * @param showToast чтобы вывести тост при необходимости
 */
export const copyKeyToClipboard = (
    text: string,
    denyText?: string,
    acceptText?: string,
    showToast?: (obj: ToastMessage) => void
) => {
    if (!navigator.clipboard) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            if (showToast)
                showToast({
                    severity: 'error',
                    summary: denyText,
                    id: 'deny_copy',
                });
            return;
        }
        document.body.removeChild(textArea);
    } else {
        navigator.clipboard.writeText(text);
    }
    if (showToast)
        showToast({
            severity: 'info',
            summary: acceptText,
            id: 'accept_copy',
        });
};
