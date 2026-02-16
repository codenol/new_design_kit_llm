import isEmpty from 'lodash/isEmpty';
import { TreeProps } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import { ObjectUtils } from 'primereact/utils';

export interface treeFilterFunctionProps {
    filterValue: TreeProps['filterValue'];
    value: TreeProps['value'];
    filterBy: TreeProps['filterBy'];
    filterMode: TreeProps['filterMode'];
    filterLocale: TreeProps['filterLocale'];
}

export const treeFilterFunction = (props: treeFilterFunctionProps) => {
    const { filterValue = '', value = [], filterBy = 'label', filterMode = 'lenient', filterLocale } = props;
    const isNodeLeaf = (node) => (node.leaf === false ? false : !(node.children && node.children.length));

    const isFilterMatched = (node, { searchFields, filterText, isStrictMode }) => {
        let matched = false;
        searchFields.forEach((field) => {
            const fieldValue = String(ObjectUtils.resolveFieldData(node, field)).toLocaleLowerCase(filterLocale);

            if (fieldValue.indexOf(filterText) > -1) {
                matched = true;
            }
        });

        if (!matched || (isStrictMode && !isNodeLeaf(node))) {
            matched = findFilteredNodes(node, { searchFields, filterText, isStrictMode }) || matched;
        }

        return matched;
    };

    const findFilteredNodes = (node, paramsWithoutNode) => {
        if (node) {
            let matched = false;

            if (node.children) {
                const childNodes = [...node.children];

                node.children = [];
                childNodes.forEach((childNode) => {
                    const copyChildNode = { ...childNode };

                    if (isFilterMatched(copyChildNode, paramsWithoutNode)) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                });
            }

            if (matched) {
                node.expanded = true;

                return true;
            }
        }
        return false;
    };

    let filteredNodes: TreeNode[] = [];
    if (isEmpty(filterValue)) {
        filteredNodes = value ?? [];
    } else {
        const searchFields = filterBy.split(',');
        const filterText = filterValue.toLocaleLowerCase(filterLocale);
        const isStrictMode = filterMode === 'strict';
        value?.forEach((node) => {
            const copyNode = { ...node };
            const paramsWithoutNode = { searchFields, filterText, isStrictMode };

            if (
                (isStrictMode &&
                    (findFilteredNodes(copyNode, paramsWithoutNode) || isFilterMatched(copyNode, paramsWithoutNode))) ||
                (!isStrictMode &&
                    (isFilterMatched(copyNode, paramsWithoutNode) || findFilteredNodes(copyNode, paramsWithoutNode)))
            ) {
                filteredNodes.push(copyNode);
            }
        });
    }
    return filteredNodes ?? [];
};
