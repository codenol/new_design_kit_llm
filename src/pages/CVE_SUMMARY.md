# Страница CVE Summary

## Описание

Страница сводки по CVE (Common Vulnerabilities and Exposures) для отображения информации о уязвимостях.

## Структура страницы

### Блок 1: Заголовок страницы
- H1: "Сводка по CVE"
- Краткое описание раздела

### Блок 2: Фильтры и поиск
- Поле поиска по названию CVE
- Фильтр по severity (Critical, High, Medium, Low)
- Фильтр по статусу (Unpatched, Patched, In Progress)
- Кнопка сброса фильтров

### Блок 3: Таблица CVE
- Колонки:
  - CVE ID
  - Severity (с цветовой индикацией)
  - Status
  - Description
  - CVSS Score
  - Published Date
  - Actions (кнопка деталей)

### Блок 4: Статистика
- Всего CVE
- По severity (Critical, High, Medium, Low)
- По статусу (Unpatched, Patched, In Progress)

## Дизайн-система
- Использовать компоненты из design-system/uikit
- Стили из design-system/layout
- Цвета из design-system/tokens
