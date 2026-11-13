/**
 * @file harmonies.spec.ts
 * @description Модульные тесты генерации цветовых гармоний (Level 3 Domain Calculations).
 * Строго следует шаблону Arrange-Act-Assert (один Act на тест).
 */

import { describe, it, expect } from 'vitest';
import {
  getComplementaryHarmony,
  getAnalogousHarmony,
  getTriadicHarmony,
  getTetradicHarmony,
  getAllHarmonies,
} from '../../src/utils/harmonies';
import { createColorFromHsl } from '../../src/utils/color';
import type { Color } from '../../src/types';

describe('Генерация комплементарной гармонии', () => {
  it('должна создавать цвет с противоположным оттенком (+180°)', () => {
    // Arrange: базовый синий цвет HSL(210°, 100%, 50%)
    const baseColor: Color = createColorFromHsl({ h: 210, s: 100, l: 50 }, 'Базовый синий');

    // Act: генерация комплементарной схемы
    const harmony = getComplementaryHarmony(baseColor);

    // Assert: противоположный угол (210 + 180) % 360 = 30° (оранжевый)
    expect(harmony.type).toBe('complementary');
    expect(harmony.colors).toHaveLength(2);
    expect(harmony.colors[0]?.hsl.h).toBe(210);
    expect(harmony.colors[1]?.hsl.h).toBe(30);
  });

  it('должна корректно обрабатывать циклический перенос угла через 360°', () => {
    // Arrange: базовый цвет с оттенком 300° (пурпурный)
    const baseColor: Color = createColorFromHsl({ h: 300, s: 80, l: 50 });

    // Act
    const harmony = getComplementaryHarmony(baseColor);

    // Assert: (300 + 180) = 480 % 360 = 120° (зеленый)
    expect(harmony.colors[1]?.hsl.h).toBe(120);
  });
});

describe('Генерация аналогичной гармонии', () => {
  it('должна создавать три цвета со смещением ±30° от базового', () => {
    // Arrange: базовый зеленый цвет (120°)
    const baseColor: Color = createColorFromHsl({ h: 120, s: 90, l: 50 });

    // Act: расчет аналогичной схемы
    const harmony = getAnalogousHarmony(baseColor, 30);

    // Assert: ожидаются 90°, 120°, 150°
    expect(harmony.type).toBe('analogous');
    expect(harmony.colors).toHaveLength(3);
    expect(harmony.colors[0]?.hsl.h).toBe(90);
    expect(harmony.colors[1]?.hsl.h).toBe(120);
    expect(harmony.colors[2]?.hsl.h).toBe(150);
  });

  it('должна поддерживать отрицательный сдвиг через 0° (граничный случай)', () => {
    // Arrange: красный цвет 10°
    const baseColor: Color = createColorFromHsl({ h: 10, s: 100, l: 50 });

    // Act
    const harmony = getAnalogousHarmony(baseColor, 30);

    // Assert: 10 - 30 = -20 -> нормализуется в 340°
    expect(harmony.colors[0]?.hsl.h).toBe(340);
  });
});

describe('Генерация триадной гармонии', () => {
  it('должна создавать три равноудаленных цвета под углом 120° (0°, 120°, 240°)', () => {
    // Arrange: базовый красный 0°
    const baseColor: Color = createColorFromHsl({ h: 0, s: 100, l: 50 });

    // Act
    const harmony = getTriadicHarmony(baseColor);

    // Assert
    expect(harmony.type).toBe('triadic');
    expect(harmony.colors).toHaveLength(3);
    expect(harmony.colors[0]?.hsl.h).toBe(0);
    expect(harmony.colors[1]?.hsl.h).toBe(120);
    expect(harmony.colors[2]?.hsl.h).toBe(240);
  });
});

describe('Генерация тетрадной гармонии', () => {
  it('должна создавать четыре цвета с шагом 90°', () => {
    // Arrange
    const baseColor: Color = createColorFromHsl({ h: 45, s: 80, l: 50 });

    // Act
    const harmony = getTetradicHarmony(baseColor);

    // Assert: 45°, 135°, 225°, 315°
    expect(harmony.type).toBe('tetradic');
    expect(harmony.colors).toHaveLength(4);
    expect(harmony.colors[0]?.hsl.h).toBe(45);
    expect(harmony.colors[1]?.hsl.h).toBe(135);
    expect(harmony.colors[2]?.hsl.h).toBe(225);
    expect(harmony.colors[3]?.hsl.h).toBe(315);
  });
});

describe('Комплексная генерация всех схем (getAllHarmonies)', () => {
  it('должна возвращать набор из 4 гармоний без мутации исходного базового цвета', () => {
    // Arrange: замороженный базовый цвет для проверки иммутабельности
    const baseColor: Color = Object.freeze(createColorFromHsl({ h: 180, s: 50, l: 50 }));

    // Act: генерация всех гармоний
    const all = getAllHarmonies(baseColor);

    // Assert: содержит 4 схемы, исходный объект не модифицирован
    expect(all).toHaveLength(4);
    expect(all.map((h) => h.type)).toEqual(['complementary', 'analogous', 'triadic', 'tetradic']);
    expect(baseColor.hsl.h).toBe(180);
  });
});
