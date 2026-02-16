import React, { useState, useEffect, useRef } from 'react';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import { TabView, TabPanel } from 'primereact/tabview';
import { Menubar } from 'primereact/menubar';
import { SvgIcon } from '../SvgIcon';
import './dialogTabs.scss';

export interface DialogTabsProps {
    /**
     * Заголовок диалога.
     */
    title: string;
    /**
     * Массив объектов, по которым будет происходить переключение внутри диалога.
     */
    data: DialogTabsData[];
    /**
     * Видно ли диалог
     */
    isVisible: boolean;
    /**
     * Коллбек для изменения видимости диалога
     */
    setHide: () => void;
    /**
     * Доступно ли скачивание
     *
     * @default true
     */
    isSave?: boolean;
}

/**
 * Описание переключаемых данных внутри DialogTabs.
 */
export interface DialogTabsData {
    label: string;
    icon: string;
    /**
     * Информация для пользователя.
     */
    content: string;
    /**
     * Время, использующееся в названии файла при экспорте.
     */
    time: string;
    /**
     * Стиль контейнера с content.
     */
    style?: React.CSSProperties;
}

/**
 * Компонент, предоставляющий диалог с переключаемым по табам контентом в виде текста с возможностью скачивания контента в формате лога.
 */
export const DialogTabs: React.FC<DialogTabsProps> = ({ title, data = [], isVisible, setHide, isSave = true }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const EMPTY_MESSAGE = 'Нет данных';
    const CLOSE_LABEL = 'Закрыть';

    useEffect(() => {
        setActiveIndex(0);
    }, [isVisible]);

    /**
     * Функция для скачивания файла лога.
     * @param dataFile - массив данных IData[].
     * @param nameFile - название файла.
     * @param time - время, которое будет добавлено к названию файла.
     * @param fileExt - расширение файла.
     */
    const SaveFile = (dataFile, nameFile, time: string, fileExt = 'txt') => {
        let blob;
        if (dataFile.length > 1) {
            blob = new Blob(
                [
                    '******************************************************************************** ',
                    '\n',
                    '* ERROR:                                                                       *',
                    '\n',
                    '******************************************************************************** ',
                    '\n',
                    '\n',
                    ...dataFile[0].content,
                    '\n',
                    '\n',
                    '******************************************************************************** ',
                    '\n',
                    '* LOG:                                                                         * ',
                    '\n',
                    '******************************************************************************** ',
                    '\n',
                    '\n',
                    ...dataFile[1].content,
                ],
                { type: 'text/plain' }
            );
        } else {
            blob = new Blob(
                [
                    '******************************************************************************** ',
                    '\n',
                    '* LOG:                                                                         * ',
                    '\n',
                    '******************************************************************************** ',
                    '\n',
                    '\n',
                    ...dataFile[0].content,
                ],
                { type: 'text/plain' }
            );
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${
            time ? time.split('+')[0] : new Date().toISOString().slice(0, 19).replace('T', ' ')
        }_${nameFile}.${fileExt}`;
        link.href = url;
        link.click();
    };

    const BtnTabs = () => (
        <TabMenu
            model={data}
            activeIndex={activeIndex}
            onTabChange={(e) => {
                setActiveIndex(e.index);
            }}
        />
    );

    const items = [
        {
            label: 'Скачать',
            icon: <SvgIcon name={'save'} style={{ width: '1rem', marginRight: '.4rem' }} size={18} />,
            command: () => SaveFile(data, title, data[activeIndex].time, 'log'),
        },
    ];

    const HeaderDialog = (text) => (
        <>
            <p style={{ margin: 0 }}>{text}</p>
        </>
    );

    return (
        <Dialog
            header={() => HeaderDialog(title)}
            visible={isVisible}
            style={{ width: '60%', height: '80%' }}
            draggable={false}
            footer={<Button label={CLOSE_LABEL} onClick={setHide} autoFocus />}
            onHide={setHide}
        >
            <>
                <div className="dialog-sticky-menu">
                    <Menubar
                        start={<BtnTabs />}
                        end={<Menubar style={{ border: 'none', padding: 0 }} model={isSave ? items : []} />}
                    />
                </div>
                <TabView
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                    className="p-tabview--hidden"
                >
                    {data.map((tab) => (
                        <TabPanel
                            style={{ paddingTop: '0', marginTop: '4rem' }}
                            key={tab.label}
                            prevButton={undefined}
                            nextButton={undefined}
                            closeIcon={undefined}
                        >
                            {tab.content === undefined || tab.content === '' || !tab.content.length ? (
                                <p>{EMPTY_MESSAGE}</p>
                            ) : (
                                <div ref={contentRef}>
                                    <pre style={{ margin: '0' }}>
                                        <code style={{ whiteSpace: 'pre-wrap', ...tab.style }}>{tab.content}</code>
                                    </pre>
                                </div>
                            )}
                        </TabPanel>
                    ))}
                </TabView>
            </>
        </Dialog>
    );
};
