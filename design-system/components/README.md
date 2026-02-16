# Компоненты

## PrimeReact (стили дополнены в overrides)

| Компонент | Варианты / заметки |
|-----------|---------------------|
| Button | primary (класс `p-button-pr`), outlined, rounded, icon-only |
| InputText | размер small (`p-inputtext-sm`) |
| Dropdown | стандартный |
| InputSwitch | переключатель |
| DataTable | sortable, selection, stripedRows |
| Column | selectionMode="multiple" |
| Menu | popup (выпадающее меню) |
| Breadcrumb | home + model |
| Toast | через useToast (uikit) |
| ConfirmDialog | глобальный, через useConfirmDialog (uikit) |
| Checkbox | в таблицах |
| Dialog, Panel, Accordion, Tooltip | по необходимости |

## uikit

| Компонент | Варианты |
|-----------|----------|
| StatusBadge | code: ok, warning, critical, info, in-process, not-available, new, down; isSmall |
| CustomBreadCrumb | router, action, excludePaths, home (требует use-react-router-breadcrumbs) |
| Message, Grid, Tree, DialogTabs, MultiSelect, DataTableDynamic | см. uikit/README.md |
| Контексты | ToastProvider, ConfirmDialogProvider, BlockUIProvider, ContextMenuProvider |

## Классы (без компонента)

- `status-badge`, `status-badge--ok`, `status-badge--warning`, `status-badge--critical`, `status-badge--info`, `status-badge--not-available`, `status-badge--in-process`, `status-badge--new`, `smooth-corners`
- `card`, `card-w-title`
- `layout-wrapper`, `layout-sidebar`, `layout-main`, `layout-menu`, `router-link-exact-active`
- `sticky-menu`, `button-danger`, `box-shadow`
