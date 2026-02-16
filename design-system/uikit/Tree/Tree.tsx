import React, {
    forwardRef,
    memo,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import isFunction from 'lodash/isFunction';
import { Tree, TreeFilterOptions, TreeProps } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import { treeFilterFunction } from './utils/treeFilterFunction';

export interface ITreeFilterOptions extends TreeFilterOptions {
    displayValue?: TreeNode[];
}

export interface ITreeComponentProps extends TreeProps {
    /**
     * @description Строка\ReactNode отображаемая если фильтрация не возвращает никаких результатов или если передан пустой массив значений.
     * @default undefined
     */
    emptyMessage?: string | ReactNode;
    /**
     * @description Колбек возвращающий отображаемые ноды.
     * @default undefined
     */
    onDisplayChange?: (displayValue: TreeNode[]) => void;
    /**
     * @description Темплейт для фильтра с дополнительным массивом отображаемых нод в объекте options.
     * @default undefined
     */
    filterTemplate?: ReactNode | ((options: ITreeFilterOptions) => ReactNode);
}

export interface ITreeComponent {
    /**
     * @description Метод получения текущего значения фильтра для компонента.
     * @returns {string} - возвращает текущее значение фильтра.
     */
    getFilterValue(): string;
    /**
     * @description Метод получения отображаемых нод.
     * @returns {TreeNode[]} - возвращает массив отображаемых нод.
     */
    getDisplayValues(): TreeNode[];
    /**
     * @description Метод установки нового значения фильтра для компонента.
     * @param {string} newFilterValue - ожидает новое значение фильтра для компонента.
     */
    setFilterValue(newFilterValue: string): void;
    /**
     * @description Метод получения DOM-элемента компонента.
     * @returns {HTMLDivElement | undefined} - возвращает HTMLDivElement, если он существует.
     */
    getElement(): HTMLDivElement | undefined;
}

export const TreeComponent = memo(
    forwardRef<ITreeComponent, ITreeComponentProps>((props, ref) => {
        const {
            value,
            filterValue,
            onFilterValueChange,
            filterTemplate,
            loading,
            emptyMessage,
            footer,
            filterBy,
            filterLocale,
            filterMode,
            onDisplayChange,
        } = props;

        const [displayNodes, setDisplayNodes] = useState<TreeNode[]>([]);
        const [componentFilterValue, setComponentFilterValue] = useState<string>(filterValue ?? '');
        const [isTreeEmpty, setIsTreeEmpty] = useState(false);
        const treeComponentRef = useRef<Tree>(null);

        const changingDisplayingNodes = useCallback(
            (newNodesToDisplay: TreeNode[]) => {
                setDisplayNodes(newNodesToDisplay);
                if (emptyMessage !== undefined && !loading && newNodesToDisplay && !newNodesToDisplay.length)
                    setIsTreeEmpty(true);
                else setIsTreeEmpty(false);

                if (onDisplayChange) onDisplayChange(newNodesToDisplay);
            },
            [emptyMessage, loading, onDisplayChange]
        );

        useEffect(() => {
            if (!componentFilterValue && !filterValue && value) changingDisplayingNodes(value);
            else if (componentFilterValue && value)
                changingDisplayingNodes(
                    treeFilterFunction({
                        filterValue: componentFilterValue,
                        value,
                        filterBy,
                        filterLocale,
                        filterMode,
                    })
                );
        }, [changingDisplayingNodes, componentFilterValue, filterBy, filterLocale, filterMode, filterValue, value]);

        useImperativeHandle(ref, () => ({
            getElement() {
                return treeComponentRef.current?.getElement();
            },
            getDisplayValues() {
                return displayNodes;
            },
            getFilterValue() {
                return componentFilterValue;
            },
            setFilterValue(newFilterValue) {
                setComponentFilterValue(newFilterValue);
            },
        }));

        const MutateFilterTemplate = (options) => {
            if (filterTemplate && isFunction(filterTemplate)) {
                const mutatedOptions: ITreeFilterOptions = { ...options, displayValue: displayNodes };
                return filterTemplate(mutatedOptions);
            }
            if (filterTemplate) return filterTemplate;
            return undefined;
        };

        const mutatedProps = { ...props };

        mutatedProps.filterTemplate = filterTemplate ? MutateFilterTemplate : undefined;

        return (
            <Tree
                value={displayNodes}
                ref={treeComponentRef}
                filterValue={componentFilterValue}
                onFilterValueChange={(e) =>
                    onFilterValueChange === undefined ? setComponentFilterValue(e.value) : onFilterValueChange(e)
                }
                footer={
                    <>
                        {isTreeEmpty ? emptyMessage : undefined}
                        {footer}
                    </>
                }
                {...mutatedProps}
            />
        );
    })
);
