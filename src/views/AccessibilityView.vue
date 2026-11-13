<script setup lang="ts">
/**
 * @file AccessibilityView.vue
 * @description Средство проверки доступности (WCAG 2.1 Contrast Checker).
 * Проверяет коэффициенты контрастности между цветом текста и фоном,
 * вычисляет соответствие стандартам WCAG AA (4.5:1) и WCAG AAA (7:1),
 * и предоставляет наглядный интерактивный предварительный просмотр UI элементов.
 */
import { ref, computed } from 'vue';
import AppCard from '../components/AppCard.vue';
import type { ContrastResult, RGB } from '../types';
import { hexToRgb, rgbToHex, isValidHex, normalizeHex } from '../utils/color';
import { checkWcagContrast, getContrastRatingLabel } from '../utils/contrast';

// Начальные цвета: темно-серый текст на белом фоне
const textColorHex = ref<string>('#1e293b');
const bgColorHex = ref<string>('#ffffff');

// Вычисляемый результат проверки контрастности
const contrastResult = computed<ContrastResult>(() => {
  return checkWcagContrast(textColorHex.value, bgColorHex.value);
});

// Рейтинг и текстовая рекомендация
const rating = computed(() => {
  return getContrastRatingLabel(contrastResult.value);
});

// Быстрая смена местами фона и текста
function swapColors() {
  const temp = textColorHex.value;
  textColorHex.value = bgColorHex.value;
  bgColorHex.value = temp;
}

// Предустановленные комбинации для быстрого тестирования
const presets = [
  { name: 'Черный на белом (Идеал)', fg: '#000000', bg: '#ffffff' },
  { name: 'Белый на темно-синем', fg: '#ffffff', bg: '#1e3a8a' },
  { name: 'Серый на белом (AA)', fg: '#595959', bg: '#ffffff' },
  { name: 'Светло-серый (Провал)', fg: '#94a3b8', bg: '#ffffff' },
  { name: 'Желтый на белом (Провал)', fg: '#facc15', bg: '#ffffff' },
  { name: 'Киберпанк неон', fg: '#06b6d4', bg: '#0f172a' },
];

function applyPreset(fg: string, bg: string) {
  textColorHex.value = fg;
  bgColorHex.value = bg;
}
</script>

<template>
  <main class="accessibility-page">
    <div class="page-container">
      <header class="page-header">
        <h1 class="page-title">Проверка доступности (Контрастность WCAG)</h1>
        <p class="page-description">
          Проверьте читаемость текста на фоне в соответствии со стандартами Web Content
          Accessibility Guidelines (WCAG 2.1).
        </p>
      </header>

      <div class="checker-layout">
        <!-- Левая колонка: Настройка цветов и готовые пресеты -->
        <section class="controls-column">
          <AppCard title="Выбор цветов для проверки">
            <!-- Цвет текста (Foreground) -->
            <div class="color-picker-row">
              <label for="fg-color" class="color-picker-label">Цвет текста (Foreground):</label>
              <div class="picker-input-group">
                <input
                  id="fg-color"
                  v-model="textColorHex"
                  type="color"
                  class="native-color-square"
                />
                <input
                  v-model="textColorHex"
                  type="text"
                  class="hex-text-input font-mono"
                  placeholder="#1E293B"
                />
              </div>
            </div>

            <!-- Кнопка поменять местами -->
            <div class="swap-row">
              <button
                type="button"
                class="btn-swap"
                title="Поменять цвет текста и фона местами"
                @click="swapColors"
              >
                ⇅ Поменять цвета местами
              </button>
            </div>

            <!-- Цвет фона (Background) -->
            <div class="color-picker-row">
              <label for="bg-color" class="color-picker-label">Цвет фона (Background):</label>
              <div class="picker-input-group">
                <input
                  id="bg-color"
                  v-model="bgColorHex"
                  type="color"
                  class="native-color-square"
                />
                <input
                  v-model="bgColorHex"
                  type="text"
                  class="hex-text-input font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </AppCard>

          <!-- Быстрые шаблоны -->
          <AppCard title="Готовые примеры">
            <div class="presets-list">
              <button
                v-for="p in presets"
                :key="p.name"
                type="button"
                class="preset-btn"
                @click="applyPreset(p.fg, p.bg)"
              >
                <span class="preset-preview">
                  <span
                    class="preset-swatch"
                    :style="{ backgroundColor: p.bg, color: p.fg }"
                  >
                    Aa
                  </span>
                </span>
                <span class="preset-name">{{ p.name }}</span>
              </button>
            </div>
          </AppCard>
        </section>

        <!-- Правая колонка: Результат расчета контраста и живой предпросмотр -->
        <section class="results-column">
          <!-- Карточка с коэффициентом и бейджами WCAG -->
          <AppCard>
            <template #header>
              <div class="ratio-header">
                <span class="ratio-label">Коэффициент контрастности</span>
                <span
                  class="rating-badge"
                  :class="{
                    'badge-success': rating.badge === 'Отлично',
                    'badge-warning': rating.badge === 'Хорошо',
                    'badge-danger': rating.badge === 'Плохо'
                  }"
                >
                  {{ rating.badge }}
                </span>
              </div>
            </template>

            <div class="ratio-display-box">
              <div class="big-ratio-number font-mono">
                {{ contrastResult.ratio }} : 1
              </div>
              <p class="ratio-description">{{ rating.text }}</p>
            </div>

            <!-- Сетка стандартов WCAG -->
            <div class="wcag-grid">
              <!-- WCAG AA Обычный текст (4.5:1) -->
              <div
                class="wcag-card"
                :class="{ 'wcag-pass': contrastResult.wcagAA, 'wcag-fail': !contrastResult.wcagAA }"
              >
                <div class="wcag-card__status">
                  {{ contrastResult.wcagAA ? '✓ Проходит' : '✕ Не проходит' }}
                </div>
                <div class="wcag-card__title">WCAG AA (Обычный текст)</div>
                <div class="wcag-card__req">Требуется минимум <strong>4.5 : 1</strong></div>
              </div>

              <!-- WCAG AAA Обычный текст (7.0:1) -->
              <div
                class="wcag-card"
                :class="{ 'wcag-pass': contrastResult.wcagAAA, 'wcag-fail': !contrastResult.wcagAAA }"
              >
                <div class="wcag-card__status">
                  {{ contrastResult.wcagAAA ? '✓ Проходит' : '✕ Не проходит' }}
                </div>
                <div class="wcag-card__title">WCAG AAA (Повышенный)</div>
                <div class="wcag-card__req">Требуется минимум <strong>7.0 : 1</strong></div>
              </div>

              <!-- WCAG AA Крупный текст (3.0:1) -->
              <div
                class="wcag-card"
                :class="{ 'wcag-pass': contrastResult.wcagAALarge, 'wcag-fail': !contrastResult.wcagAALarge }"
              >
                <div class="wcag-card__status">
                  {{ contrastResult.wcagAALarge ? '✓ Проходит' : '✕ Не проходит' }}
                </div>
                <div class="wcag-card__title">WCAG AA (Крупный шрифт)</div>
                <div class="wcag-card__req">Шрифт от 18pt (минимум <strong>3.0 : 1</strong>)</div>
              </div>
            </div>
          </AppCard>

          <!-- Живой предварительный просмотр текста и элементов интерфейса -->
          <AppCard title="Визуальный предварительный просмотр">
            <div
              class="live-preview-container"
              :style="{ backgroundColor: bgColorHex, color: textColorHex }"
            >
              <h2 class="preview-h2" :style="{ color: textColorHex }">
                Крупный заголовок H2 (Название раздела)
              </h2>
              <h3 class="preview-h3" :style="{ color: textColorHex }">
                Подзаголовок H3 (Категория контента)
              </h3>
              <p class="preview-p" :style="{ color: textColorHex }">
                Основной текст статьи или интерфейса (16px). Хороший контраст между текстом
                и фоном жизненно важен для удобства чтения, особенно для людей с нарушениями зрения,
                дальтонизмом или при ярком солнечном свете на экране смартфона.
              </p>
              <p class="preview-small" :style="{ color: textColorHex }">
                Мелкий текст сносок и метаданных (13px, примечания к лицензии).
              </p>

              <!-- Демонстрация интерактивной кнопки -->
              <div class="preview-ui-row">
                <button
                  type="button"
                  class="preview-btn"
                  :style="{ borderColor: textColorHex, color: textColorHex }"
                >
                  Кнопка действия
                </button>
                <span class="preview-badge" :style="{ borderColor: textColorHex, color: textColorHex }">
                  UI Бейдж
                </span>
              </div>
            </div>
          </AppCard>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.accessibility-page {
  padding: 2rem 1rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.page-description {
  color: #64748b;
  margin: 0.4rem 0 0;
  max-width: 750px;
}

.checker-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .checker-layout {
    grid-template-columns: 1fr;
  }
}

.controls-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.color-picker-row {
  margin-bottom: 1rem;
}

.color-picker-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.picker-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.native-color-square {
  width: 44px;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  background: none;
}

.hex-text-input {
  flex: 1;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}

.hex-text-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.swap-row {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0;
}

.btn-swap {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.825rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-swap:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.preset-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preset-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

.results-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ratio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ratio-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.rating-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.badge-success {
  background: #dcfce7;
  color: #15803d;
}

.badge-warning {
  background: #fef9c3;
  color: #a16207;
}

.badge-danger {
  background: #fee2e2;
  color: #b91c1c;
}

.ratio-display-box {
  text-align: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 1.5rem;
}

.big-ratio-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.ratio-description {
  font-size: 0.95rem;
  color: #475569;
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.wcag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.wcag-card {
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.wcag-pass {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.wcag-fail {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.wcag-card__status {
  font-size: 0.85rem;
  font-weight: 700;
}

.wcag-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.wcag-card__req {
  font-size: 0.8rem;
  color: #64748b;
}

.live-preview-container {
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.preview-h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.preview-h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.preview-p {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 0.75rem;
}

.preview-small {
  font-size: 0.8125rem;
  opacity: 0.85;
  margin: 0 0 1.25rem;
}

.preview-ui-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.preview-btn {
  background: transparent;
  border: 2px solid;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}

.preview-badge {
  border: 1px solid;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
