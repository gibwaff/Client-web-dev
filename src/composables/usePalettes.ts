/**
 * @file usePalettes.ts
 * @description Composable для управления состоянием палитр с использованием shallowRef() и shallowReactive().
 * Интегрируется с REST API json-server (по умолчанию http://localhost:3000/palettes)
 * и поддерживает локальный кэш / fallback при недоступности сервера.
 */

import { shallowRef, shallowReactive } from 'vue';
import type { ColorPalette } from '../types';
import {
  updateColorInPalette as pureUpdateColor,
  addColorToPalette as pureAddColor,
  removeColorFromPalette as pureRemoveColor,
  reorderColorsInPalette as pureReorderColors,
} from '../utils/palette';

// URL API json-server
const API_URL = 'http://localhost:3000/palettes';
const LOCAL_STORAGE_KEY = 'client_web_dev_palettes_backup';

/**
 * Глобальное реактивное состояние на основе shallowRef и shallowReactive.
 * shallowRef отслеживает только изменения .value, что идеально сочетается
 * с парадигмой неизменяемости (Copy-on-Write) и функционального программирования.
 */
const palettes = shallowRef<readonly ColorPalette[]>([]);
const currentPalette = shallowRef<ColorPalette | null>(null);

const state = shallowReactive({
  loading: false,
  error: null as string | null,
  isServerConnected: true,
});

/**
 * Начальные данные по умолчанию, если сервер пуст или оффлайн
 */
const defaultPalettes: ColorPalette[] = [
  {
    id: '1',
    title: 'Морской закат',
    description: 'Теплая палитра переходных оттенков солнца и океана',
    createdAt: new Date().toISOString(),
    colors: [
      {
        id: 'c1-1',
        hex: '#1e3a8a',
        rgb: { r: 30, g: 58, b: 138 },
        hsl: { h: 224, s: 64, l: 33 },
        name: 'Глубокий синий',
      },
      {
        id: 'c1-2',
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246 },
        hsl: { h: 217, s: 91, l: 60 },
        name: 'Морская волна',
      },
      {
        id: 'c1-3',
        hex: '#f59e0b',
        rgb: { r: 245, g: 158, b: 11 },
        hsl: { h: 38, s: 92, l: 50 },
        name: 'Янтарное солнце',
      },
      {
        id: 'c1-4',
        hex: '#ef4444',
        rgb: { r: 239, g: 68, b: 68 },
        hsl: { h: 0, s: 84, l: 60 },
        name: 'Коралловый закат',
      },
    ],
  },
  {
    id: '2',
    title: 'Киберпанк Неон',
    description: 'Контрастная неоновая гамма для динамичных футуристичных интерфейсов',
    createdAt: new Date().toISOString(),
    colors: [
      {
        id: 'c2-1',
        hex: '#0f172a',
        rgb: { r: 15, g: 23, b: 42 },
        hsl: { h: 222, s: 47, l: 11 },
        name: 'Полночь',
      },
      {
        id: 'c2-2',
        hex: '#06b6d4',
        rgb: { r: 6, g: 182, b: 212 },
        hsl: { h: 189, s: 94, l: 43 },
        name: 'Неоновый циан',
      },
      {
        id: 'c2-3',
        hex: '#d946ef',
        rgb: { r: 217, g: 70, b: 239 },
        hsl: { h: 292, s: 84, l: 61 },
        name: 'Электрический фуксия',
      },
      {
        id: 'c2-4',
        hex: '#facc15',
        rgb: { r: 250, g: 204, b: 21 },
        hsl: { h: 48, s: 96, l: 53 },
        name: 'Неоновый желтый',
      },
    ],
  },
];

/**
 * Сохранение резервной копии в localStorage
 */
function saveToLocalStorage(data: readonly ColorPalette[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Не удалось сохранить в localStorage', e);
  }
}

/**
 * Чтение из localStorage
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
   * Загрузка списка палитр с json-server (или из кэша при оффлайн режиме).
   */
  async function fetchPalettes(): Promise<void> {
    state.loading = true;
    state.error = null;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }
      const data: ColorPalette[] = await response.json();
      palettes.value = Object.freeze(data);
      state.isServerConnected = true;
      saveToLocalStorage(data);
    } catch (err) {
      console.warn('Не удалось загрузить палитры с json-server, переключаемся на локальный кэш:', err);
      state.isServerConnected = false;
      const cached = loadFromLocalStorage();
      palettes.value = Object.freeze(cached);
      state.error = 'Сервер json-server недоступен на порту 3000. Приложение работает в автономном режиме с локальными данными.';
    } finally {
      state.loading = false;
    }
  }

  /**
   * Получение палитры по ID.
   */
  async function getPaletteById(id: string): Promise<ColorPalette | null> {
    const existing = palettes.value.find((p) => String(p.id) === String(id));
    if (existing) {
      currentPalette.value = existing;
      return existing;
    }

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
   * Создание новой палитры (POST).
   */
  async function createPalette(palette: Omit<ColorPalette, 'id' | 'createdAt'>): Promise<ColorPalette> {
    state.loading = true;
    state.error = null;

    const newPalette: ColorPalette = {
      ...palette,
      id: String(Date.now()),
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
          // Иммутабельное обновление списка: новый массив через spread
          palettes.value = Object.freeze([created, ...palettes.value]);
          saveToLocalStorage(palettes.value);
          return created;
        }
      }
    } catch (e) {
      console.warn('Ошибка отправки POST на json-server, сохраняем локально:', e);
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
   * Обновление существующей палитры (PUT/PATCH).
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
      console.warn('Ошибка отправки PUT на json-server:', e);
      state.isServerConnected = false;
    } finally {
      state.loading = false;
    }

    // Иммутабельное обновление через map
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
   * Удаление палитры (DELETE).
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
      console.warn('Ошибка отправки DELETE на json-server:', e);
      state.isServerConnected = false;
    } finally {
      state.loading = false;
    }

    // Иммутабельное удаление через filter
    palettes.value = Object.freeze(palettes.value.filter((p) => String(p.id) !== String(id)));
    if (currentPalette.value && String(currentPalette.value.id) === String(id)) {
      currentPalette.value = null;
    }
    saveToLocalStorage(palettes.value);
  }

  /**
   * Действия над текущей редактируемой палитрой с использованием чистых функций
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
