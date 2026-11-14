/**
 * @file usePalettes.ts
 * @description Composable для управления состоянием палитр (Уровень 4: Действия и сетевой слой).
 * 
 * ПОЧЕМУ COMPOSABLE:
 * В Vue 3 Composition API логика управления состоянием оформляется в виде переиспользуемых
 * функций-хуков (composables). Они инкапсулируют реактивные переменные и методы работы с бэкендом.
 * 
 * ПОЧЕМУ shallowRef() И shallowReactive():
 * 1. Обычный ref() рекурсивно оборачивает все вложенные массивы и свойства в глубокие Proxy.
 * 2. Так как наши данные строго неизменяемы (мы всегда заменяем объекты целиком через Copy-on-Write),
 *    глубокая реактивность избыточна и тратит ресурсы.
 * 3. shallowRef отслеживает ТОЛЬКО перезапись свойства `.value`. Это работает мгновенно и без оверхеда.
 */

import { shallowRef, shallowReactive } from 'vue';
import type { ColorPalette } from '../types';
import {
  updateColorInPalette as pureUpdateColor,
  addColorToPalette as pureAddColor,
  removeColorFromPalette as pureRemoveColor,
  reorderColorsInPalette as pureReorderColors,
} from '../utils/palette';

// URL локального REST API сервера (json-server)
const API_URL = 'http://localhost:3000/palettes';
// Ключ для резервного кэширования в браузере
const LOCAL_STORAGE_KEY = 'client_web_dev_palettes_backup';

/**
 * Глобальное реактивное состояние палитр:
 * - palettes: массив палитр с поверхностной реактивностью shallowRef
 * - currentPalette: палитра, открытая в данный момент в редакторе
 */
const palettes = shallowRef<readonly ColorPalette[]>([]);
const currentPalette = shallowRef<ColorPalette | null>(null);

/**
 * shallowReactive хранит флаги состояния интерфейса.
 * Реактивны только свойства первого уровня: loading, error, isServerConnected.
 */
const state = shallowReactive({
  loading: false,                 // Идет ли сетевой запрос в данный момент
  error: null as string | null,   // Текст ошибки или предупреждения для UI
  isServerConnected: true,        // Доступен ли json-server (онлайн/оффлайн)
});

/**
 * Запасные демо-палитры на случай первого запуска без сервера
 */
const defaultPalettes: ColorPalette[] = [
  {
    id: '1',
    title: 'Морской закат',
    description: 'Теплая палитра переходных оттенков солнца и океана',
    createdAt: new Date().toISOString(),
    colors: [
      { id: 'c1-1', hex: '#1e3a8a', rgb: { r: 30, g: 58, b: 138 }, hsl: { h: 224, s: 64, l: 33 }, name: 'Глубокий синий' },
      { id: 'c1-2', hex: '#3b82f6', rgb: { r: 59, g: 130, b: 246 }, hsl: { h: 217, s: 91, l: 60 }, name: 'Морская волна' },
      { id: 'c1-3', hex: '#f59e0b', rgb: { r: 245, g: 158, b: 11 }, hsl: { h: 38, s: 92, l: 50 }, name: 'Янтарное солнце' },
      { id: 'c1-4', hex: '#ef4444', rgb: { r: 239, g: 68, b: 68 }, hsl: { h: 0, s: 84, l: 60 }, name: 'Коралловый закат' },
    ],
  },
  {
    id: '2',
    title: 'Киберпанк Неон',
    description: 'Контрастная неоновая гамма для динамичных футуристичных интерфейсов',
    createdAt: new Date().toISOString(),
    colors: [
      { id: 'c2-1', hex: '#0f172a', rgb: { r: 15, g: 23, b: 42 }, hsl: { h: 222, s: 47, l: 11 }, name: 'Полночь' },
      { id: 'c2-2', hex: '#06b6d4', rgb: { r: 6, g: 182, b: 212 }, hsl: { h: 189, s: 94, l: 43 }, name: 'Неоновый циан' },
      { id: 'c2-3', hex: '#d946ef', rgb: { r: 217, g: 70, b: 239 }, hsl: { h: 292, s: 84, l: 61 }, name: 'Электрический фуксия' },
      { id: 'c2-4', hex: '#facc15', rgb: { r: 250, g: 204, b: 21 }, hsl: { h: 48, s: 96, l: 53 }, name: 'Неоновый желтый' },
    ],
  },
];

/**
 * Сохраняет резервную копию палитр в локальное браузерное хранилище localStorage.
 */
function saveToLocalStorage(data: readonly ColorPalette[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Не удалось записать в localStorage', e);
  }
}

/**
 * Считывает палитры из localStorage при недоступности сервера.
 */
function loadFromLocalStorage(): ColorPalette[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Не удалось прочитать из localStorage', e);
  }
  return defaultPalettes;
}

export function usePalettes() {
  /**
   * ДЕЙСТВИЕ (Action): Загрузка палитр с сервера (GET-запрос).
   * 
   * ПОЧЕМУ ТАК:
   * Используется async/await и блок try...catch...finally.
   * Если json-server запущен — данные приходят по сети.
   * Если сервер выключен — приложение не падает, а переключается на автономный оффлайн-кэш.
   */
  async function fetchPalettes(): Promise<void> {
    state.loading = true;
    state.error = null;

    try {
      // Отправляем HTTP GET запрос к локальному REST API
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }
      const data: ColorPalette[] = await response.json();
      
      // Object.freeze защищает массив от случайных мутаций в коде
      palettes.value = Object.freeze(data);
      state.isServerConnected = true;
      saveToLocalStorage(data);
    } catch (err) {
      // Обработка оффлайн-режима
      state.isServerConnected = false;
      const cached = loadFromLocalStorage();
      palettes.value = Object.freeze(cached);
      state.error = 'Сервер json-server недоступен на порту 3000. Приложение работает в автономном режиме с локальными данными.';
    } finally {
      // Блок finally выполняется ВСЕГДА, выключая спиннер загрузки
      state.loading = false;
    }
  }

  /**
   * ДЕЙСТВИЕ: Поиск палитры по ее ID.
   */
  async function getPaletteById(id: string): Promise<ColorPalette | null> {
    // Сначала ищем в уже загруженном списке (быстро)
    const existing = palettes.value.find((p) => String(p.id) === String(id));
    if (existing) {
      currentPalette.value = existing;
      return existing;
    }

    // Если нет — запрашиваем точечно с сервера
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (response.ok) {
        const item: ColorPalette = await response.json();
        currentPalette.value = item;
        return item;
      }
    } catch (e) {
      console.warn('Ошибка получения палитры по ID:', e);
    }

    return null;
  }

  /**
   * ДЕЙСТВИЕ: Создание новой палитры (POST-запрос к REST API).
   * 
   * ПОЧЕМУ ТАК:
   * 1. Метод POST сообщает серверу о создании новой сущности.
   * 2. Сервер возвращает созданный объект с присвоенным ID.
   * 3. Список палитр обновляется иммутабельно: новый элемент ставится в начало нового массива:
   *    `palettes.value = [created, ...palettes.value]`.
   */
  async function createPalette(palette: Omit<ColorPalette, 'id' | 'createdAt'>): Promise<ColorPalette> {
    state.loading = true;
    state.error = null;

    const newPalette: ColorPalette = {
      ...palette,
      id: String(Date.now()), // Временный уникальный ID
      createdAt: new Date().toISOString(),
    };

    try {
      if (state.isServerConnected) {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPalette),
        });
        if (res.ok) {
          const created = await res.json();
          // Присвоение нового массива в .value триггерит shallowRef
          palettes.value = Object.freeze([created, ...palettes.value]);
          saveToLocalStorage(palettes.value);
          return created;
        }
      }
    } catch (e) {
      state.isServerConnected = false;
    } finally {
      state.loading = false;
    }

    // Локальное сохранение при оффлайне
    palettes.value = Object.freeze([newPalette, ...palettes.value]);
    saveToLocalStorage(palettes.value);
    return newPalette;
  }

  /**
   * ДЕЙСТВИЕ: Сохранение изменений в существующей палитре (PUT-запрос).
   */
  async function savePalette(palette: ColorPalette): Promise<ColorPalette> {
    state.loading = true;
    state.error = null;

    const updated: ColorPalette = {
      ...palette,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (state.isServerConnected) {
        await fetch(`${API_URL}/${palette.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      }
    } catch (e) {
      state.isServerConnected = false;
    } finally {
      state.loading = false;
    }

    // Заменяем палитру в массиве через map (чистая операция без мутаций)
    palettes.value = Object.freeze(
      palettes.value.map((p) => (String(p.id) === String(palette.id) ? updated : p))
    );
    if (currentPalette.value && String(currentPalette.value.id) === String(palette.id)) {
      currentPalette.value = updated;
    }
    saveToLocalStorage(palettes.value);
    return updated;
  }

  /**
   * ДЕЙСТВИЕ: Удаление палитры (DELETE-запрос).
   */
  async function deletePalette(id: string): Promise<void> {
    state.loading = true;
    state.error = null;

    try {
      if (state.isServerConnected) {
        await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
      }
    } catch (e) {
      state.isServerConnected = false;
    } finally {
      state.loading = false;
    }

    // Исключаем удаленную палитру из массива с помощью filter
    palettes.value = Object.freeze(palettes.value.filter((p) => String(p.id) !== String(id)));
    if (currentPalette.value && String(currentPalette.value.id) === String(id)) {
      currentPalette.value = null;
    }
    saveToLocalStorage(palettes.value);
  }

  /**
   * Модификация цветов текущей редактируемой палитры с вызовом ЧИСТЫХ ФУНКЦИЙ из utils/palette.ts.
   * Связующий мост между Действиями (Composable) и Вычислениями (Utils).
   */
  function updateColorInCurrent(colorId: string, newColor: any) {
    if (!currentPalette.value) return;
    currentPalette.value = pureUpdateColor(currentPalette.value, colorId, newColor);
  }

  function addColorToCurrent(color: any) {
    if (!currentPalette.value) return;
    currentPalette.value = pureAddColor(currentPalette.value, color);
  }

  function removeColorFromCurrent(colorId: string) {
    if (!currentPalette.value) return;
    currentPalette.value = pureRemoveColor(currentPalette.value, colorId);
  }

  function reorderColorsInCurrent(fromIndex: number, toIndex: number) {
    if (!currentPalette.value) return;
    currentPalette.value = pureReorderColors(currentPalette.value, fromIndex, toIndex);
  }

  return {
    palettes,
    currentPalette,
    state,
    fetchPalettes,
    getPaletteById,
    createPalette,
    savePalette,
    deletePalette,
    updateColorInCurrent,
    addColorToCurrent,
    removeColorFromCurrent,
    reorderColorsInCurrent,
  };
}
