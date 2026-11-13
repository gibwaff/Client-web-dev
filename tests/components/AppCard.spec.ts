/**
 * @file AppCard.spec.ts
 * @description Тестирование Vue-компонента AppCard и работы со слотами (slots: #header, default, #footer, #extra).
 * Следует шаблону Arrange-Act-Assert.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppCard from '../../src/components/AppCard.vue';

describe('Компонент AppCard.vue (Тестирование слотов)', () => {
  it('должен отрисовывать базовый заголовок и подзаголовок из props', () => {
    // Arrange: подготовка props
    const props = {
      title: 'Моя палитра',
      subtitle: 'Описание цветовой схемы',
    };

    // Act: монтирование компонента
    const wrapper = mount(AppCard, { props });

    // Assert: проверка наличия заголовков в разметке
    expect(wrapper.find('.app-card__title').text()).toBe('Моя палитра');
    expect(wrapper.find('.app-card__subtitle').text()).toBe('Описание цветовой схемы');
  });

  it('должен поддерживать пользовательскую разметку через именованный слот #header', () => {
    // Arrange: слот с кастомным бейджем и заголовком
    const slots = {
      header: '<div class="custom-header"><h2>Кастомная шапка</h2><span class="badge">Новое</span></div>',
    };

    // Act
    const wrapper = mount(AppCard, { slots });

    // Assert: кастомный слот заменил дефолтный шаблон шапки
    expect(wrapper.find('.custom-header').exists()).toBe(true);
    expect(wrapper.text()).toContain('Кастомная шапка');
    expect(wrapper.text()).toContain('Новое');
  });

  it('должен отрисовывать содержимое в основном дефолтном слоте (тело карточки)', () => {
    // Arrange: передача контента в тело карточки
    const slots = {
      default: '<p class="card-content">Тестовое содержимое тела карточки</p>',
    };

    // Act
    const wrapper = mount(AppCard, { slots });

    // Assert
    expect(wrapper.find('.card-content').exists()).toBe(true);
    expect(wrapper.find('.card-content').text()).toBe('Тестовое содержимое тела карточки');
  });

  it('должен отрисовывать слот подвала #footer, когда он передан', () => {
    // Arrange
    const slots = {
      footer: '<button id="save-btn">Сохранить</button>',
    };

    // Act
    const wrapper = mount(AppCard, { slots });

    // Assert
    expect(wrapper.find('.app-card__footer').exists()).toBe(true);
    expect(wrapper.find('#save-btn').text()).toBe('Сохранить');
  });

  it('не должен отображать блок подвала, если слот #footer отсутствует', () => {
    // Arrange: карточка без подвала
    const slots = {
      default: '<div>Контент</div>',
    };

    // Act
    const wrapper = mount(AppCard, { slots });

    // Assert
    expect(wrapper.find('.app-card__footer').exists()).toBe(false);
  });

  it('должен добавлять CSS-класс анимации при hoverable: true', () => {
    // Arrange
    const props = { hoverable: true };

    // Act
    const wrapper = mount(AppCard, { props });

    // Assert
    expect(wrapper.classes()).toContain('app-card--hoverable');
  });
});
