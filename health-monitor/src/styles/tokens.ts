/**
 * Design Tokens — единый источник стилей.
 * Все визуальные константы проекта собраны здесь.
 * При переходе на новый дизайн (Figma) — меняем только этот файл.
 *
 * Версия: синхронизировано с Figma (DESIGN-SYSTEM Skala^R–1, node 5241-67289)
 */

// ─── Цвета ────────────────────────────────────────────────────────────────────

export const colors = {

  // Фоны (от тёмного к светлому)
  bg: {
    root:      '#141824',   // корень приложения, скролл-трек
    elevated:  '#151B27',   // FilterBar, drawer, тултипы
    surface:   '#17212F',   // карточки ПАК, инпуты, MiniMap/Controls
    overlay:   '#141E2C',   // GroupNode, поиск в DetailPanel
    control:   '#172030',   // кнопка шаблонов, управляющие поверхности
    footer:    '#111623',   // футер GroupNode
    canvas:    '#131824',   // холст React Flow, раскрытый аккордион
    nodeList:  '#121727',   // список узлов в CategorySection
    sidebar:   '#0D1117',   // sidebar background
    content:   '#0F1520',   // content area background
    navActive: '#1A2535',   // active nav item background
  },

  // Границы
  border: {
    subtle:    '#233752',   // основные границы, разделители
    muted:     '#263E56',   // тултипы, scrollbar thumb
    dim:       '#263D55',   // кнопочные рамки
    flow:      '#26405A',   // рёбра React Flow
    inner:     '#1A2E44',   // разделитель внутри тултипа
    separator: '#141E2C',   // разделитель категорий в GroupNode
    focus:     '#354C6A',   // фокус инпута, hover-состояния
  },

  // Текст (от яркого к приглушённому)
  text: {
    bright:    '#E8EBF0',   // заголовки панелей
    vivid:     '#E2E6EC',   // названия групп в GroupNode
    primary:   '#DFE2E6',   // основной читаемый текст
    secondary: '#CDD0D8',   // названия индикаторов
    tertiary:  '#B5B9C5',   // категории в карточке узла
    muted:     '#B5B9C5',   // sub-indicator, текст проблем
    label:     '#A8AAB0',   // метки, вторичные значения, Controls
    role:      '#8E9099',   // атрибут роли узла
    dim:       '#A8AAB0',   // временны́е метки, хлебные крошки
    subtle:    '#5C6475',   // описания, подсказки правил, «Проблемы»
    ghost:     '#404855',   // разделители, шевроны, неактивные элементы
  },

  // Статусы — основной цвет
  status: {
    ok:       '#56B361',
    warning:  '#E19109',
    critical: '#D41F20',
    unknown:  '#A8AAB0',
  },

  // Статусы — светлый (для текста на тёмном фоне, бейджи)
  statusLight: {
    ok:       '#72C87C',
    warning:  '#F8AE36',
    critical: '#E53334',
    unknown:  '#C8CAD0',
  },

  // Статусы — фоновый (полупрозрачный)
  statusBg: {
    ok:       'rgba(86,179,97,0.10)',
    warning:  'rgba(255,197,112,0.12)',
    critical: 'rgba(212,31,32,0.10)',
    unknown:  'rgba(168,170,176,0.08)',
  },

  // Акцент — cyan (активные элементы, выделение, hover)
  accent: {
    primary:   '#60C4DD',   // hover-текст, активные ссылки
    light:     '#C9EDF6',   // текст на акцентном фоне
    border:    '#354C6A',   // рамка акцента
    badge:     '#5787C4',   // бейдж активного состояния
    tealDark:  '#12708C',   // шапка/заголовок teal
    tealBright:'#00BEC8',   // яркий teal-акцент
  },

  // Интерактивные состояния
  interactive: {
    accentText:    '#60C4DD',  // hover-текст кнопки шаблонов
    accentBorder:  '#354C6A',  // hover-рамка кнопки шаблонов
    controlHover:  '#1C2A3E',  // hover фона Controls React Flow
    scrollbarHover:'#404855',  // hover scrollbar thumb
  },

} as const;

// ─── Типографика ──────────────────────────────────────────────────────────────

export const typography = {
  fontSans: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  fontMono: 'monospace',

  // Размеры (px)
  size: {
    xs:   9,   // подсказки правил
    sm:   10,  // бейджи, мелкие метки
    md:   11,  // вторичный текст
    base: 12,  // инпуты, вкладки
    lg:   13,  // основной текст, заголовки карточек
    xl:   15,  // заголовок панели
    hero: 32,  // иконка пустого состояния
  },

  weight: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
} as const;

// ─── Отступы (px) ─────────────────────────────────────────────────────────────

export const spacing = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
  6: 16,
  7: 20,
  8: 32,
  9: 40,
  10: 80,
} as const;

// ─── Радиусы скруглений (px) ──────────────────────────────────────────────────

export const radius = {
  xs:   3,
  sm:   4,
  md:   5,
  lg:   8,
  xl:   12,
  full: '50%',
} as const;

// ─── Тени ─────────────────────────────────────────────────────────────────────

export const shadows = {
  tooltip:  '0 6px 20px rgba(0,0,0,0.7)',
  drawer:   '-8px 0 40px rgba(0,0,0,0.7)',
  backdrop: 'rgba(0,0,0,0.55)',
} as const;

// ─── Лэйаут ──────────────────────────────────────────────────────────────────

export const layout = {
  // Старые размеры (обратная совместимость)
  headerHeight:     48,
  filterBarHeight:  40,
  mainPaddingV:     16,
  mainPaddingH:     20,
  pakSectionGap:    12,
  detailPanelWidth: 'min(540px, 90vw)',

  // Сайдбар (из Figma)
  sidebarIconW:  48,   // ширина узкой полосы иконок
  sidebarNavW:   200,  // ширина панели навигации
  sidebarGap:    16,   // отступ между сайдбаром и контентом
  sidebarW:      200,  // new single-panel sidebar width

  // Хлебные крошки / табы
  breadcrumbH:   40,   // высота таббара
  contentPadH:   16,   // горизонтальный паддинг области контента
  contentPadV:   12,   // вертикальный паддинг области контента
} as const;

// ─── Топология (GroupFlow) ────────────────────────────────────────────────────

export const topology = {
  cardW:   268,
  cardH:   240,
  gapX:    140,
  gapY:    100,
  padding: 40,
} as const;

// ─── Анимации ────────────────────────────────────────────────────────────────

export const animation = {
  criticalPulseDuration: '2s',
  transitionFast:        '0.1s',
  transitionBase:        '0.15s',
  transitionSlow:        '0.5s',
} as const;
