# ColorPalette SPA — Управление цветовыми палитрами

Веб-приложение для создания, анализа и управления цветовыми схемами и палитрами.
Выполнено в рамках **Лабораторной работы №03 (Vue: SPA)** и **Лабораторной работы №04 (Unit Tests)** по курсу *«Веб-разработка на стороне клиента»* (2024 год поступления).

---

## 🛠 Стек технологий

* **Фреймворк:** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`, Slots)
* **Язык программирования:** [TypeScript](https://www.typescriptlang.org/) (строгая типизация всех сущностей и вычислений)
* **Маршрутизация:** [Vue Router 4](https://router.vuejs.org/) (клиентский роутинг SPA с 4 разделами)
* **Реактивность:** `shallowRef()` и `shallowReactive()` с парадигмой неизменяемости данных (**Immutability / Copy-on-Write**)
* **Бэкенд / REST API:** [json-server](https://github.com/typicode/json-server) (эмуляция REST API через `db.json`)
* **Тестирование:** [Vitest](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/) + `jsdom` (шаблон **Arrange-Act-Assert**)
* **Сборщик:** [Vite](https://vitejs.dev/)

---

## 📂 Структура проекта

```text
├── db.json                     # База данных для json-server (исходные палитры)
├── index.html                  # Точка входа HTML
├── package.json                # Зависимости и npm-скрипты
├── tsconfig.json               # Конфигурация TypeScript
├── vite.config.ts              # Конфигурация Vite
├── vitest.config.ts            # Конфигурация Vitest
├── src/
│   ├── assets/                 # Глобальные стили (main.css, base.css)
│   ├── components/             # Компоненты интерфейса (Level 4 UI)
│   │   ├── AppCard.vue         # Карточка со слотами #header, default, #footer, #extra
│   │   ├── ColorCard.vue       # Отображение плашки цвета, копирование HEX/RGB/HSL
│   │   ├── ColorInput.vue      # Интерактивный редактор с синхронизацией HEX/RGB/HSL
│   │   └── Navbar.vue          # Навигация SPA и индикатор статуса API
│   ├── composables/            # Управление состоянием (shallowRef + shallowReactive)
│   │   └── usePalettes.ts      # REST API запросы к json-server, оффлайн-кэш
│   ├── router/                 # Маршрутизация Vue Router
│   │   └── index.ts            # 4 маршрута: /, /editor, /harmonies, /accessibility
│   ├── types/                  # TypeScript типы и интерфейсы
│   │   └── index.ts            # RGB, HSL, Color, ColorPalette, ContrastResult, etc.
│   ├── utils/                  # Чистые вычисления без побочных эффектов
│   │   ├── color.ts            # Конвертация координат HEX <-> RGB <-> HSL, валидация
│   │   ├── contrast.ts         # Расчет яркости и коэффициента контрастности WCAG 2.1
│   │   ├── harmonies.ts        # Расчет гармоний: комплементарная, аналогичная, триада
│   │   └── palette.ts          # Операции с палитрой (копирование при записи)
│   ├── views/                  # Страницы приложения
│   │   ├── DashboardView.vue   # Главная панель / обзор сохраненных палитр
│   │   ├── PaletteEditorView.vue # Редактор палитр (создание и редактирование)
│   │   ├── HarmoniesView.vue   # Цветовые гармонии по базовому цвету
│   │   └── AccessibilityView.vue # Проверка доступности (контрастность WCAG)
│   ├── App.vue                 # Корневой компонент приложения
│   └── main.ts                 # Точка монтирования Vue
└── tests/                      # Все тесты приложения (Лабораторная №04)
    ├── unit/                   # Модульные тесты вычислений (AAA pattern)
    │   ├── color.spec.ts       # Тесты конвертации и валидации координат
    │   ├── contrast.spec.ts    # Тесты расчета контраста и проверки WCAG
    │   ├── harmonies.spec.ts   # Тесты формул гармоний и нормализации углов
    │   └── palette.spec.ts     # Тесты иммутабельности (updateColorInPalette)
    └── components/             # Тесты Vue-компонентов
        ├── AppCard.spec.ts     # Тесты работы со слотами (#header, default, #footer)
        ├── ColorCard.spec.ts   # Тесты props, computed (контраст текста), emits
        ├── ColorInput.spec.ts  # Тесты пользовательского ввода и валидации
        └── Navbar.spec.ts      # Тесты маршрутизации и индикатора сети
```

---

## 🚀 Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск локального REST API сервера (json-server)
Сервер запустится на порту `http://localhost:3000`:
```bash
npm run server
```

### 3. Запуск приложения в режиме разработки (Vite)
В отдельном окне терминала выполните:
```bash
npm run dev
```
Приложение откроется по адресу `http://localhost:5173`.

> **Примечание:** Если `json-server` не запущен, приложение автоматически переключается в автономный (оффлайн) режим, сохраняя и загружая палитры через `localStorage`. В навигационной панели отображается текущий статус подключения.

---

## 🧪 Запуск тестов (Лабораторная №04)

Все тесты сгруппированы в директории `tests/` (`tests/unit/` и `tests/components/`) и строго следуют шаблону **Arrange-Act-Assert** с одним действием (Act) на тест.

```bash
# Однократный запуск всех тестов
npm run test

# Запуск тестов в режиме отслеживания изменений (watch mode)
npm run test:watch
```

Проверка сборки и типов TypeScript:
```bash
npm run build
```

---

## 💡 Архитектурные особенности и концепции

1. **Разделение на Действия, Вычисления и Данные:**
   * **Данные:** Иммутабельные интерфейсы в `src/types/index.ts`.
   * **Вычисления (Calculations):** Детерминированные функции в `src/utils/`, не имеющие побочных эффектов (без DOM, без fetch, без мутации памяти).
   * **Действия (Actions):** Composable `usePalettes.ts` и компоненты `src/views/`, отвечающие за сетевые запросы, таймеры и рендеринг.
2. **Иммутабельность (Copy-on-Write):**
   * Все операции над палитрой (добавление, удаление, замена цвета через `updateColorInPalette`) возвращают новый объект палитры без мутации исходного.
3. **shallowRef() и shallowReactive():**
   * Для предотвращения лишнего оборачивания неизменяемых структур данных в глубокие прокси используется `shallowRef`. Реактивность срабатывает при замене ссылки `.value`.
4. **Слоты Vue (Slots):**
   * Компонент `AppCard.vue` демонстрирует гибкость именованных слотов `#header`, `#extra`, `#footer` и основного слота `default`.
