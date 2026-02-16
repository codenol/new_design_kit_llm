# Design System (Venom UI)

Переносимая дизайн-система Venom UI: токены, layout, переопределения PrimeReact, uikit.

## Установка в новом проекте

1. Установить зависимости:
   - `primereact`, `primeflex`, `primeicons`
   - `react`, `react-dom`, `react-router-dom`
   - `sass`, `classnames`

2. Подключить стили в точке входа (например `src/App.scss`) **в таком порядке**:
   - CSS PrimeReact: `primereact/resources/primereact.min.css`, `primeicons/primeicons.css`, `primeflex/primeflex.css`
   - Токены: `../design-system/tokens` (или актуальный путь до папки design-system)
   - Helpers: `../design-system/helpers`
   - Layout: `../design-system/layout`
   - Overrides: `../design-system/overrides/_primereact`
   - uikit: `../design-system/uikit/styles/tokens`, `../design-system/uikit/styles/styles`, `../design-system/uikit/Grid/grid`, `../design-system/uikit/Tree/tree`, `../design-system/uikit/Message/message`, `../design-system/uikit/DialogTabs/dialogTabs`, `../design-system/uikit/StatusBadge/statusBadge`

3. Настроить алиасы в `tsconfig.json`:
   - `"baseUrl": "."` (корень проекта, где лежит design-system)
   - `"paths": { "uikit": ["design-system/uikit/*"] }`

4. Темы: вешать на `body` классы `layout-theme-light` или `layout-theme-dark` для принудительной темы (по умолчанию используется `prefers-color-scheme`).

## Структура

- **tokens/** — SASS-переменные (`_variables.scss`), CSS-переменные тем light/dark (`_theme.scss`).
- **layout/** — обёртка (`.layout-wrapper`), сайдбар (`.layout-sidebar`), контент (`.layout-main`), меню, типографика, миксины, адаптив.
- **helpers/** — миксины scrollbar и aspect-ratio.
- **overrides/** — переопределения PrimeReact и утилитарные классы (`.card`, `.field`, `.sticky-menu`, `.p-datatable`, `.p-chip`, `.alert-name-body`, `.button-danger` и т.д.).
- **uikit/** — копия uikit: компоненты (StatusBadge, Tree, Message, BreadCrumbs, DataTableDynamic, …), контексты (Toast, ConfirmDialog, BlockUI), стили и токены Figma.

## Компоненты

- PrimeReact: Button, Dialog, InputText, DataTable, Dropdown, Checkbox, Toast, Menu, TabView, Panel, Accordion, Tooltip и др. — использовать как есть, стили дополнены в overrides.
- uikit: см. `uikit/README.md`; StatusBadge — варианты `ok`, `warning`, `critical`, `info`, `down`, `not-available`, `in-process`, `new` (+ модификаторы `--small`, `--animate`).
