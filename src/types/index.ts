/**
 * @file index.ts
 * @description Основные типы и интерфейсы предметной области приложения управления цветовыми палитрами.
 */

/**
 * Координаты цвета в модели RGB.
 * Значения каналов r, g, b находятся в диапазоне [0, 255].
 */
export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/**
 * Координаты цвета в модели HSL.
 * h: цветовой тон (Hue) в градусах [0, 360].
 * s: насыщенность (Saturation) в процентах [0, 100].
 * l: светлота (Lightness) в процентах [0, 100].
 */
export interface HSL {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

/**
 * Модель цвета с представлениями во всех трех форматах (HEX, RGB, HSL).
 * Содержит уникальный идентификатор для безопасного маппинга в списках.
 */
export interface Color {
  readonly id: string;
  readonly hex: string;
  readonly rgb: RGB;
  readonly hsl: HSL;
  readonly name?: string;
}

/**
 * Модель цветовой палитры.
 * Неизменяемая структура данных (immutability).
 */
export interface ColorPalette {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly colors: readonly Color[];
  readonly createdAt: string;
  readonly updatedAt?: string;
}

/**
 * Результат проверки доступности (контрастности) по стандарту WCAG.
 */
export interface ContrastResult {
  readonly ratio: number;
  readonly wcagAA: boolean; // проходит стандарт WCAG AA (минимум 4.5:1 для обычного текста)
  readonly wcagAAA: boolean; // проходит стандарт WCAG AAA (минимум 7:1 для обычного текста)
  readonly wcagAALarge?: boolean; // минимум 3:1 для крупного текста (от 18pt или 14pt bold)
  readonly wcagAAALarge?: boolean; // минимум 4.5:1 для крупного текста
}

/**
 * Тип цветовой гармонии.
 */
export type HarmonyType =
  | 'complementary' // Комплементарная (+180°)
  | 'analogous' // Аналогичная (±30°)
  | 'triadic' // Триадная (0°, 120°, 240°)
  | 'split-complementary' // Раздельно-комплементарная
  | 'tetradic'; // Тетрадная (прямоугольная)

/**
 * Описание сгенерированной цветовой гармонии.
 */
export interface ColorHarmony {
  readonly type: HarmonyType;
  readonly title: string;
  readonly description: string;
  readonly colors: readonly Color[];
}

/**
 * Результат валидации поля ввода.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}
