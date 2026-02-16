import {
    getFormatDate,
    setFormatDate,
    getSvgSpritePath,
    setSvgSpritePath,
    getUIkitSettings,
    setUIkitSettings,
    setUIkitDebug,
    setUIkitLogLevel,
} from 'uikit/app/app.settings';
import { EUIkitLogLevels } from 'uikit/types/settings.types';

beforeAll(() => {
    setUIkitDebug(true);
    setUIkitLogLevel(EUIkitLogLevels.Debug);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Тесты для настроек uikit`a', () => {
    it('дефолтные методы получения и изменения стейта с ожидаемыми данными', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const awaitedModel = { formatDate: true, svgSpritePath: '/src/assets/icons.svg' };
        setUIkitSettings(awaitedModel);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitSettings()).toEqual(awaitedModel);

        const awaitedModel2 = { formatDate: false, svgSpritePath: '/src/assets/icons2.svg' };
        setUIkitSettings(awaitedModel2);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitSettings()).toEqual(awaitedModel2);
    });
    it('дефолтные методы получения и изменения стейта с некорректным флагом FormatData', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const modelWithIncorrectFormatData = {
            formatDate: null as unknown as boolean,
            svgSpritePath: '/src/assets/icons.svg',
        };
        setUIkitSettings(modelWithIncorrectFormatData);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(getUIkitSettings()).not.toEqual(modelWithIncorrectFormatData);
    });
    it('дефолтные методы получения и изменения стейта с некорректным полем SvgSpritePath', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const modelWithIncorrectSvgSpritePath = {
            formatDate: true,
            svgSpritePath: null as unknown as string,
        };
        setUIkitSettings(modelWithIncorrectSvgSpritePath);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(getUIkitSettings()).not.toEqual(modelWithIncorrectSvgSpritePath);
    });
    it('дефолтные методы получения и изменения стейта с полностью некорректные данные', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const modelWithIncorrectSvgSpritePathAndFormatData = {
            formatDate: null as unknown as boolean,
            svgSpritePath: null as unknown as string,
        };
        setUIkitSettings(modelWithIncorrectSvgSpritePathAndFormatData);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(getUIkitSettings()).not.toEqual(modelWithIncorrectSvgSpritePathAndFormatData);
    });
    it('дефолтные методы получения и изменения стейта с пустым объект', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const blankModel = {};
        setUIkitSettings(blankModel);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitSettings()).not.toEqual(blankModel);
    });
    it('методы получения и изменения поля SvgSpritePath', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const newSvgSpritePath = '/src/assets/icons2.svg';
        setSvgSpritePath(newSvgSpritePath);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getSvgSpritePath()).toEqual(newSvgSpritePath);

        const newSvgSpritePath2 = '/src/assets/icons3.svg';
        setSvgSpritePath(newSvgSpritePath2);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getSvgSpritePath()).toEqual(newSvgSpritePath2);
    });
    it('методы получения и изменения флага FormatDate', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const newFormatData = true;
        setFormatDate(newFormatData);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getFormatDate()).toEqual(newFormatData);

        setFormatDate(!newFormatData);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getFormatDate()).toEqual(!newFormatData);
    });
});
