/**
 * @file palette.ts
 * @description Чистые функции для работы со структурами ColorPalette (Уровень 3: Расчеты предметной области).
 * 
 * ГЛАВНЫЙ АРХИТЕКТУРНЫЙ ПРИНЦИП ЭТОГО ФАЙЛА:
 * Неизменяемость данных (Immutability) и стратегия «Копирование при записи» (Copy-on-Write).
 * 
 * ЧТО ЭТО ЗНАЧИТ:
 * 1. Ни одна функция в этом файле НЕ меняет переданные объекты на месте (in-place mutation).
 *    Запрещено писать: `palette.colors[0] = newColor` или `palette.colors.push(color)`.
 * 2. Вместо мутации функция создает НОВЫЙ объект палитры и НОВЫЙ массив цветов,
 *    копируя неизмененные данные.
 * 3. Это позволяет Vue с shallowRef() мгновенно замечать изменения по смене ссылки объекта
 *    и исключает трудноуловимые баги одновременного изменения состояния.
 */

import type { Color, ColorPalette } from '../types';
import { generateId } from './color';
import { getLuminance } from './contrast';

/**
 * Чистая функция обновления цвета в палитре (пример прямо из задания лабораторной работы).
 * 
 * ПОЧЕМУ ТАК НАПИСАНО:
 * - Оператор spread `{ ...palette }` создает поверхностную копию объекта палитры.
 * - Метод `palette.colors.map(...)` проходит по всем цветам и возвращает СОВЕРШЕННО НОВЫЙ массив.
 * - Тернарный оператор `c.id === colorId ? newColor : c`:
 *   если ID совпал — подставляем новый цвет, для остальных сохраняем старые ссылки (Structural Sharing).
 * 
 * @param palette Исходная палитра (остается нетронутой)
 * @param colorId Идентификатор цвета, который нужно заменить
 * @param newColor Новый объект цвета
 * @returns Новый объект ColorPalette с обновленным массивом цветов
 */
export function updateColorInPalette(
  palette: ColorPalette,
  colorId: string,
  newColor: Color
): ColorPalette {
  return {
    ...palette, // Копируем поля id, title, description, createdAt в новый объект
    colors: palette.colors.map((c) => (c.id === colorId ? newColor : c)), // Новый массив с замененным цветом
    updatedAt: new Date().toISOString(), // Обновляем временную метку изменения
  };
}

/**
 * Чистая функция добавления цвета в палитру.
 * 
 * ПОЧЕМУ ТАК:
 * Вместо мутирующего метода push() используется spread-синтаксис массива: `[...palette.colors, color]`.
 * Это создает новый массив, где в конец аккуратно добавлен новый элемент.
 */
export function addColorToPalette(
  palette: ColorPalette,
  color: Color
): ColorPalette {
  return {
    ...palette,
    colors: [...palette.colors, color], // Новый массив с добавленным элементом
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Чистая функция удаления цвета из палитры по идентификатору.
 * 
 * ПОЧЕМУ ТАК:
 * Метод `filter` возвращает новый массив, исключая элемент с указанным colorId.
 * Исходный массив цветов никак не модифицируется.
 */
export function removeColorFromPalette(
  palette: ColorPalette,
  colorId: string
): ColorPalette {
  return {
    ...palette,
    colors: palette.colors.filter((c) => c.id !== colorId), // Оставляем только те цвета, чей ID не равен удаляемому
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Чистая функция изменения порядка цветов в палитре (перемещение стрелками влево/вправо).
 * 
 * ПОЧЕМУ ТАК:
 * Мы делаем защитную копию массива `[...palette.colors]`, перемещаем элемент в копии
 * и возвращаем обновленный объект палитры. Если индексы выходят за границы,
 * возвращается исходная палитра без лишних действий.
 */
export function reorderColorsInPalette(
  palette: ColorPalette,
  fromIndex: number,
  toIndex: number
): ColorPalette {
  // Защита: проверка выхода индексов за границы массива
  if (
    fromIndex < 0 ||
    fromIndex >= palette.colors.length ||
    toIndex < 0 ||
    toIndex >= palette.colors.length ||
    fromIndex === toIndex
  ) {
    return palette; // Возвращаем палитру без изменений
  }

  // Создаем изолированную копию массива для безопасного изменения порядка
  const newColors = [...palette.colors];
  
  // Вырезаем перемещаемый элемент
  const items = newColors.splice(fromIndex, 1);
  const movedItem = items[0];
  if (!movedItem) {
    return palette;
  }
  
  // Вставляем его на новую позицию toIndex
  newColors.splice(toIndex, 0, movedItem);

  return {
    ...palette,
    colors: newColors,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Фабричная функция для создания новой чистой палитры.
 * Автоматически генерирует уникальный ID и текущую дату создания.
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
    colors: [...colors], // Защитное копирование входного массива цветов
    createdAt: new Date().toISOString(),
  };
}

/**
 * Фильтрация палитр по поисковой строке (чистая функция функционального программирования).
 * 
 * ПОЧЕМУ ТАК:
 * Не меняет исходный список, выполняет нечувствительный к регистру поиск (case-insensitive)
 * по заголовку и по описанию через метод `filter`.
 */
export function filterPalettesBySearch(
  palettes: readonly ColorPalette[],
  query: string
): ColorPalette[] {
  const cleanQuery = query.trim().toLowerCase();
  
  // Если поисковая строка пустая — возвращаем копию всего списка
  if (!cleanQuery) return [...palettes];

  return palettes.filter(
    (palette) =>
      palette.title.toLowerCase().includes(cleanQuery) ||
      palette.description.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Расчет средней относительной яркости палитры.
 * Демонстрирует использование концепции функционального программирования `reduce`.
 * 
 * ПОЧЕМУ REDUCE, А НЕ ЦИКЛ FOR:
 * Метод `reduce` сворачивает массив в единое скалярное значение (число),
 * накапливая сумму яркостей в аккумуляторе `sum` без создания мутируемых переменных-счетчиков.
 */
export function calculatePaletteAverageLuminance(palette: ColorPalette): number {
  if (!palette.colors || palette.colors.length === 0) return 0;

  // Суммируем яркость всех цветов через свертку reduce
  const totalLuminance = palette.colors.reduce((sum, color) => {
    return sum + getLuminance(color.rgb);
  }, 0);

  // Делим сумму на количество цветов и округляем до двух знаков после запятой
  return Math.round((totalLuminance / palette.colors.length) * 100) / 100;
}
