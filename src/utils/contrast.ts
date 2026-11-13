/**
 * @file contrast.ts
 * @description Чистые функции для расчета относительной яркости и коэффициента контрастности цветов
 * согласно спецификации W3C WCAG 2.1.
 */

import type { RGB, ContrastResult } from '../types';
import { hexToRgb, isValidHex } from './color';

/**
 * Рассчитывает линейную компоненту для sRGB канала по формуле WCAG 2.1.
 */
function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Рассчитывает относительную яркость (relative luminance) цвета в диапазоне [0, 1].
 * 0 - абсолютно черный, 1 - абсолютно белый.
 */
export function getLuminance(rgb: RGB): number {
  const r = channelLuminance(rgb.r);
  const g = channelLuminance(rgb.g);
  const b = channelLuminance(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Рассчитывает коэффициент контрастности между двумя цветами по стандарту WCAG.
 * Возвращает число от 1.00 (нет контраста) до 21.00 (максимальный контраст черный/белый).
 */
export function calculateContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  // Округляем до двух знаков после запятой для точности отображения
  return Math.round(ratio * 100) / 100;
}

/**
 * Проверяет соответствие контрастности стандарту WCAG AA и AAA.
 * Принимает либо RGB объект, либо HEX-строку.
 */
export function checkWcagContrast(
  foreground: RGB | string,
  background: RGB | string
): ContrastResult {
  const fgRgb: RGB = typeof foreground === 'string'
    ? (isValidHex(foreground) ? hexToRgb(foreground) : { r: 0, g: 0, b: 0 })
    : foreground;

  const bgRgb: RGB = typeof background === 'string'
    ? (isValidHex(background) ? hexToRgb(background) : { r: 255, g: 255, b: 255 })
    : background;

  const ratio = calculateContrastRatio(fgRgb, bgRgb);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7.0,
    wcagAALarge: ratio >= 3.0,
    wcagAAALarge: ratio >= 4.5,
  };
}

/**
 * Возвращает рекомендацию по доступности текста.
 */
export function getContrastRatingLabel(result: ContrastResult): {
  badge: 'Отлично' | 'Хорошо' | 'Плохо';
  text: string;
} {
  if (result.wcagAAA) {
    return {
      badge: 'Отлично',
      text: 'Идеальный контраст. Соответствует высшему стандарту WCAG AAA для любого размера шрифта.',
    };
  }
  if (result.wcagAA) {
    return {
      badge: 'Хорошо',
      text: 'Хороший контраст. Соответствует стандарту WCAG AA для обычного текста.',
    };
  }
  if (result.wcagAALarge) {
    return {
      badge: 'Плохо',
      text: 'Допустимо только для крупного шрифта (от 18pt или 14pt bold). Не рекомендуется для обычного текста.',
    };
  }
  return {
    badge: 'Плохо',
    text: 'Недостаточный контраст. Текст будет трудно или невозможно прочесть пользователям с нарушениями зрения.',
  };
}
