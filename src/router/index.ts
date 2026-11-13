import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import PaletteEditorView from '../views/PaletteEditorView.vue';
import HarmoniesView from '../views/HarmoniesView.vue';
import AccessibilityView from '../views/AccessibilityView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Панель управления' },
    },
    {
      path: '/editor',
      name: 'editor-new',
      component: PaletteEditorView,
      meta: { title: 'Создание палитры' },
    },
    {
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
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const baseTitle = 'ColorPalette SPA';
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;
  next();
});

export default router;
