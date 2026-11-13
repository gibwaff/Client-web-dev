<script setup lang="ts">
/**
 * @file HarmoniesView.vue
 * @description Страница создания и изучения цветовых гармоний:
 * расчет комплементарных, аналогичных, триадных и тетрадных схем по выбранному базовому цвету.
 * Позволяет одним кликом сохранить любую гармонию как самостоятельную палитру в json-server.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePalettes } from '../composables/usePalettes';
import ColorInput from '../components/ColorInput.vue';
import ColorCard from '../components/ColorCard.vue';
import AppCard from '../components/AppCard.vue';
import type { Color, ColorHarmony } from '../types';
import { createColorFromHex } from '../utils/color';
import { getAllHarmonies } from '../utils/harmonies';

const router = useRouter();
const { createPalette } = usePalettes();

// Базовый цвет для генерации схем
const baseColor = ref<Color>(createColorFromHex('#3b82f6', 'Базовый цвет'));
const savingHarmonyType = ref<string | null>(null);
const successNotification = ref<string | null>(null);

// Вычисляемое свойство: список всех гармоний для базового цвета
const harmonies = computed<ColorHarmony[]>(() => {
  return getAllHarmonies(baseColor.value);
});

// Обновление базового цвета при изменении в ColorInput
function handleBaseColorChange(newColor: Color) {
  baseColor.value = newColor;
}

// Сохранение гармонии как новой палитры
async function handleSaveAsPalette(harmony: ColorHarmony) {
  savingHarmonyType.value = harmony.type;
  try {
    const created = await createPalette({
      title: `${harmony.title} для ${baseColor.value.hex.toUpperCase()}`,
      description: harmony.description,
      colors: [...harmony.colors],
    });
    successNotification.value = `Палитра "${created.title}" успешно создана и сохранена!`;
    setTimeout(() => {
      successNotification.value = null;
    }, 4000);
  } catch (err) {
    console.error('Ошибка сохранения палитры гармонии:', err);
  } finally {
    savingHarmonyType.value = null;
  }
}
</script>

<template>
  <main class="harmonies-page">
    <div class="page-container">
      <header class="page-header">
        <h1 class="page-title">Цветовые гармонии</h1>
        <p class="page-description">
          Изучайте и создавайте сбалансированные цветовые комбинации на основе теории цвета.
          Выберите базовый оттенок — система автоматически рассчитает правила гармонии.
        </p>
      </header>

      <!-- Уведомление об успешном создании палитры -->
      <div v-if="successNotification" class="alert-box alert-success">
        ✓ {{ successNotification }}
        <button
          type="button"
          class="btn-link"
          @click="router.push('/')"
        >
          Перейти на главную панель →
        </button>
      </div>

      <div class="harmonies-layout">
        <!-- Левая панель: выбор базового цвета -->
        <aside class="base-color-sidebar">
          <AppCard title="Базовый цвет">
            <template #extra>
              <div
                class="base-swatch-badge"
                :style="{ backgroundColor: baseColor.hex }"
              />
            </template>
            <p class="helper-text">
              Измените цвет, чтобы мгновенно пересчитать все гармонии:
            </p>
            <ColorInput
              :initial-hex="baseColor.hex"
              submit-button-text="Применить цвет"
              @change="handleBaseColorChange"
              @color-submit="handleBaseColorChange"
            />
          </AppCard>

          <AppCard title="О теории цвета">
            <ul class="theory-list">
              <li>
                <strong>Комплементарная:</strong> Цвета с противоположных сторон круга (180°). Высокая контрастность и динамика.
              </li>
              <li>
                <strong>Аналогичная:</strong> Соседние оттенки (±30°). Естественность, гармония и спокойствие в интерфейсе.
              </li>
              <li>
                <strong>Триадная:</strong> Равносторонний треугольник (120°). Баланс контраста и богатства палитры.
              </li>
              <li>
                <strong>Тетрадная:</strong> Четыре цвета (90°). Максимальное разнообразие оттенков.
              </li>
            </ul>
          </AppCard>
        </aside>

        <!-- Правая область: сгенерированные гармонии -->
        <section class="harmonies-list">
          <div
            v-for="harmony in harmonies"
            :key="harmony.type"
            class="harmony-card-wrapper"
          >
            <AppCard>
              <template #header>
                <div class="harmony-header">
                  <div>
                    <h2 class="harmony-title">{{ harmony.title }}</h2>
                    <p class="harmony-desc">{{ harmony.description }}</p>
                  </div>
                  <button
                    type="button"
                    class="btn-save-scheme"
                    :disabled="savingHarmonyType === harmony.type"
                    @click="handleSaveAsPalette(harmony)"
                  >
                    💾 Сохранить как палитру
                  </button>
                </div>
              </template>

              <!-- Цветовая лента схемы -->
              <div class="scheme-strip">
                <div
                  v-for="color in harmony.colors"
                  :key="color.id"
                  class="scheme-strip__item"
                  :style="{ backgroundColor: color.hex }"
                >
                  <span class="scheme-strip__code">{{ color.hex.toUpperCase() }}</span>
                </div>
              </div>

              <!-- Карточки цветов с деталями -->
              <div class="harmony-colors-grid">
                <ColorCard
                  v-for="color in harmony.colors"
                  :key="color.id"
                  :color="color"
                />
              </div>
            </AppCard>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.harmonies-page {
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
  max-width: 700px;
}

.harmonies-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 960px) {
  .harmonies-layout {
    grid-template-columns: 1fr;
  }
}

.base-color-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.base-swatch-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.helper-text {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1rem;
}

.theory-list {
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #475569;
}

.theory-list li strong {
  color: #1e293b;
}

.harmonies-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.harmony-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.harmony-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.harmony-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.scheme-strip {
  display: flex;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.scheme-strip__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scheme-strip__code {
  font-size: 0.75rem;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.harmony-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
}

.btn-save-scheme {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-save-scheme:hover:not(:disabled) {
  background: #2563eb;
  color: #ffffff;
}

.btn-save-scheme:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert-box {
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  margin-left: 0.75rem;
}
</style>
