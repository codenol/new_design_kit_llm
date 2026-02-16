interface IisVisible {
    /**
     * Элемент, который ищем
     */
    target: HTMLElement;
    /**
     * Элемент, на котором ищем
     */
    viewport?: HTMLElement;
    /**
     * Офсет для экрана
     */
    offset?: IOffset;
    /**
     * Множитель учета размеров элемента поиска
     */
    threshold?: number;
}

interface IOffset {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}

const DEFAULT_OFFSET = { top: 0, left: 0, right: 0, bottom: 0 };

/**
 * Функция проверки видимости компонента на экране
 * @returns
 */
export const isVisible = ({ target, viewport, offset, threshold = 0 }: IisVisible) => {
    const scroll = {
        y: viewport ? Math.abs(viewport.getBoundingClientRect().top) : window.pageYOffset,
        x: viewport ? Math.abs(viewport.getBoundingClientRect().left) : window.pageXOffset,
    };

    const offsetDefault = { ...DEFAULT_OFFSET, ...offset };

    const targetPosition = {
        top: scroll.y + target.getBoundingClientRect().top,
        left: scroll.x + target.getBoundingClientRect().left,
        right: scroll.x + target.getBoundingClientRect().right,
        bottom: scroll.y + target.getBoundingClientRect().bottom,
        height: target.getBoundingClientRect().height,
        width: target.getBoundingClientRect().width,
    };
    const windowPosition = {
        top: scroll.y + offsetDefault.top,
        left: scroll.x + offsetDefault.left,
        right: scroll.x + (document.documentElement.clientWidth - offsetDefault.right),
        bottom: scroll.y + (document.documentElement.clientHeight - offsetDefault.bottom),
    };
    if (
        targetPosition.bottom - targetPosition.height * threshold > windowPosition.top &&
        targetPosition.top + targetPosition.height * threshold < windowPosition.bottom &&
        targetPosition.right - targetPosition.width * threshold > windowPosition.left &&
        targetPosition.left + targetPosition.width * threshold < windowPosition.right
    ) {
        return true;
    }
    return false;
};
