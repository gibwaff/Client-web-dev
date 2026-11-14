/**
 * @file color.ts
 * @description Чистые функции для конвертации координат цвета между форматами HEX, RGB и HSL,
 * а также функции валидации диапазонов и создания объектов Color (Уровень 2: Математические утилиты).
 * 
 * ЧИСТЫЕ ФУНКЦИИ (PURE FUNCTIONS):
 * Детерминированы: при одних и тех же входных аргументах ВСЕГДА возвращают один и тот же результат.
 * Не имеют побочных эффектов: не делают сетевых запросов, не меняют переменные вне себя.
 */

import type { RGB, HSL, Color, ValidationResult } from '../types';

/**
 * Ограничивает число диапазоном [min, max].
 * Если число меньше min — возвращает min. Если больше max — max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Генерирует уникальный строковый идентификатор для цвета (Level 2).
 */
export function generateId(): string {
  return 'col_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Проверяет корректность HEX-строки цвета с помощью регулярного выражения.
 * Поддерживает как 3-символьные (#F00), так и 6-символьные (#FF0000) коды.
 */
export function isValidHex(hex: string): boolean {
  if (typeof hex !== 'string') return false;
  const clean = hex.trim();
  // Регулярное выражение: начинается с #, далее либо 3, либо 6 шестнадцатеричных цифр (0-9, a-f)
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(clean);
}

/**
 * Валидирует HEX-код с возвратом понятного текста ошибки для пользователя интерфейса.
 */
export function validateHex(hex: string): ValidationResult {
  if (!hex || hex.trim() === '') {
    return { isValid: false, error: 'Введите HEX-код цвета' };
  }
  if (!isValidHex(hex)) {
    return { isValid: false, error: 'HEX-код должен быть формата #RGB или #RRGGBB (например, #3B82F6)' };
  }
  return { isValid: true };
}

/**
 * Проверяет, что координаты RGB являются конечными числами в диапазоне [0, 255].
 */
export function isValidRgb(rgb: RGB): boolean {
  if (!rgb || typeof rgb !== 'object') return false;
  return (
    Number.isFinite(rgb.r) && rgb.r >= 0 && rgb.r <= 255 &&
    Number.isFinite(rgb.g) && rgb.g >= 0 && rgb.g <= 255 &&
    Number.isFinite(rgb.b) && rgb.b >= 0 && rgb.b <= 255
  );
}

/**
 * Валидирует RGB каналы для UI.
 */
export function validateRgb(rgb: RGB): ValidationResult {
  if (!isValidRgb(rgb)) {
    return { isValid: false, error: 'Каналы R, G и B должны быть числами от 0 до 255' };
  }
  return { isValid: true };
}

/**
 * Проверяет, что координаты HSL находятся в допустимых пределах:
 * H (оттенок): от 0 до 360 градусов;
 * S (насыщенность): от 0 до 100 процентов;
 * L (светлота): от 0 до 100 процентов.
 */
export function isValidHsl(hsl: HSL): boolean {
  if (!hsl || typeof hsl !== 'object') return false;
  return (
    Number.isFinite(hsl.h) && hsl.h >= 0 && hsl.h <= 360 &&
    Number.isFinite(hsl.s) && hsl.s >= 0 && hsl.s <= 100 &&
    Number.isFinite(hsl.l) && hsl.l >= 0 && hsl.l <= 100
  );
}

/**
 * Валидирует HSL каналы для UI.
 */
export function validateHsl(hsl: HSL): ValidationResult {
  if (!isValidHsl(hsl)) {
    return { isValid: false, error: 'Оттенок H (0-360), Насыщенность S (0-100%), Светлота L (0-100%)' };
  }
  return { isValid: true };
}

/**
 * Нормализует HEX-строку: разворачивает короткий 3-значный код (#abc) в полный 6-значный (#aabbcc).
 */
export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  // Если код короткий (#f00), удваиваем каждый символ: f -> ff, 0 -> 00, 0 -> 00
  if (clean.length === 4) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return clean.toLowerCase();
}

/**
 * Преобразует HEX-строку в числовые координаты RGB.
 * Например: '#ff8800' -> { r: 255, g: 136, b: 0 }.
 * 
 * ПОЧЕМУ ТАК:
 * parseInt(hexString, 16) парсит строку в шестнадцатеричной системе счисления.
 */
export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex);
  if (!isValidHex(normalized)) {
    return { r: 0, g: 0, b: 0 }; // Защитный fallback для невалидного ввода
  }
  const r = parseInt(normalized.slice(1, 3), 16); // Символы с 1 по 3 (красный)
  const g = parseInt(normalized.slice(3, 5), 16); // Символы с 3 по 5 (зеленый)
  const b = parseInt(normalized.slice(5, 7), 16); // Символы с 5 по 7 (синий)
  return { r, g, b };
}

/**
 * Преобразует RGB-координаты в строковый HEX.
 * Например: { r: 59, g: 130, b: 246 } -> '#3b82f6'.
 * padStart(2, '0') гарантирует, что число меньше 16 будет записано с ведущим нулем ('0a', а не 'a').
 */
export function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255).toString(16).padStart(2, '0');
  const g = clamp(Math.round(rgb.g), 0, 255).toString(16).padStart(2, '0');
  const b = clamp(Math.round(rgb.b), 0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toLowerCase();
}

/**
 * Преобразует RGB в HSL (Hue, Saturation, Lightness).
 * 
 * АЛГОРИТМ:
 * 1. Нормализуем r, g, b в диапазон [0, 1].
 * 2. Находим max и min из каналов, и вычисляем разницу delta = max - min.
 * 3. Светлота L вычисляется как среднее между максимумом и минимумом: (max + min) / 2.
 * 4. Насыщенность S зависит от того, насколько светлый или темный цвет.
 * 5. Тон H вычисляется в зависимости от того, какой канал оказался максимальным (R, G или B).
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = clamp(rgb.r, 0, 255) / 255;
  const g = clamp(rgb.g, 0, 255) / 255;
  const b = clamp(rgb.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Вспомогательная математическая функция для HSL -> RGB перевода.
 */
function hueToRgb(p: number, q: number, t: number): number {
  let normalizedT = t;
  if (normalizedT < 0) normalizedT += 1;
  if (normalizedT > 1) normalizedT -= 1;
  if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
  if (normalizedT < 1 / 2) return q;
  if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
  return p;
}

/**
 * Преобразует HSL обратно в координаты RGB.
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  // Если насыщенность 0 — это ахроматический цвет (оттенок серого)
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
  };
}

/**
 * Преобразует HSL в HEX через промежуточный RGB.
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * Преобразует HEX в HSL через промежуточный RGB.
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * Фабричная функция: создает полноценный объект Color из строки HEX.
 * Автоматически рассчитывает синхронизированные координаты RGB и HSL.
 */
export function createColorFromHex(hex: string, name?: string, id?: string): Color {
  const normalizedHex = normalizeHex(hex);
  const rgb = hexToRgb(normalizedHex);
  const hsl = rgbToHsl(rgb);
  return {
    id: id || generateId(),
    hex: normalizedHex,
    rgb,
    hsl,
    name: name || `Цвет ${normalizedHex.toUpperCase()}`,
  };
}

/**
 * Фабричная функция: создает объект Color из RGB координат.
 */
export function createColorFromRgb(rgb: RGB, name?: string, id?: string): Color {
  const clampedRgb: RGB = {
    r: clamp(Math.round(rgb.r), 0, 255),
    g: clamp(Math.round(rgb.g), 0, 255),
    b: clamp(Math.round(rgb.b), 0, 255),
  };
  const hex = rgbToHex(clampedRgb);
  const hsl = rgbToHsl(clampedRgb);
  return {
    id: id || generateId(),
    hex,
    rgb: clampedRgb,
    hsl,
    name: name || `RGB(${clampedRgb.r}, ${clampedRgb.g}, ${clampedRgb.b})`,
  };
}

/**
 * Фабричная функция: создает объект Color из HSL координат.
 */
export function createColorFromHsl(hsl: HSL, name?: string, id?: string): Color {
  const clampedHsl: HSL = {
    h: ((Math.round(hsl.h) % 360) + 360) % 360,
    s: clamp(Math.round(hsl.s), 0, 100),
    l: clamp(Math.round(hsl.l), 0, 100),
  };
  const rgb = hslToRgb(clampedHsl);
  const hex = rgbToHex(rgb);
  return {
    id: id || generateId(),
    hex,
    rgb,
    hsl: clampedHsl,
    name: name || `HSL(${clampedHsl.h}°, ${clampedHsl.s}%, ${clampedHsl.l}%)`,
  };
}
