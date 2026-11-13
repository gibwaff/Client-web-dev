/**
 * @file contrast.spec.ts
 * @description Модульные тесты вычислений коэффициента контрастности и доступности WCAG (Level 2/3).
 * Строго следует шаблону Arrange-Act-Assert с одним блоком Act в каждом тесте.
 */

import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  calculateContrastRatio,
  checkWcagContrast,
  getContrastRatingLabel,
} from '../../src/utils/contrast';
import type { RGB, ContrastResult } from '../../src/types';

describe('Расчет относительной яркости (getLuminance)', () => {
  it('должен возвращать относительную яркость 0 для абсолютно черного цвета', () => {
    // Arrange: черный цвет RGB(0, 0, 0)
    const black: RGB = { r: 0, g: 0, b: 0 };

    // Act: расчет яркости
    const luminance = getLuminance(black);

    // Assert: яркость абсолютно черного равна строго 0
    expect(luminance).toBe(0);
  });

  it('должен возвращать относительную яркость 1 для абсолютно белого цвета', () => {
    // Arrange: белый цвет RGB(255, 255, 255)
    const white: RGB = { r: 255, g: 255, b: 255 };

    // Act: расчет яркости
    const luminance = getLuminance(white);

    // Assert: яркость абсолютно белого равна 1
    expect(luminance).toBeCloseTo(1, 4);
  });

  it('должен возвращать промежуточное значение яркости для зеленого цвета', () => {
    // Arrange: зеленый компонент вносит наибольший вклад в человеческое восприятие (0.7152)
    const green: RGB = { r: 0, g: 255, b: 0 };

    // Act
    const luminance = getLuminance(green);

    // Assert
    expect(luminance).toBeCloseTo(0.7152, 2);
  });
});

describe('Расчет коэффициента контрастности (calculateContrastRatio)', () => {
  it('должен возвращать максимальный коэффициент 21:1 для черного и белого', () => {
    // Arrange: черный и белый цвета
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    // Act: расчет контраста
    const ratio = calculateContrastRatio(black, white);

    // Assert: по формуле WCAG (1 + 0.05) / (0 + 0.05) = 1.05 / 0.05 = 21
    expect(ratio).toBe(21);
  });

  it('должен возвращать минимальный коэффициент 1:1 для одинаковых цветов', () => {
    // Arrange: два одинаковых синих цвета
    const blue: RGB = { r: 37, g: 99, b: 235 };

    // Act: расчет коэффициента между одинаковыми цветами
    const ratio = calculateContrastRatio(blue, blue);

    // Assert
    expect(ratio).toBe(1);
  });

  it('должен быть симметричным относительно порядка аргументов (фон и текст)', () => {
    // Arrange
    const colorA: RGB = { r: 30, g: 58, b: 138 };
    const colorB: RGB = { r: 245, g: 158, b: 11 };

    // Act: вычисление в обоих направлениях
    const ratioAB = calculateContrastRatio(colorA, colorB);
    const ratioBA = calculateContrastRatio(colorB, colorA);

    // Assert: результат не должен зависеть от того, что передано фоном, а что текстом
    expect(ratioAB).toBe(ratioBA);
  });
});

describe('Проверка соответствия стандарту WCAG (checkWcagContrast)', () => {
  it('должен подтверждать прохождение WCAG AA и AAA для черного текста на белом фоне', () => {
    // Arrange: черный текст на белом фоне
    const fg = '#000000';
    const bg = '#ffffff';

    // Act: проверка соответствия стандарту
    const result: ContrastResult = checkWcagContrast(fg, bg);

    // Assert: контраст 21:1 превосходит пороги 4.5:1 и 7.0:1
    expect(result.ratio).toBe(21);
    expect(result.wcagAA).toBe(true);
    expect(result.wcagAAA).toBe(true);
  });

  it('должен подтверждать прохождение WCAG AA, но не AAA для средне-контрастной пары', () => {
    // Arrange: серый #666666 на белом дает контраст ~5.74:1 (между 4.5 и 7.0)
    const fg = '#666666';
    const bg = '#ffffff';

    // Act
    const result = checkWcagContrast(fg, bg);

    // Assert: проходит AA (>= 4.5), но не проходит строгий AAA (требуется >= 7.0)
    expect(result.wcagAA).toBe(true);
    expect(result.wcagAAA).toBe(false);
  });

  it('должен фиксировать провал обоих стандартов при низком контрасте (желтый на белом)', () => {
    // Arrange: желтый на белом
    const fg = '#facc15';
    const bg = '#ffffff';

    // Act
    const result = checkWcagContrast(fg, bg);

    // Assert: контраст ниже 4.5:1
    expect(result.wcagAA).toBe(false);
    expect(result.wcagAAA).toBe(false);
    expect(result.ratio).toBeLessThan(4.5);
  });
});

describe('Метка доступности и рекомендации (getContrastRatingLabel)', () => {
  it('должен возвращать статус "Отлично" при соблюдении стандарта WCAG AAA', () => {
    // Arrange: результат с пройденным AAA
    const result: ContrastResult = {
      ratio: 8.5,
      wcagAA: true,
      wcagAAA: true,
    };

    // Act: получение читаемой метки
    const rating = getContrastRatingLabel(result);

    // Assert
    expect(rating.badge).toBe('Отлично');
  });

  it('должен возвращать статус "Хорошо" при соблюдении только стандарта WCAG AA', () => {
    // Arrange
    const result: ContrastResult = {
      ratio: 5.2,
      wcagAA: true,
      wcagAAA: false,
    };

    // Act
    const rating = getContrastRatingLabel(result);

    // Assert
    expect(rating.badge).toBe('Хорошо');
  });

  it('должен возвращать статус "Плохо" при непрохождении WCAG AA', () => {
    // Arrange
    const result: ContrastResult = {
      ratio: 2.1,
      wcagAA: false,
      wcagAAA: false,
    };

    // Act
    const rating = getContrastRatingLabel(result);

    // Assert
    expect(rating.badge).toBe('Плохо');
  });
});
