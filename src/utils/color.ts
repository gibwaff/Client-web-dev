/**
 * @file color.ts
 * @description Чистые функции (Level 2/3) для конвертации координат цветов между форматами RGB, HSL и HEX,
 * а также функции валидации и создания объектов Color.
 * Все функции детерминированы, не производят побочных эффектов и возвращают новые иммутабельные объекты.
 */

import type { RGB, HSL, Color, ValidationResult } from '../types';

/**
 * Ограничивает число диапазоном [min, max].
 * Чистая математическая функция Level 2.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Генерирует уникальный строковый ID (Level 2).
 */
export function generateId(): string {
  return 'col_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Проверяет корректность HEX-строки цвета (#RGB или #RRGGBB).
 */
export function isValidHex(hex: string): boolean {
  if (typeof hex !== 'string') return false;
  const clean = hex.trim();
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(clean);
}

/**
 * Валидирует HEX с возвратом русскоязычной ошибки для UI.
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
 * Проверяет корректность RGB координат [0, 255].
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
 * Валидирует RGB каналы.
 */
export function validateRgb(rgb: RGB): ValidationResult {
  if (!isValidRgb(rgb)) {
    return { isValid: false, error: 'Каналы R, G и B должны быть числами от 0 до 255' };
  }
  return { isValid: true };
}

/**
 * Проверяет корректность HSL координат:
 * h: [0, 360], s: [0, 100], l: [0, 100].
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
 * Валидирует HSL каналы.
 */
export function validateHsl(hsl: HSL): ValidationResult {
  if (!isValidHsl(hsl)) {
    return { isValid: false, error: 'Оттенок H (0-360), Насыщенность S (0-100%), Светлота L (0-100%)' };
  }
  return { isValid: true };
}

/**
 * Нормализует 3-значный HEX (#abc) в 6-значный (#aabbcc).
 */
export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  if (clean.length === 4) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return clean.toLowerCase();
}

/**
 * Преобразует HEX-строку в RGB-координаты.
 */
export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex);
  if (!isValidHex(normalized)) {
    return { r: 0, g: 0, b: 0 };
  }
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Преобразует RGB-координаты в HEX-строку.
 */
export function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255).toString(16).padStart(2, '0');
  const g = clamp(Math.round(rgb.g), 0, 255).toString(16).padStart(2, '0');
  const b = clamp(Math.round(rgb.b), 0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toLowerCase();
}

/**
 * Преобразует RGB в HSL.
 * Формулы стандартного колориметрического преобразования:
 * r, g, b делятся на 255 для диапазона [0, 1].
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
 * Вспомогательная функция для HSL -> RGB.
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
 * Преобразует HSL в RGB.
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  if (s === 0) {
    // Ахроматический цвет (оттенки серого)
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
 * Преобразует HSL в HEX.
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * Преобразует HEX в HSL.
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * Создает полноценный объект Color из HEX-строки.
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
 * Создает полноценный объект Color из RGB-координат.
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
 * Создает полноценный объект Color из HSL-координат.
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
