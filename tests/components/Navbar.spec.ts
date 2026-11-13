/**
 * @file Navbar.spec.ts
 * @description Тестирование компонента Navbar.vue с маршрутизацией.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../../src/components/Navbar.vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/editor', component: { template: '<div>Editor</div>' } },
    { path: '/harmonies', component: { template: '<div>Harmonies</div>' } },
    { path: '/accessibility', component: { template: '<div>Accessibility</div>' } },
  ],
});

describe('Компонент Navbar.vue', () => {
  it('должен содержать ссылки на все 4 обязательных раздела SPA', async () => {
    // Arrange: роутер с памятью
    await router.push('/');
    await router.isReady();

    // Act: монтирование с плагином router
    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
      },
    });

    // Assert: проверка ссылок
    const links = wrapper.findAll('.nav-link');
    expect(links.length).toBe(4);
    expect(wrapper.text()).toContain('Главная панель');
    expect(wrapper.text()).toContain('Редактор палитр');
    expect(wrapper.text()).toContain('Цветовые гармонии');
    expect(wrapper.text()).toContain('Проверка доступности');
  });

  it('должен отображать индикатор состояния подключения', async () => {
    // Arrange
    await router.push('/');
    await router.isReady();

    // Act
    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
      },
    });

    // Assert: элемент индикатора присутствует
    expect(wrapper.find('.status-indicator').exists()).toBe(true);
  });
});
