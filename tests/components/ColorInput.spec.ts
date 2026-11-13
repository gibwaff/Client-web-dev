/**
 * @file ColorInput.spec.ts
 * @description Тестирование Vue-компонента ColorInput.vue (интерактивный редактор цвета).
 * Проверяет: реакцию на ввод пользователя, синхронизацию форматов,
 * валидацию и генерацию событий (emits).
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ColorInput from '../../src/components/ColorInput.vue';

describe('Компонент ColorInput.vue', () => {
  it('должен инициализироваться с переданным initialHex', () => {
    // Arrange: начальный цвет
    const initialHex = '#10b981';

    // Act: монтирование компонента
    const wrapper = mount(ColorInput, {
      props: { initialHex },
    });
    const hexInput = wrapper.find<HTMLInputElement>('#hex-field');

    // Assert: поле ввода HEX содержит переданное значение
    expect(hexInput.element.value).toBe(initialHex);
  });

  it('должен переключать вкладки форматов (HEX, RGB, HSL)', async () => {
    // Arrange
    const wrapper = mount(ColorInput);
    const tabButtons = wrapper.findAll('.tab-btn');

    // Act: клик на вторую вкладку "RGB"
    await tabButtons[1]?.trigger('click');

    // Assert: отображаются слайдеры RGB каналов
    expect(wrapper.text()).toContain('R (Красный)');
    expect(wrapper.text()).toContain('G (Зеленый)');
    expect(wrapper.text()).toContain('B (Синий)');
  });

  it('должен испускать событие "color-submit" с валидным объектом цвета при нажатии на кнопку', async () => {
    // Arrange
    const wrapper = mount(ColorInput, {
      props: {
        initialHex: '#3b82f6',
        submitButtonText: 'Добавить',
      },
    });
    const submitBtn = wrapper.find('.submit-color-btn');

    // Act: нажатие на кнопку отправки цвета
    await submitBtn.trigger('click');

    // Assert: проверим испускание события
    const emitted = wrapper.emitted('color-submit');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toMatchObject({
      hex: '#3b82f6',
      rgb: { r: 59, g: 130, b: 246 },
    });
  });

  it('должен блокировать отправку и показывать сообщение об ошибке при невалидном HEX', async () => {
    // Arrange
    const wrapper = mount(ColorInput);
    const hexInput = wrapper.find<HTMLInputElement>('#hex-field');

    // Act: пользователь вводит заведомо неверный HEX
    await hexInput.setValue('invalid-color');

    // Assert: отображается ошибка валидации и кнопка отправки заблокирована
    expect(wrapper.find('.error-text').exists()).toBe(true);
    const submitBtn = wrapper.find<HTMLButtonElement>('.submit-color-btn');
    expect(submitBtn.element.disabled).toBe(true);
  });

  it('должен испускать событие "change" при вводе нового HEX-кода', async () => {
    // Arrange
    const wrapper = mount(ColorInput);
    const hexInput = wrapper.find<HTMLInputElement>('#hex-field');

    // Act: пользователь меняет значение на валидный HEX
    await hexInput.setValue('#ef4444');

    // Assert: родитель уведомляется об изменении цвета
    const emitted = wrapper.emitted('change');
    expect(emitted).toBeTruthy();
    const lastColor = emitted?.[emitted.length - 1]?.[0];
    expect(lastColor).toMatchObject({ hex: '#ef4444' });
  });
});
