/**
 * @file harmonies.ts
 * @description Чистые функции для генерации цветовых гармоний:
 * дополнительных (комплементарных), аналогичных, триадных и тетрадных.
 * Не мутируют исходные данные, возвращают новые объекты ColorHarmony.
 */

import type { Color, ColorHarmony, HSL } from '../types';
import { createColorFromHsl } from './color';

/**
 * Нормализует угол оттенка в диапазон [0, 360).
 */
function normalizeHue(hue: number): number {
  return ((Math.round(hue) % 360) + 360) % 360;
}

/**
 * Создает оттенок со смещением по цветовому кругу.
 */
function shiftHue(baseHsl: HSL, angle: number): HSL {
  return {
    h: normalizeHue(baseHsl.h + angle),
    s: baseHsl.s,
    l: baseHsl.l,
  };
}

/**
 * Генерирует комплементарную (дополнительную) цветовую схему.
 * Противоположные цвета на цветовом круге (+180°).
 * Создает максимальный контраст и энергию в дизайне.
 */
export function getComplementaryHarmony(baseColor: Color): ColorHarmony {
  const compHsl = shiftHue(baseColor.hsl, 180);
  const compColor = createColorFromHsl(compHsl, 'Комплементарный (+180°)');

  return {
    type: 'complementary',
    title: 'Комплементарная (Дополнительная)',
    description: 'Два противоположных цвета на круге (+180°). Максимальный визуальный контраст.',
    colors: [baseColor, compColor],
  };
}

/**
 * Генерирует аналогичную цветовую схему.
 * Цвета, расположенные рядом на цветовом круге (по умолчанию ±30°).
 * Создает спокойное, гармоничное и естественное восприятие.
 */
export function getAnalogousHarmony(baseColor: Color, step: number = 30): ColorHarmony {
  const prevHsl = shiftHue(baseColor.hsl, -step);
  const nextHsl = shiftHue(baseColor.hsl, step);

  const prevColor = createColorFromHsl(prevHsl, `Аналогичный (-${step}°)`);
  const nextColor = createColorFromHsl(nextHsl, `Аналогичный (+${step}°)`);

  return {
    type: 'analogous',
    title: 'Аналогичная схема',
    description: 'Цвета, расположенные рядом на цветовом круге (±30°). Создает плавный и гармоничный переход.',
    colors: [prevColor, baseColor, nextColor],
  };
}

/**
 * Генерирует триадную цветовую схему.
 * Три цвета, равномерно распределенные под углом 120° друг к другу (0°, 120°, 240°).
 * Обеспечивает яркий контраст при сохранении баланса.
 */
export function getTriadicHarmony(baseColor: Color): ColorHarmony {
  const secondHsl = shiftHue(baseColor.hsl, 120);
  const thirdHsl = shiftHue(baseColor.hsl, 240);

  const secondColor = createColorFromHsl(secondHsl, 'Триадный (+120°)');
  const thirdColor = createColorFromHsl(thirdHsl, 'Триадный (+240°)');

  return {
    type: 'triadic',
    title: 'Триадная схема',
    description: 'Три равноудаленных цвета под углом 120° (0°, 120°, 240°). Яркая, сбалансированная палитра.',
    colors: [baseColor, secondColor, thirdColor],
  };
}

/**
 * Генерирует тетрадную (прямоугольную) цветовую схему (0°, 90°, 180°, 270°).
 */
export function getTetradicHarmony(baseColor: Color): ColorHarmony {
  const color90 = createColorFromHsl(shiftHue(baseColor.hsl, 90), 'Тетрадный (+90°)');
  const color180 = createColorFromHsl(shiftHue(baseColor.hsl, 180), 'Тетрадный (+180°)');
  const color270 = createColorFromHsl(shiftHue(baseColor.hsl, 270), 'Тетрадный (+270°)');

  return {
    type: 'tetradic',
    title: 'Тетрадная схема (Квадрат)',
    description: 'Четыре цвета под углом 90° друг к другу. Богатое разнообразие оттенков.',
    colors: [baseColor, color90, color180, color270],
  };
}

/**
 * Возвращает все гармонии для выбранного базового цвета.
 */
export function getAllHarmonies(baseColor: Color): ColorHarmony[] {
  return [
    getComplementaryHarmony(baseColor),
    getAnalogousHarmony(baseColor),
    getTriadicHarmony(baseColor),
    getTetradicHarmony(baseColor),
  ];
}
