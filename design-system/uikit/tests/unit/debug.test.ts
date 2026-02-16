import { getUIkitDebug, setUIkitDebug, getUIkitLogLevel, setUIkitLogLevel } from 'uikit/app/app.settings';
import { EUIkitLogLevels } from 'uikit/types/settings.types';

afterEach(() => {
    jest.clearAllMocks();
});

describe('Тесты для отладочных настроек uikit`a', () => {
    it('методы получения и изменения debug-флага и уровня логирования (loglevel), с корректными данными', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const awaitedDebugFlagState = true;
        const awaitedLogLevelState = EUIkitLogLevels.Debug;

        setUIkitDebug(awaitedDebugFlagState);
        setUIkitLogLevel(awaitedLogLevelState);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitDebug()).toEqual(awaitedDebugFlagState);
        expect(getUIkitLogLevel()).toEqual(awaitedLogLevelState);

        setUIkitDebug(!awaitedDebugFlagState);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitDebug()).toEqual(!awaitedDebugFlagState);
        expect(getUIkitLogLevel()).toEqual(EUIkitLogLevels.None);
    });
    it('методы получения и изменения debug-флага и уровня логирования (loglevel), с некорректными данными', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const awaitedDebugFlagState = true;
        const awaitedLogLevelState = EUIkitLogLevels.Debug;

        setUIkitDebug(awaitedDebugFlagState);
        setUIkitLogLevel(awaitedLogLevelState);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(getUIkitDebug()).toEqual(awaitedDebugFlagState);
        expect(getUIkitLogLevel()).toEqual(awaitedLogLevelState);

        const brokeDebugFlagState = null as unknown as boolean;
        const brokeLogLevelState = !EUIkitLogLevels.Error as unknown as EUIkitLogLevels;

        setUIkitDebug(brokeDebugFlagState);
        setUIkitLogLevel(brokeLogLevelState);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(getUIkitDebug()).toEqual(awaitedDebugFlagState);
        expect(getUIkitLogLevel()).toEqual(awaitedLogLevelState);
    });
});
