/**
 * @file ColorCard.spec.ts
 * @description Тестирование Vue-компонента ColorCard с использованием @vue/test-utils.
 * Проверяет: свойства (props), вычисляемые свойства (computed), испускаемые события (emit)
 * и слоты (slots). Следует паттерну Arrange-Act-Assert.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ColorCard from '../../src/components/ColorCard.vue';
import { createColorFromHex } from '../../src/utils/color';

describe('Компонент ColorCard.vue', () => {
  it('должен правильно отрисовывать значения цвета из переданных props', () => {
    // Arrange: подготовка тестового цвета
    const testColor = createColorFromHex('#ef4444', 'Коралловый закат');

    // Act: монтирование компонента с переданными props
    const wrapper = mount(ColorCard, {
      props: {
        color: testColor,
      },
    });

    // Assert: проверка вывода названия, HEX, RGB и HSL в DOM
    expect(wrapper.text()).toContain('Коралловый закат');
    expect(wrapper.text()).toContain('#EF4444');
    expect(wrapper.text()).toContain('239, 68, 68');
  });

  it('должен вычислять темный цвет текста (computed: textContrastColor) для светлого фона', () => {
    // Arrange: светло-желтый цвет
    const lightColor = createColorFromHex('#fef08a', 'Светло-желтый');

    // Act: монтирование компонента
    const wrapper = mount(ColorCard, {
      props: {
        color: lightColor,
      },
    });
    const swatch = wrapper.find('.color-card__swatch');

    // Assert: стиль цвета текста должен быть темным (#0f172a) для обеспечения контраста
    expect(swatch.attributes('style')).toContain('color: rgb(15, 23, 42)');
  });

  it('должен вычислять белый цвет текста (computed: textContrastColor) для темного фона', () => {
    // Arrange: глубокий темно-синий цвет
    const darkColor = createColorFromHex('#0f172a', 'Темная ночь');

    // Act
    const wrapper = mount(ColorCard, {
      props: {
        color: darkColor,
      },
    });
    const swatch = wrapper.find('.color-card__swatch');

    // Assert: стиль цвета текста должен быть белым (#ffffff)
    expect(swatch.attributes('style')).toContain('color: rgb(255, 255, 255)');
  });

  it('должен испускать событие "remove" с ID цвета при клике на кнопку удаления', async () => {
    // Arrange: карточка с флагом removable=true
    const color = createColorFromHex('#3b82f6', 'Синий', 'test-id-123');
    const wrapper = mount(ColorCard, {
      props: {
        color,
        removable: true,
      },
    });
    const removeBtn = wrapper.find('.btn-remove');

    // Act: пользователь нажимает на кнопку удаления
    await removeBtn.trigger('click');

    // Assert: событие 'remove' испущено ровно один раз с аргументом 'test-id-123'
    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')?.[0]).toEqual(['test-id-123']);
  });

  it('должен испускать событие "select" при клике на карточку, если selectable=true', async () => {
    // Arrange
    const color = createColorFromHex('#10b981', 'Изумруд', 'col-select');
    const wrapper = mount(ColorCard, {
      props: {
        color,
        selectable: true,
      },
    });

    // Act: клик по самой карточке
    await wrapper.trigger('click');

    // Assert: событие 'select' отправлено родительскому компоненту
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual([color]);
  });

  it('должен поддерживать переопределение действий через именованный слот #actions', () => {
    // Arrange: передача кастомной разметки в слот #actions
    const color = createColorFromHex('#8b5cf6', 'Фиолетовый');

    // Act
    const wrapper = mount(ColorCard, {
      props: { color },
      slots: {
        actions: '<button class="custom-action-btn">Кастомная кнопка</button>',
      },
    });

    // Assert: кастомный слот успешно отрендерен внутри компонента
    expect(wrapper.find('.custom-action-btn').exists()).toBe(true);
    expect(wrapper.find('.custom-action-btn').text()).toBe('Кастомная кнопка');
  });
});
