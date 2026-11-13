/**
 * @file color.spec.ts
 * @description Модульные тесты вычислений координат цвета и валидации (Level 2).
 * Строго следует шаблону Arrange-Act-Assert (с одним блоком Act).
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  hexToHsl,
  isValidHex,
  validateHex,
  isValidRgb,
  validateRgb,
  isValidHsl,
  validateHsl,
  createColorFromHex,
  createColorFromRgb,
  createColorFromHsl,
  clamp,
} from '../../src/utils/color';
import type { RGB, HSL } from '../../src/types';

describe('Утилита clamp', () => {
  it('должна ограничивать число снизу минимальным значением', () => {
    // Arrange: подготовка входных данных ниже минимума
    const input = -10;
    const min = 0;
    const max = 255;

    // Act: выполнение операции ограничения
    const result = clamp(input, min, max);

    // Assert: проверка, что значение приведено к минимуму
    expect(result).toBe(0);
  });

  it('должна ограничивать число сверху максимальным значением', () => {
    // Arrange: подготовка входных данных выше максимума
    const input = 300;
    const min = 0;
    const max = 255;

    // Act: выполнение операции ограничения
    const result = clamp(input, min, max);

    // Assert: проверка, что значение приведено к максимуму
    expect(result).toBe(255);
  });

  it('должна возвращать само число, если оно находится внутри диапазона', () => {
    // Arrange: число внутри диапазона
    const input = 128;
    const min = 0;
    const max = 255;

    // Act
    const result = clamp(input, min, max);

    // Assert
    expect(result).toBe(128);
  });
});

describe('Конвертация HEX <-> RGB', () => {
  it('должна корректно преобразовывать 6-значный HEX в RGB координаты', () => {
    // Arrange: стандартный синий цвет
    const hex = '#3b82f6';

    // Act: вычисление RGB
    const result = hexToRgb(hex);

    // Assert: сверка числовых каналов
    expect(result).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('должна корректно преобразовывать короткий 3-значный HEX (#RGB)', () => {
    // Arrange: сокращенный красный цвет #f00
    const hex = '#f00';

    // Act
    const result = hexToRgb(hex);

    // Assert: каналы должны развернуться в #ff0000 -> { 255, 0, 0 }
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('должна возвращать черный цвет {0, 0, 0} для некорректного HEX-значения', () => {
    // Arrange: заведомо невалидный HEX
    const invalidHex = '#xyz123';

    // Act
    const result = hexToRgb(invalidHex);

    // Assert: граничный случай / fallback
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('должна корректно преобразовывать RGB в строковый HEX', () => {
    // Arrange: каналы для белого цвета
    const rgb: RGB = { r: 255, g: 255, b: 255 };

    // Act
    const result = rgbToHex(rgb);

    // Assert
    expect(result).toBe('#ffffff');
  });

  it('должна округлять и ограничивать граничные значения RGB при экспорте в HEX', () => {
    // Arrange: дробные и превышающие значения
    const rgb: RGB = { r: 255.4, g: -5, b: 300 };

    // Act
    const result = rgbToHex(rgb);

    // Assert: clamped r=255, g=0, b=255 -> #ff00ff
    expect(result).toBe('#ff00ff');
  });
});

describe('Конвертация RGB <-> HSL', () => {
  it('должна преобразовывать чистый красный цвет RGB в HSL (0, 100%, 50%)', () => {
    // Arrange
    const redRgb: RGB = { r: 255, g: 0, b: 0 };

    // Act
    const result = rgbToHsl(redRgb);

    // Assert
    expect(result).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('должна преобразовывать ахроматический серый цвет без деления на 0', () => {
    // Arrange: серый цвет, где все каналы равны (s = 0)
    const grayRgb: RGB = { r: 128, g: 128, b: 128 };

    // Act
    const result = rgbToHsl(grayRgb);

    // Assert: насыщенность s должна быть строго 0
    expect(result.s).toBe(0);
    expect(result.l).toBe(50);
  });

  it('должна корректно преобразовывать HSL обратно в RGB', () => {
    // Arrange: HSL для зеленого цвета
    const hsl: HSL = { h: 120, s: 100, l: 50 };

    // Act
    const result = hslToRgb(hsl);

    // Assert: чистый зеленый rgb(0, 255, 0)
    expect(result).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('должна возвращать эквивалентный HEX через hslToHex', () => {
    // Arrange: синий оттенок HSL
    const hsl: HSL = { h: 240, s: 100, l: 50 };

    // Act
    const result = hslToHex(hsl);

    // Assert: #0000ff
    expect(result).toBe('#0000ff');
  });

  it('должна поддерживать обратимость преобразования HEX -> HSL -> HEX', () => {
    // Arrange: чистый цвет без погрешности дискретизации процентов HSL
    const originalHex = '#ff0000';

    // Act: двойное преобразование HEX -> HSL -> HEX
    const intermediateHsl = hexToHsl(originalHex);
    const roundtripHex = hslToHex(intermediateHsl);

    // Assert: цвета должны строго совпадать
    expect(roundtripHex).toBe(originalHex);
  });

  it('должна сохранять визуальное соответствие RGB при квантовании HSL (погрешность не более 1)', () => {
    // Arrange: произвольный цвет #2563eb
    const originalRgb: RGB = { r: 37, g: 99, b: 235 };

    // Act: RGB -> HSL -> RGB
    const hsl = rgbToHsl(originalRgb);
    const restoredRgb = hslToRgb(hsl);

    // Assert: разница в каналах из-за целочисленных процентов HSL не превышает 1
    expect(Math.abs(restoredRgb.r - originalRgb.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(restoredRgb.g - originalRgb.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(restoredRgb.b - originalRgb.b)).toBeLessThanOrEqual(1);
  });
});

describe('Валидация форматов цвета', () => {
  it('должна подтверждать валидность корректных HEX-кодов', () => {
    // Arrange
    const hex = '#4f46e5';

    // Act
    const isValid = isValidHex(hex);

    // Assert
    expect(isValid).toBe(true);
  });

  it('должна отклонять невалидные HEX-строки', () => {
    // Arrange
    const badHex = 'not-a-hex';

    // Act
    const isValid = isValidHex(badHex);

    // Assert
    expect(isValid).toBe(false);
  });

  it('должна возвращать русскоязычную ошибку при пустом HEX', () => {
    // Arrange
    const empty = '';

    // Act
    const result = validateHex(empty);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Введите HEX-код');
  });

  it('должна валидировать корректный диапазон RGB каналов [0, 255]', () => {
    // Arrange
    const valid: RGB = { r: 100, g: 150, b: 200 };

    // Act
    const result = validateRgb(valid);

    // Assert
    expect(result.isValid).toBe(true);
  });

  it('должна отклонять RGB с каналами вне диапазона [0, 255]', () => {
    // Arrange
    const invalid: RGB = { r: 300, g: 0, b: 0 };

    // Act
    const result = validateRgb(invalid);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('должна валидировать HSL координаты в допустимых пределах', () => {
    // Arrange: тон 360, насыщенность 100, светлота 100
    const validHsl: HSL = { h: 360, s: 100, l: 100 };

    // Act
    const result = isValidHsl(validHsl);

    // Assert
    expect(result).toBe(true);
  });

  it('должна отклонять HSL с отрицательным тоном или превышением 360°', () => {
    // Arrange
    const invalidHsl: HSL = { h: 400, s: 50, l: 50 };

    // Act
    const result = isValidHsl(invalidHsl);

    // Assert
    expect(result).toBe(false);
  });
});

describe('Фабричные функции создания объектов Color', () => {
  it('createColorFromHex должна создавать иммутабельный объект со всеми форматами', () => {
    // Arrange
    const hex = '#10b981';

    // Act
    const color = createColorFromHex(hex, 'Изумрудный');

    // Assert
    expect(color.hex).toBe('#10b981');
    expect(color.name).toBe('Изумрудный');
    expect(color.rgb).toBeDefined();
    expect(color.hsl).toBeDefined();
    expect(color.id).toBeTruthy();
  });

  it('createColorFromRgb должна создавать объект Color с синхронизированным HEX и HSL', () => {
    // Arrange
    const rgb: RGB = { r: 255, g: 255, b: 0 };

    // Act
    const color = createColorFromRgb(rgb);

    // Assert
    expect(color.hex).toBe('#ffff00');
    expect(color.hsl.h).toBe(60);
  });

  it('createColorFromHsl должна создавать объект Color с нормализацией угла тона', () => {
    // Arrange: угол 390 градусов (должен нормализоваться в 30°)
    const hsl: HSL = { h: 390, s: 100, l: 50 };

    // Act
    const color = createColorFromHsl(hsl);

    // Assert
    expect(color.hsl.h).toBe(30);
    expect(color.rgb).toBeDefined();
    expect(color.hex).toBeTruthy();
  });
});
