import {
    TUIkitSettings,
    TSetFormatDate,
    TGetUIkitSettings,
    TSetUIkitSettings,
    TGetSvgSpritePath,
    TSetSvgSpritePath,
    TGetFormatDate,
    EUIkitLogLevels,
} from '../types/settings.types';

export interface IUIkitSettings {
    /**
     * Получение текущего состояния debug-флага.
     * @default false
     * @returns {boolean} Текущее состояние debug-флага
     */
    getUIkitDebug: () => boolean;
    /**
     * Установка нового состояния debug-флага.
     * @param {boolean} newDebugState
     */
    setUIkitDebug: (newDebugState: boolean) => void;
    /**
     * Получение текущего уровня логирования.
     * @default 0
     * @returns {EUIkitLogLevels} Текущий уровень логирования.
     */
    getUIkitLogLevel: () => EUIkitLogLevels;
    /**
     * Установка нового уровня логирования.
     * @param {EUIkitLogLevels} newLogLevelState
     */
    setUIkitLogLevel: (newLogLevelState: EUIkitLogLevels) => void;
    /**
     * Получение текущих настроек UIkit.
     * @readonly
     * @default ({
         formatDate: false,
         svgSpritePath: '/src/assets/sprite/icons.svg',
     })
     @returns {TUIkitSettings} Текущий уровень логирования.
     */
    getUIkitSettings: TGetUIkitSettings;
    /**
     * Установка нового уровня логирования.
     * @param {Partial<TUIkitSettings>} newUIkitSettings
     */
    setUIkitSettings: TSetUIkitSettings;
}

const UIkitSettings = (() => {
    /** Единственный экземпляр синглтона */
    let _instance: IUIkitSettings;

    /** Приватные переменная для хранения состояния debug-флага и уровня логирования */
    let _uikitDebug: boolean = false;
    let _uikitLogLevel: EUIkitLogLevels = EUIkitLogLevels.Info;

    /** Геттер и сеттер для debug-флага */
    const uikitDebugStateGetter: IUIkitSettings['getUIkitDebug'] = () => _uikitDebug;
    const uikitDebugStateSetter: IUIkitSettings['setUIkitDebug'] = (newDebugState) => {
        if (typeof newDebugState === 'boolean') _uikitDebug = newDebugState;
        else
            console.error(
                `[UIKIT] UIkitSettings: не удалось изменить состояния флага Debug, передан неверный тип флага`
            );
    };

    /** Геттер и сеттер для уровня логирования */
    const uikitLogLevelStateGetter: IUIkitSettings['getUIkitLogLevel'] = () => {
        if (_uikitDebug) return _uikitLogLevel;
        return EUIkitLogLevels.None;
    };
    const uikitLogLevelStateSetter: IUIkitSettings['setUIkitLogLevel'] = (newLogLevelState: EUIkitLogLevels) => {
        if (Object.values(EUIkitLogLevels).includes(newLogLevelState)) _uikitLogLevel = newLogLevelState;
        else console.error(`[UIKIT] UIkitSettings: не удалось изменить LogLevel, передано некорректное значение`);
    };

    /** Приватная переменная для хранения настроек uikit'a */
    let _uikitSettings: Readonly<TUIkitSettings> = Object.freeze({
        formatDate: false,
        svgSpritePath: '/src/assets/sprite/icons.svg',
    });

    /** Геттер и сеттер для настроек uikit'a */
    const uikitSettingsGetter: TGetUIkitSettings = () => ({ ..._uikitSettings });
    const uikitSettingsSetter: TSetUIkitSettings = (newSettings) => {
        const uikitSettingsCopy = { ..._uikitSettings };
        if (newSettings.formatDate !== undefined) {
            if (typeof newSettings.formatDate === 'boolean') uikitSettingsCopy.formatDate = newSettings.formatDate;
            else if (typeof newSettings.formatDate !== 'boolean' && uikitLogLevelStateGetter() >= EUIkitLogLevels.Error)
                console.error(
                    '[UIKIT] UIkitSettings: не удалось изменить состояния флага formatDate, передан неверный тип флага'
                );
        }
        if (newSettings.svgSpritePath !== undefined) {
            if (typeof newSettings.svgSpritePath === 'string')
                uikitSettingsCopy.svgSpritePath = newSettings.svgSpritePath;
            else if (
                typeof newSettings.svgSpritePath !== 'string' &&
                uikitLogLevelStateGetter() >= EUIkitLogLevels.Error
            )
                console.error(
                    '[UIKIT] UIkitSettings: не удалось изменить путь до svg спрайта, передано некорректное значение'
                );
        }
        _uikitSettings = uikitSettingsCopy;
    };

    /** Приватный метол для создания настроек uikit'a с публичным API */
    const _createInstance = (): IUIkitSettings => ({
        getUIkitDebug: uikitDebugStateGetter,
        setUIkitDebug: uikitDebugStateSetter,
        getUIkitLogLevel: uikitLogLevelStateGetter,
        setUIkitLogLevel: uikitLogLevelStateSetter,
        getUIkitSettings: uikitSettingsGetter,
        setUIkitSettings: uikitSettingsSetter,
    });

    return {
        /**
         * Получение единственного экземпляр синглтона.
         * @description Создает экземпляр при первом вызове, при всех последующих вызовах возвращает первый созданный экземпляр.
         * @returns {IUIkitSettings} Единственный экземпляр настроек UIkit
         */
        getInstance: (): IUIkitSettings => {
            if (!_instance) {
                _instance = _createInstance();
            }
            return _instance;
        },
    };
})();

// Создания инстанса настроек uikit'a
const UIkitSettingsInstance = UIkitSettings.getInstance();

// Экспорт методов получения и изменения Debug флага
export const getUIkitDebug: IUIkitSettings['getUIkitDebug'] = UIkitSettingsInstance.getUIkitDebug;
export const setUIkitDebug: IUIkitSettings['setUIkitDebug'] = UIkitSettingsInstance.setUIkitDebug;

// Экспорт методов получения и изменения уровня логирования (LogLevel)
export const getUIkitLogLevel: IUIkitSettings['getUIkitLogLevel'] = UIkitSettingsInstance.getUIkitLogLevel;
export const setUIkitLogLevel: IUIkitSettings['setUIkitLogLevel'] = UIkitSettingsInstance.setUIkitLogLevel;

// Экспорт методов получения и изменения настроек
export const getUIkitSettings: TGetUIkitSettings = UIkitSettingsInstance.getUIkitSettings;
export const setUIkitSettings: TSetUIkitSettings = UIkitSettingsInstance.setUIkitSettings;
export const getSvgSpritePath: TGetSvgSpritePath = () => getUIkitSettings().svgSpritePath;
export const setSvgSpritePath: TSetSvgSpritePath = (newSvgSpritePath) =>
    setUIkitSettings({ svgSpritePath: newSvgSpritePath });
export const getFormatDate: TGetFormatDate = () => getUIkitSettings().formatDate;
export const setFormatDate: TSetFormatDate = (newFormatDate) => setUIkitSettings({ formatDate: newFormatDate });
