/**
 * @file palette.ts
 * @description Чистые функции для работы со структурами ColorPalette (Level 3 Domain Calculations).
 * Все функции строго придерживаются принципа неизменяемости данных (Immutability / Copy-on-Write)
 * и функциональных методов массивов (map, filter, reduce).
 */

import type { Color, ColorPalette } from '../types';
import { generateId } from './color';
import { getLuminance } from './contrast';

/**
 * Чистая функция обновления цвета в палитре (копирование при записи).
 * @param palette Исходная палитра
 * @param colorId Идентификатор обновляемого цвета
 * @param newColor Новый объект цвета
 * @returns Новый объект палитры с обновленным массивом цветов
 */
export function updateColorInPalette(
  palette: ColorPalette,
  colorId: string,
  newColor: Color
): ColorPalette {
  return {
    ...palette,
    colors: palette.colors.map((c) => (c.id === colorId ? newColor : c)),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Чистая функция добавления цвета в палитру.
 */
export function addColorToPalette(
  palette: ColorPalette,
  color: Color
): ColorPalette {
  return {
    ...palette,
    colors: [...palette.colors, color],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Чистая функция удаления цвета из палитры по идентификатору.
 */
export function removeColorFromPalette(
  palette: ColorPalette,
  colorId: string
): ColorPalette {
  return {
    ...palette,
    colors: palette.colors.filter((c) => c.id !== colorId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Чистая функция перемещения цвета в палитре (изменение порядка).
 */
export function reorderColorsInPalette(
  palette: ColorPalette,
  fromIndex: number,
  toIndex: number
): ColorPalette {
  if (
    fromIndex < 0 ||
    fromIndex >= palette.colors.length ||
    toIndex < 0 ||
    toIndex >= palette.colors.length ||
    fromIndex === toIndex
  ) {
    return palette;
  }

  const newColors = [...palette.colors];
  const items = newColors.splice(fromIndex, 1);
  const movedItem = items[0];
  if (!movedItem) {
    return palette;
  }
  newColors.splice(toIndex, 0, movedItem);

  return {
    ...palette,
    colors: newColors,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Создает новую пустую или заполненную палитру.
 */
export function createNewPalette(
  title: string,
  description: string = '',
  colors: Color[] = []
): ColorPalette {
  return {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    colors: [...colors],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Фильтрует палитры по поисковому запросу в названии или описании (чистая функция).
 */
export function filterPalettesBySearch(
  palettes: readonly ColorPalette[],
  query: string
): ColorPalette[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [...palettes];

  return palettes.filter(
    (palette) =>
      palette.title.toLowerCase().includes(cleanQuery) ||
      palette.description.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Рассчитывает среднюю относительную яркость цветов палитры с использованием reduce (Level 3).
 */
export function calculatePaletteAverageLuminance(palette: ColorPalette): number {
  if (!palette.colors || palette.colors.length === 0) return 0;

  const totalLuminance = palette.colors.reduce((sum, color) => {
    return sum + getLuminance(color.rgb);
  }, 0);

  return Math.round((totalLuminance / palette.colors.length) * 100) / 100;
}
