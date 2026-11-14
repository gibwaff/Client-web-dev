/**
 * @file index.ts (Router)
 * @description Конфигурация клиентской маршрутизации приложения на базе Vue Router 4 (Клиентский роутер SPA).
 * 
 * КАК ЭТО РАБОТАЕТ В SPA:
 * 1. createWebHistory использует HTML5 History API браузера (window.history.pushState).
 * 2. Браузер НЕ делает сетевой запрос на сервер при смене адреса.
 * 3. Vue Router перехватывает путь в адресной строке и монтирует нужный компонент страницы
 *    прямо в тег <RouterView /> внутри App.vue.
 */

import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import PaletteEditorView from '../views/PaletteEditorView.vue';
import HarmoniesView from '../views/HarmoniesView.vue';
import AccessibilityView from '../views/AccessibilityView.vue';

const router = createRouter({
  // Режим History API: красивые чистые URL без решетки (#)
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // Таблица маршрутов приложения (4 обязательные страницы по заданию):
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Панель управления' }, // Заголовок вкладки браузера
    },
    {
      path: '/editor',
      name: 'editor-new',
      component: PaletteEditorView,
      meta: { title: 'Создание палитры' },
    },
    {
      // Динамический параметр :id — позволяет открыть конкретную палитру по её ID
      path: '/editor/:id',
      name: 'editor-edit',
      component: PaletteEditorView,
      meta: { title: 'Редактирование палитры' },
    },
    {
      path: '/harmonies',
      name: 'harmonies',
      component: HarmoniesView,
      meta: { title: 'Цветовые гармонии' },
    },
    {
      path: '/accessibility',
      name: 'accessibility',
      component: AccessibilityView,
      meta: { title: 'Проверка доступности' },
    },
    {
      // Перенаправление (redirect) для всех несуществующих маршрутов на главную
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

/**
 * Глобальный навигационный хук (Navigation Guard):
 * Срабатывает перед каждым переходом по страницам и динамически меняет <title> вкладки.
 */
router.beforeEach((to, _from, next) => {
  const baseTitle = 'ColorPalette SPA';
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;
  next(); // Разрешаем переход к целевому маршруту
});

export default router;
