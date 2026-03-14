# Модель здоровья ПАК — Жизненный цикл

## Main Entity
**Server** (Сервер) — физический или виртуальный сервер, подлежащий мониторингу здоровья

## States
- **healthy** — сервер работает нормально, все компоненты в порядке
- **warning** — обнаружены незначительные проблемы, требующие внимания
- **critical** — критические проблемы, требующие немедленного вмешательства
- **offline** — сервер недоступен
- **recovering** — сервер восстанавливается после проблем
- **maintenance** — сервер в режиме обслуживания

## Transitions
- **healthy → warning**: метрика превышает порог предупреждения
- **warning → critical**: метрика превышает критический порог
- **critical → recovering**: проблема устранена, метрика возвращается в норму
- **warning → healthy**: метрика возвращается в норму
- **critical → healthy**: проблема устранена полностью
- **any → offline**: сервер теряет связь
- **offline → recovering**: сервер возвращается в сеть
- **recovering → healthy**: сервер полностью восстановлен
- **any → maintenance**: сервер переводится в режим обслуживания
- **maintenance → healthy**: сервер возвращён в эксплуатацию

## Trigger Events
- **metricThresholdExceeded** — метрика превысила порог
- **connectionLost** — потеря связи с сервером
- **connectionRestored** — связь восстановлена
- **problemResolved** — проблема устранена
- **manualTransition** — ручное изменение состояния оператором
- **scheduledMaintenance** — плановое обслуживание

## Edge Cases
- **validation error** — ошибка валидации метрик (некорректный формат данных)
- **permission denied** — отсутствие прав на доступ к серверу
- **network failure** — потеря связи с сервером при сборе метрик
- **concurrent update** — конфликт при одновременном обновлении состояния
- **empty state** — отсутствие данных о сервере
- **unexpected system error** — внутренняя ошибка системы мониторинга

## UI Implications
- **Цветовое кодирование**:
  - healthy: зелёный
  - warning: жёлтый
  - critical: красный
  - offline: серый
  - recovering: оранжевый
  - maintenance: синий
- **Индикаторы состояния**:
  - Иконка статуса рядом с именем сервера
  - Цветная полоса состояния в заголовке
  - Анимация перехода между состояниями
- **Алерты**:
  - Критические алерты — всплывающие уведомления
  - Предупреждения — уведомления в панели
- **История состояний**:
  - Таймлайн изменений состояния
  - Причинно-следственные связи переходов
- **Обработка ошибок**:
  - Валидация — показ ошибки с подсказкой
  - Permission denied — кнопка "Запросить доступ"
  - Network failure — индикатор оффлайн с кнопкой "Повторить"
  - Concurrent update — предупреждение о конфликте
  - Empty state — кнопка "Добавить сервер"
  - System error — кнопка "Обновить"

## State Diagram

```mermaid
flowchart TD
    Start["[*]"] --> Healthy["healthy"]
    Healthy --> Warning["warning"]
    Warning --> Critical["critical"]
    Critical --> Recovering["recovering"]
    Recovering --> Healthy
    Warning --> Healthy
    Critical --> Healthy
    Healthy --> Offline["offline"]
    Offline --> Recovering
    Recovering --> Healthy
    Healthy --> Maintenance["maintenance"]
    Maintenance --> Healthy
```

## Happy Path User Flow

```mermaid
flowchart TD
    Start["DevOps открывает дашборд"] --> Dashboard["Система отображает серверы"]
    Dashboard --> Metrics["Сбор метрик"]
    Metrics --> Analysis["Анализ состояния"]
    Analysis --> Visualization["Визуализация"]
    Visualization --> AlertCheck{"Есть проблемы?"}
    AlertCheck -- Да --> Alert["Генерация алертов"]
    AlertCheck -- Нет --> Monitor["Мониторинг"]
    Alert --> Notify["Отправка уведомлений"]
    Notify --> Action["DevOps принимает решение"]
    Action --> Resolve{"Проблема решена?"}
    Resolve -- Да --> Recovery["Переход в recovering"]
    Recovery --> Healthy
    Resolve -- Нет --> Monitor
    Monitor --> Export["Экспорт отчёта"]
    Export --> End["Завершение сессии"]
```

## Error Flow

```mermaid
flowchart TD
    Start["DevOps собирает метрики"]
    Start --> Validation["Валидация данных"]
    Validation -->|Invalid| Error["Ошибка валидации"]
    Error --> Retry["Повтор сбора"]
    Retry --> Validation
    Validation -->|Valid| Analysis["Анализ"]
    Analysis --> Save["Сохранение"]
    Save --> Success["Успех"]
```

## Permission Flow

```mermaid
flowchart TD
    Start["DevOps пытается получить доступ"]
    Start --> Check["Проверка прав"]
    Check -->|Allowed| Action["Доступ разрешён"]
    Check -->|Denied| Error["Доступ запрещён"]
    Error --> Request["Запрос прав"]
    Request --> Check
```

## Edge Case Flow

```mermaid
flowchart TD
    Start["DevOps выполняет действие"]
    Start --> Request["Отправка запроса"]
    Request --> Network{"Сеть доступна?"}
    Network -->|No| Offline["Оффлайн режим"]
    Offline --> Retry["Повтор через 30с"]
    Retry --> Request
    Network -->|Yes| Process["Обработка сервером"]
    Process --> Result["Получение ответа"]
    Result --> Success["Успех"]
    Result --> Error["Ошибка"]
    Error --> Retry
```

## Данные для реализации

### Компоненты UI
- `ServerStatusCard` — карточка статуса сервера
- `HealthMetricsPanel` — панель метрик здоровья
- `AlertPanel` — панель алертов
- `StatusTimeline` — таймлайн состояний
- `HealthDashboard` — главный дашборд

### API эндпоинты
- `GET /api/servers` — список серверов со статусами
- `GET /api/servers/{id}/metrics` — метрики сервера
- `GET /api/servers/{id}/history` — история метрик
- `POST /api/servers/{id}/alerts` — создание алерта
- `GET /api/alerts` — список активных алертов

### Пороги по умолчанию
- CPU: warning > 70%, critical > 90%
- Memory: warning > 75%, critical > 95%
- Disk: warning > 80%, critical > 95%
- Network: warning > 100 Mbps, critical > 500 Mbps
