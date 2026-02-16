import { RJSFValidationError } from '@rjsf/utils';

/**
 * Метод обновления сообщения об ошибке на более человекочитаемую
 */
function customizeError(error: RJSFValidationError): RJSFValidationError {
    const defaultError = 'Введите данные в указанном формате';
    const latName = {
        message: `Допустимы только цифры, 
                    латинские буквы и символы «-», «_», «.». 
                    В начале строки могут находиться только буквы.`,
        regexp: {
            default: '^[a-zA-Z_]+?[a-zA-Z0-9_\\-\\.]*$',
            usedVal: {
                start: '\\^\\(\\?\\!\\(\\?\\:',
                end: '\\)\\$\\)\\^\\[a-zA-Z_]\\+\\?\\[a-zA-Z0-9_\\\\-\\\\\\.\\]\\*\\$',
            },
        },
    };
    if (error.name === 'if' || (error.schemaPath?.includes('oneOf') && error.schemaPath?.includes('const'))) {
        // Пропускаем ошибку if (почему?)
        return { ...error, message: '' };
    }
    if (error.name === 'pattern') {
        if (error.params.pattern === latName.regexp.default) error.message = `${latName.message}`;
        else if (error.params.pattern === '^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$')
            error.message = `${defaultError}: IP-адрес`;
        else if (
            error.params.pattern ===
            '(?=^.{4,253}$)(^((?![-])[a-zA-Zа-яА-Я0-9-]{1,63}(?<![-])\\.)+[a-zA-Zа-яА-Я]{2,63}$)'
        )
            error.message = 'Введите корректное доменное имя';
        else if (
            error.params.pattern ===
            '(^(?![_.-])[a-zA-Z0-9\u0400-\u04FF]+([._-]?[a-zA-Z0-9\u0400-\u04FF]+)*@[a-zA-Z\u0400-\u04FF0-9-]+(\\.[a-zA-Z\u0400-\u04FF0-9-]+)*\\.([a-zA-Z\u0400-\u04FF]{2,10}))$'
        )
            error.message = `${defaultError}: DIvanov@corp.ru / ДИванов@корп.рф`;
        else if (error.params.pattern.endsWith('$(?![\\r\\n])')) {
            const count = [...error.params.pattern.matchAll(/\{(\d+)\}/g)];
            error.message = `Введите указанное количество IP-адресов: ${count[1][1]}`;
        } else if (
            new RegExp(latName.regexp.usedVal.start + '.*?' + latName.regexp.usedVal.end).test(error.params.pattern)
        ) {
            let usedValues = error.params.pattern
                .replace(new RegExp(latName.regexp.usedVal.start), '')
                .replace(new RegExp(latName.regexp.usedVal.end), '')
                .split('|');

            if (usedValues.length > 5) {
                usedValues = usedValues.slice(0, 5).join(', ') + '...';
            } else {
                usedValues = usedValues.join(', ');
            }

            error.message = `${latName.message} 
                                Недопустимы используемые значения: ${usedValues}`;
        } else if (error.params.pattern === '^(?!(.|\\n)*YOUR_PRODUCTION_NTP_IP)(.|\\n)*$')
            error.message = 'Некорректный NTP адрес';
        else error.message = 'Некорректное значение';
    }
    if (error.name === 'minLength') {
        error.message = `Не должен быть короче ${error.params.limit} ${'символ'}${getPluralForm(error.params.limit)}`;
    }
    if (error.name === 'type' && error.params.type === 'number') {
        error.message = 'Должен содержать только числовые значения';
    }
    if (error.name === 'maxLength') {
        error.message = `Не должен быть длиннее ${error.params.limit} ${'символ'}${getPluralForm(error.params.limit)}`;
    }
    if (error.name === 'required') {
        error.message = 'Поле обязательно для заполнения';
    }
    if (error.name === 'not') {
        error.message = 'Поле не соответствует условию';
    }
    if (error.name === 'const') {
        error.message = `Поле должно быть равно заданному значению: ${error.params.allowedValue}`;
    }
    if (error.name === 'minItems') {
        error.message = `Необходимо выбрать не менее ${error.params.limit} ${'элемент'}${getPluralForm(
            error.params.limit
        )}`;
    }
    if (error.name === 'oneOf') {
        error.message = `Поле не подходит ни под один из допустимых вариантов`;
    }
    return error;
}

/**
 * Преобразует ошибки валидации и кастомизирует сообщения.
 */
export const transformErrors = (errors: RJSFValidationError[]): RJSFValidationError[] => {
    const customizedErrors = errors.map((error) => customizeError(error));
    // Поиск вложенных ошибок
    const enhancedErrors = customizedErrors.map((error) => {
        const property = error.property;
        const schemaPath = error.schemaPath;

        // Только если ошибка внутри items массива (в таблице)
        if (!schemaPath || !/\/items\//.test(schemaPath)) {
            return error;
        }

        if (!property) return error;

        // Разбиваем путь: ['hosts', '8', 'data_disks', '0', 'disks']
        const parts = property.split('.').filter(Boolean);

        // Поиск последнего имени массива перед числовым индексом
        let arrayEndIndex = -1;
        for (let i = 0; i < parts.length; i++) {
            if (!Number.isNaN(Number(parts[i + 1]))) {
                arrayEndIndex = i + 1;
            }
        }
        // Обрезка пути до поля таблицы для вывода на странице
        if (arrayEndIndex > 0) {
            const truncatedPath = parts.slice(0, arrayEndIndex).join('.');
            if (error?.message?.length !== 0)
                return {
                    ...error,
                    property: `.${truncatedPath}`,
                    message: `Строка ${Number(parts[arrayEndIndex]) + 1}: ${error.message}`,
                };
            return { ...error, message: '' };
        }

        return error;
    });

    return enhancedErrors;
};

/**
 * Возвращает правильное окончание в родительном падеже (например, "элементА", "элементОВ")
 * в зависимости от числа.
 *
 * Правила:
 * - Для чисел, заканчивающихся на 1 (кроме 11) → "-А"
 * - Для всех остальных → "-ОВ"
 *
 * @param {number} n - Число, на основе которого определяется форма слова
 * @returns {string} - Окончание: 'а' или 'ов'
 */
function getPluralForm(n) {
    const lastDigit = n % 10;
    if (lastDigit === 1 && n !== 11) return 'а'; // 1, 21 и тд → элемента
    return 'ов'; // 0, 2, 11, 50 и тд → элементов
}
