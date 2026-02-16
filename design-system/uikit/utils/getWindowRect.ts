// Получение координат всего окна
export const getWindowRect = () => ({
    height: window.innerHeight,
    width: window.innerWidth,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    toJSON: () => {},
});
