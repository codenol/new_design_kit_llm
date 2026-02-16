export type TUIkitSettings = {
    svgSpritePath: string;
    formatDate: boolean;
};

export type TGetUIkitSettings = () => TUIkitSettings;
export type TSetUIkitSettings = (newUIkitSettings: Partial<TUIkitSettings>) => void;
export type TGetSvgSpritePath = () => TUIkitSettings['svgSpritePath'];
export type TSetSvgSpritePath = (newSvgSpritePath: TUIkitSettings['svgSpritePath']) => void;
export type TGetFormatDate = () => TUIkitSettings['formatDate'];
export type TSetFormatDate = (newFormatDate: TUIkitSettings['formatDate']) => void;

export enum EUIkitLogLevels {
    None = 0,
    Error = 1,
    Warning = 2,
    Info = 4,
    Debug = 5,
}
