/**
 * @file palette.spec.ts
 * @description Модульные тесты чистых функций управления структурой палитры (Level 3).
 * Проверяют соблюдение принципа неизменяемости (Immutability / Copy-on-Write)
 * и паттерн Arrange-Act-Assert с одним блоком Act.
 */

import { describe, it, expect } from 'vitest';
import {
  updateColorInPalette,
  addColorToPalette,
  removeColorFromPalette,
  reorderColorsInPalette,
  createNewPalette,
  filterPalettesBySearch,
  calculatePaletteAverageLuminance,
} from '../../src/utils/palette';
import { createColorFromHex } from '../../src/utils/color';
import type { ColorPalette, Color } from '../../src/types';

describe('Функция updateColorInPalette (Immutability / Copy-on-Write)', () => {
  it('должна заменять цвет по ID и возвращать новый объект палитры (новая ссылка)', () => {
    // Arrange: подготовка исходной палитры с двумя цветами
    const color1 = createColorFromHex('#ff0000', 'Красный', 'c1');
    const color2 = createColorFromHex('#00ff00', 'Зеленый', 'c2');
    const palette: ColorPalette = Object.freeze({
      id: 'p1',
      title: 'Тестовая палитра',
      description: 'Описание',
      colors: Object.freeze([color1, color2]),
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const replacementColor: Color = createColorFromHex('#0000ff', 'Синий', 'c1');

    // Act: обновление цвета с id 'c1'
    const updatedPalette = updateColorInPalette(palette, 'c1', replacementColor);

    // Assert: проверка ссылочной независимости и корректности замены
    expect(updatedPalette).not.toBe(palette); // новый объект палитры
    expect(updatedPalette.colors).not.toBe(palette.colors); // новый массив
    expect(updatedPalette.colors[0]?.hex).toBe('#0000ff'); // заменен
    expect(updatedPalette.colors[1]).toBe(color2); // незатронутый цвет сохранил ссылку
  });

  it('не должна изменять массив, если передан несуществующий colorId', () => {
    // Arrange
    const color1 = createColorFromHex('#ff0000', 'Красный', 'c1');
    const palette: ColorPalette = {
      id: 'p1',
      title: 'Палитра',
      description: '',
      colors: [color1],
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const newColor = createColorFromHex('#123456', 'Другой', 'non-existent');

    // Act
    const result = updateColorInPalette(palette, 'non-existent', newColor);

    // Assert: цвет остался прежним
    expect(result.colors[0]).toBe(color1);
  });
});

describe('Функция addColorToPalette', () => {
  it('должна добавлять цвет в конец массива colors без мутации исходной палитры', () => {
    // Arrange: палитра с одним цветом
    const color1 = createColorFromHex('#111111', 'Темный', 'c1');
    const initialPalette: ColorPalette = Object.freeze({
      id: 'p1',
      title: 'Базовая',
      description: '',
      colors: Object.freeze([color1]),
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const newColor = createColorFromHex('#ffffff', 'Светлый', 'c2');

    // Act: добавление цвета
    const nextPalette = addColorToPalette(initialPalette, newColor);

    // Assert
    expect(nextPalette.colors).toHaveLength(2);
    expect(nextPalette.colors[1]).toBe(newColor);
    expect(initialPalette.colors).toHaveLength(1); // исходная палитра не изменилась
  });
});

describe('Функция removeColorFromPalette', () => {
  it('должна удалять цвет по ID с сохранением остальных элементов', () => {
    // Arrange
    const color1 = createColorFromHex('#ff0000', 'Красный', 'c1');
    const color2 = createColorFromHex('#00ff00', 'Зеленый', 'c2');
    const palette: ColorPalette = {
      id: 'p1',
      title: 'Палитра',
      description: '',
      colors: [color1, color2],
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    // Act: удаление цвета 'c1'
    const result = removeColorFromPalette(palette, 'c1');

    // Assert
    expect(result.colors).toHaveLength(1);
    expect(result.colors[0]?.id).toBe('c2');
    expect(palette.colors).toHaveLength(2);
  });
});

describe('Функция reorderColorsInPalette', () => {
  it('должна перемещать цвет с одного индекса на другой', () => {
    // Arrange: цвета A, B, C
    const cA = createColorFromHex('#aaaaaa', 'A', 'a');
    const cB = createColorFromHex('#bbbbbb', 'B', 'b');
    const cC = createColorFromHex('#cccccc', 'C', 'c');
    const palette: ColorPalette = {
      id: 'p1',
      title: 'Порядок',
      description: '',
      colors: [cA, cB, cC],
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    // Act: переместить элемент с индекса 0 на индекс 2 (A перемещается в конец: B, C, A)
    const result = reorderColorsInPalette(palette, 0, 2);

    // Assert
    expect(result.colors.map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('должна возвращать неизмененную палитру при некорректных индексах', () => {
    // Arrange
    const cA = createColorFromHex('#aaaaaa', 'A', 'a');
    const palette: ColorPalette = {
      id: 'p1',
      title: 'Порядок',
      description: '',
      colors: [cA],
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    // Act: недопустимый индекс
    const result = reorderColorsInPalette(palette, 0, 99);

    // Assert
    expect(result).toBe(palette);
  });
});

describe('Фильтрация палитр (filterPalettesBySearch)', () => {
  it('должна находить палитры по подстроке в названии без учета регистра', () => {
    // Arrange
    const p1 = createNewPalette('Морской бриз', 'Синие оттенки');
    const p2 = createNewPalette('Осенний лес', 'Оранжевые оттенки');
    const list = [p1, p2];

    // Act
    const filtered = filterPalettesBySearch(list, 'морской');

    // Assert
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe('Морской бриз');
  });

  it('должна находить палитры по подстроке в описании', () => {
    // Arrange
    const p1 = createNewPalette('Тема 1', 'Футуристичный киберпанк');
    const p2 = createNewPalette('Тема 2', 'Спокойная пастель');
    const list = [p1, p2];

    // Act
    const filtered = filterPalettesBySearch(list, 'киберпанк');

    // Assert
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(p1.id);
  });

  it('должна возвращать копию всех палитр при пустом поисковом запросе', () => {
    // Arrange
    const p1 = createNewPalette('A');
    const p2 = createNewPalette('B');
    const list = [p1, p2];

    // Act
    const filtered = filterPalettesBySearch(list, '   ');

    // Assert
    expect(filtered).toHaveLength(2);
  });
});

describe('Расчет средней яркости палитры (calculatePaletteAverageLuminance)', () => {
  it('должна вычислять среднюю относительную яркость цветов палитры с помощью reduce', () => {
    // Arrange: черный (lum=0) и белый (lum=1)
    const black = createColorFromHex('#000000', 'Черный');
    const white = createColorFromHex('#ffffff', 'Белый');
    const palette = createNewPalette('Контраст', '', [black, white]);

    // Act
    const avgLum = calculatePaletteAverageLuminance(palette);

    // Assert: среднее между 0 и 1 равно 0.5
    expect(avgLum).toBe(0.5);
  });

  it('должна возвращать 0 для пустой палитры', () => {
    // Arrange: палитра без цветов
    const emptyPalette = createNewPalette('Пустая', '', []);

    // Act
    const avgLum = calculatePaletteAverageLuminance(emptyPalette);

    // Assert
    expect(avgLum).toBe(0);
  });
});
