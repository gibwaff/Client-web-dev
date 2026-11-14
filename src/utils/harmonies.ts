/**
 * @file harmonies.ts
 * @description Чистые функции для генерации цветовых гармоний на основе теории цвета Иоганнеса Иттена.
 * 
 * ПРИНЦИП РАБОТЫ:
 * Все гармонии рассчитываются в цилиндрической модели HSL:
 * - H (Hue / Цветовой тон) — это угол на 360-градусном цветовом круге:
 *   0° — Красный, 60° — Желтый, 120° — Зеленый, 180° — Циан, 240° — Синий, 300° — Маджента.
 * - S (Saturation / Насыщенность) и L (Lightness / Светлота) сохраняются от базового цвета,
 *   меняется только угол H.
 */

import type { Color, ColorHarmony, HSL } from '../types';
import { createColorFromHsl } from './color';

/**
 * Нормализует угол оттенка в допустимый диапазон [0, 360).
 * 
 * ПОЧЕМУ ТАКАЯ ФОРМУЛА: `((hue % 360) + 360) % 360`:
 * В JavaScript остаток от деления для отрицательных чисел дает отрицательный результат:
 * например: `-30 % 360 = -30`.
 * Прибавление `+ 360` и повторный `% 360` гарантируют, что `-30°` корректно превратится в `+330°`.
 */
function normalizeHue(hue: number): number {
  return ((Math.round(hue) % 360) + 360) % 360;
}

/**
 * Сдвигает оттенок на заданный угол смещения angle по цветовому кругу.
 */
function shiftHue(baseHsl: HSL, angle: number): HSL {
  return {
    h: normalizeHue(baseHsl.h + angle),
    s: baseHsl.s,
    l: baseHsl.l,
  };
}

/**
 * Комплементарная (дополнительная) цветовая схема.
 * 
 * ТЕОРИЯ:
 * Два цвета, расположенные строго друг напротив друга на цветовом круге (+180°).
 * Например: Синий (240°) и Оранжевый (60°).
 * Дает максимальный визуальный контраст и привлекает внимание.
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
 * Аналогичная (родственная) цветовая схема.
 * 
 * ТЕОРИЯ:
 * Три цвета, расположенные по соседству на круге (с шагом ±30°).
 * Например: Зеленый (120°), Салатовый (90°), Бирюзовый (150°).
 * Создает спокойное, природное и комфортное для глаз восприятие интерфейса.
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
 * Триадная цветовая схема.
 * 
 * ТЕОРИЯ:
 * Три равноудаленных цвета, образующих равносторонний треугольник на круге (0°, 120°, 240°).
 * Например: Красный (0°), Зеленый (120°), Синий (240°).
 * Обеспечивает баланс между высокой контрастностью и богатством палитры.
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
 * Тетрадная (прямоугольная / квадратная) цветовая схема.
 * 
 * ТЕОРИЯ:
 * Четыре цвета под прямым углом 90° друг к другу (0°, 90°, 180°, 270°).
 * Дает максимальное разнообразие оттенков при сохранении геометрической симметрии.
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
 * Чистая функция, возвращающая массив всех 4 видов гармоний для базового цвета.
 */
export function getAllHarmonies(baseColor: Color): ColorHarmony[] {
  return [
    getComplementaryHarmony(baseColor),
    getAnalogousHarmony(baseColor),
    getTriadicHarmony(baseColor),
    getTetradicHarmony(baseColor),
  ];
}
