import React, { ChangeEvent, useCallback, useState } from 'react';
import {
    dataURItoBlob,
    FormContextType,
    Registry,
    RJSFSchema,
    StrictRJSFSchema,
    TranslatableString,
    WidgetProps,
} from '@rjsf/utils';
import Markdown from 'markdown-to-jsx';

/**
 * Добавляет имя файла в Data URL для последующего распознавания при загрузке.
 *
 * @param dataURL - исходная Data URL.
 * @param name - имя файла.
 */
function addNameToDataURL(dataURL: string, name: string) {
    if (dataURL === null) {
        return null;
    }
    return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}

/**
 * Тип данных о файле — содержит информацию о содержимом, имени, размере и типе.
 */
type FileInfoType = {
    dataURL?: string | null;
    name: string;
    size: number;
    type: string;
};

/**
 * Обрабатывает один файл, преобразуя его в объект типа FileInfoType.
 *
 * @param file - файл из input[type="file"].
 */
function processFile(file: File): Promise<FileInfoType> {
    const { name, size, type } = file;
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onerror = reject;
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                resolve({
                    dataURL: addNameToDataURL(event.target.result, name),
                    name,
                    size,
                    type,
                });
            } else {
                resolve({
                    dataURL: null,
                    name,
                    size,
                    type,
                });
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Обрабатывает список файлов, возвращая массив обработанных файлов.
 *
 * @param files - список файлов из input[type="file"].
 */
function processFiles(files: FileList) {
    return Promise.all(Array.from(files).map(processFile));
}

/**
 * Предпросмотр одного файла. Отображает изображение или ссылку на скачивание.
 *
 * @param fileInfo - информация о файле.
 * @param registry - контекст формы, используется для перевода.
 */
function FileInfoPreview<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    fileInfo,
    registry,
}: {
    fileInfo: FileInfoType;
    registry: Registry<T, S, F>;
}) {
    const { translateString } = registry;
    const { dataURL, type, name } = fileInfo;

    if (!dataURL) {
        return null;
    }

    // Если это изображение — отображаем <img>
    if (type.indexOf('image') !== -1) {
        return <img src={dataURL} style={{ maxWidth: '100%' }} className="file-preview" />;
    }

    // Иначе даём возможность скачать
    return (
        <>
            {' '}
            <a download={`preview-${name}`} href={dataURL} className="file-download">
                {translateString(TranslatableString.PreviewLabel)}
            </a>
        </>
    );
}

/**
 * Отображает список информации по нескольким файлам с возможностью предпросмотра.
 *
 * @param filesInfo - массив информации о файлах.
 * @param registry - контекст формы, используется для перевода.
 * @param preview - флаг, разрешающий предпросмотр.
 */
function FilesInfo<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    filesInfo,
    registry,
    preview,
}: {
    filesInfo: FileInfoType[];
    registry: Registry<T, S, F>;
    preview?: boolean;
}) {
    if (filesInfo.length === 0) {
        return null;
    }

    const { translateString } = registry;

    return (
        <ul className="file-info">
            {filesInfo.map((fileInfo, key) => {
                const { name, size, type } = fileInfo;
                return (
                    <div key={key}>
                        <Markdown>{translateString(TranslatableString.FilesInfo, [name, type, String(size)])}</Markdown>
                        {preview && <FileInfoPreview<T, S, F> fileInfo={fileInfo} registry={registry} />}
                    </div>
                );
            })}
        </ul>
    );
}

/**
 * Преобразует массив строк в массив объектов
 *
 * @param dataURLs - массив Data URL.
 */
function extractFileInfo(dataURLs: string[]): FileInfoType[] {
    return dataURLs
        .filter((dataURL) => dataURL)
        .map((dataURL) => {
            const { blob, name } = dataURItoBlob(dataURL);
            return {
                dataURL,
                name,
                size: blob.size,
                type: blob.type,
            };
        });
}

/**
 * Виджет для загрузки файлов.
 * Поддерживает как одиночный, так и множественный выбор.
 *
 * ### Основные функции:
 * - Загрузка файлов через `<input type="file">`.
 * - Отображение информации о файле.
 * - Предпросмотр изображений и других файлов.
 * - Удаление выбранного файла.
 *
 * @param props - стандартные пропсы виджета rjsf.
 */
export function FileWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const { disabled, readonly, multiple, onChange, value, options, registry } = props;

    /**
     * Состояние хранения информации о выбранных файлах.
     */
    const [filesInfo, setFilesInfo] = useState<FileInfoType[] | null>(
        Array.isArray(value) ? extractFileInfo(value) : extractFileInfo([value])
    );

    /**
     * Обработчик изменения файла.
     *
     * @param event - событие изменения инпута.
     */
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files) {
                return;
            }
            processFiles(event.target.files).then((filesInfoEvent) => {
                const newValue = filesInfoEvent.map((fileInfo) => fileInfo.dataURL);
                if (multiple && filesInfo) {
                    setFilesInfo(filesInfo.concat(filesInfoEvent[0]));
                    onChange(value.concat(newValue[0]));
                } else {
                    setFilesInfo(filesInfoEvent);
                    onChange(newValue[0]);
                }
            });
        },
        [multiple, value, filesInfo, onChange]
    );

    /**
     * Функция очистки выбора файла.
     */
    const clearSelection = () => {
        setFilesInfo(null);
        onChange(undefined);
    };

    return filesInfo && filesInfo.length ? (
        <>
            {props?.schema.title}
            <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
                <span className="pi pi-times file-cross" onClick={clearSelection} />
                <FilesInfo<T, S, F> filesInfo={filesInfo} registry={registry} preview={options.filePreview as any} />
            </div>
        </>
    ) : (
        <div>
            <label className={disabled || readonly ? 'file-upload-wrapper-disabled' : 'file-upload-wrapper'}>
                <input
                    type="file"
                    disabled={disabled || readonly}
                    accept={options.accept ? String(options.accept) : undefined}
                    onChange={handleChange}
                />
                <span className="pi pi-upload" style={{ marginRight: '0.5rem' }} />
                {props?.schema.title}
            </label>
        </div>
    );
}
