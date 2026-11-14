<script setup lang="ts">
/**
 * @file AppCard.vue
 * @description Базовый компонент карточки-контейнера, демонстрирующий механизм СЛОТОВ (Slots) в Vue 3.
 * 
 * ЧТО ТАКОЕ СЛОТЫ:
 * Слоты — это специальные «окна» в разметке дочернего компонента, куда родительский
 * компонент может передать свою кастомную верстку (кнопки, заголовки, бейджи, текст).
 * 
 * В ЭТОМ КОМПОНЕНТЕ РЕАЛИЗОВАНЫ:
 * 1. Именованный слот #header — для заголовка (с fallback-контентом, если слот не передан).
 * 2. Именованный слот #extra — для правого верхнего угла (даты, статусы, бейджи).
 * 3. Дефолтный слот <slot /> — для основного содержимого (тела карточки).
 * 4. Именованный слот #footer — для панели действий и кнопок внизу карточки.
 */
interface Props {
  title?: string;       // Заголовок по умолчанию (используется, если не передан кастомный слот #header)
  subtitle?: string;    // Подзаголовок по умолчанию
  hoverable?: boolean;  // Добавлять ли анимацию приподнимания при наведении курсора
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  hoverable: false,
});
</script>

<template>
  <div class="app-card" :class="{ 'app-card--hoverable': hoverable }">
    <!-- Шапка карточки: отображается, если передан слот #header или заголовок title -->
    <header v-if="$slots.header || title" class="app-card__header">
      <!-- 
        ИМЕНОВАННЫЙ СЛОТ #header С РЕЗЕРВНЫМ (FALLBACK) СОДЕРЖИМЫМ:
        Если родитель передал `<template #header>...</template>`, отрендерится контент родителя.
        Если родитель слот НЕ передал, сработает дефолтная разметка с h3 и p.
      -->
      <slot name="header">
        <div class="app-card__titles">
          <h3 v-if="title" class="app-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="app-card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <!-- Именованный слот #extra для вспомогательных элементов справа -->
      <div v-if="$slots.extra" class="app-card__extra">
        <slot name="extra" />
      </div>
    </header>

    <!-- 
      ОСНОВНОЙ ДЕФОЛТНЫЙ СЛОТ:
      Сюда попадает весь контент, который родитель пишет между открывающим
      и закрывающим тегом: `<AppCard> ВОТ ЭТОТ КОНТЕНТ </AppCard>`.
    -->
    <div class="app-card__body">
      <slot />
    </div>

    <!-- 
      ИМЕНОВАННЫЙ СЛОТ #footer:
      Отображается только если родитель передал `<template #footer>...</template>`.
      Используется для кнопок «Сохранить», «Удалить», «Редактировать».
    -->
    <footer v-if="$slots.footer" class="app-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.app-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.app-card--hoverable:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.app-card__header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-header-bg, #fafafa);
}

.app-card__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}

.app-card__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.app-card__body {
  padding: 1.5rem;
  flex: 1;
}

.app-card__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #f1f5f9);
  background: var(--card-header-bg, #fafafa);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: center;
}
</style>
