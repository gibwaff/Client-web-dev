<script setup lang="ts">
/**
 * @file PaletteEditorView.vue
 * @description Редактор палитры: создание новой и изменение существующей.
 * Демонстрирует работу с формами, валидацию, добавление/удаление цветов,
 * преобразование форматов HEX/RGB/HSL и сохранение через json-server.
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePalettes } from '../composables/usePalettes';
import ColorInput from '../components/ColorInput.vue';
import ColorCard from '../components/ColorCard.vue';
import AppCard from '../components/AppCard.vue';
import type { Color, ColorPalette } from '../types';
import {
  createNewPalette,
  updateColorInPalette,
  addColorToPalette,
  removeColorFromPalette,
  reorderColorsInPalette,
} from '../utils/palette';

const route = useRoute();
const router = useRouter();
const { palettes, fetchPalettes, createPalette, savePalette, state } = usePalettes();

// ID редактируемой палитры из URL параметров (если передан)
const paletteId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!paletteId.value);

// Локальное редактируемое состояние палитры
const palette = ref<ColorPalette>(createNewPalette('', ''));

// Ошибки формы
const titleError = ref<string | null>(null);
const generalError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

onMounted(async () => {
  if (palettes.value.length === 0) {
    await fetchPalettes();
  }

  if (isEditing.value && paletteId.value) {
    const existing = palettes.value.find((p) => String(p.id) === String(paletteId.value));
    if (existing) {
      palette.value = {
        ...existing,
        colors: [...existing.colors],
      };
    } else {
      generalError.value = `Палитра с ID "${paletteId.value}" не найдена. Создается новая палитра.`;
    }
  }
});

// Добавление нового цвета в палитру через чистую функцию addColorToPalette
function handleAddColor(color: Color) {
  palette.value = addColorToPalette(palette.value, color);
}

// Удаление цвета из палитры через чистую функцию removeColorFromPalette
function handleRemoveColor(colorId: string) {
  if (palette.value.colors.length <= 1) {
    alert('Палитра должна содержать хотя бы один цвет!');
    return;
  }
  palette.value = removeColorFromPalette(palette.value, colorId);
}

// Перемещение цвета вверх
function moveColorUp(index: number) {
  if (index > 0) {
    palette.value = reorderColorsInPalette(palette.value, index, index - 1);
  }
}

// Перемещение цвета вниз
function moveColorDown(index: number) {
  if (index < palette.value.colors.length - 1) {
    palette.value = reorderColorsInPalette(palette.value, index, index + 1);
  }
}

// Валидация и сохранение всей палитры
async function handleSave() {
  titleError.value = null;
  generalError.value = null;
  successMessage.value = null;

  if (!palette.value.title || palette.value.title.trim().length === 0) {
    titleError.value = 'Пожалуйста, укажите название палитры';
    return;
  }

  if (palette.value.colors.length === 0) {
    generalError.value = 'Добавьте хотя бы один цвет в палитру';
    return;
  }

  try {
    if (isEditing.value) {
      await savePalette(palette.value);
      successMessage.value = 'Палитра успешно сохранена!';
    } else {
      const created = await createPalette({
        title: palette.value.title,
        description: palette.value.description,
        colors: palette.value.colors,
      });
      successMessage.value = 'Новая палитра успешно создана!';
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  } catch (e: any) {
    generalError.value = 'Не удалось сохранить палитру: ' + (e.message || 'Ошибка сети');
  }
}
</script>

<template>
  <main class="editor-page">
    <div class="page-container">
      <!-- Навигация назад и заголовок -->
      <div class="editor-nav">
        <button type="button" class="btn-back" @click="router.push('/')">
          ← К списку палитр
        </button>
        <span class="editor-mode-badge">
          {{ isEditing ? 'Режим редактирования' : 'Создание новой палитры' }}
        </span>
      </div>

      <header class="page-header">
        <h1 class="page-title">
          {{ isEditing ? `Редактирование: ${palette.title}` : 'Новая цветовая палитра' }}
        </h1>
        <p class="page-description">
          Настройте цвета с помощью точных координат RGB, HSL или кодов HEX.
        </p>
      </header>

      <!-- Уведомления об успехе или ошибке -->
      <div v-if="successMessage" class="alert-box alert-success">
        ✓ {{ successMessage }}
      </div>
      <div v-if="generalError" class="alert-box alert-error">
        ⚠️ {{ generalError }}
      </div>

      <div class="editor-layout">
        <!-- Левая колонка: Основные метаданные и добавление цвета -->
        <section class="editor-sidebar">
          <AppCard title="Параметры палитры">
            <div class="form-group">
              <label for="palette-title" class="field-label">Название палитры *</label>
              <input
                id="palette-title"
                v-model="palette.title"
                type="text"
                placeholder="Например: Неоновый закат"
                class="text-input"
                :class="{ 'input--invalid': titleError }"
              />
              <p v-if="titleError" class="validation-message error-text">
                {{ titleError }}
              </p>
            </div>

            <div class="form-group">
              <label for="palette-desc" class="field-label">Описание (опционально)</label>
              <textarea
                id="palette-desc"
                v-model="palette.description"
                placeholder="Кратко опишите назначение или тему палитры..."
                class="text-input textarea-input"
                rows="3"
              />
            </div>
          </AppCard>

          <AppCard title="Добавить цвет">
            <p class="helper-text">
              Выберите цвет или задайте точные значения в любом формате:
            </p>
            <ColorInput
              initial-hex="#6366f1"
              submit-button-text="Добавить в палитру"
              @color-submit="handleAddColor"
            />
          </AppCard>
        </section>

        <!-- Правая колонка: Список цветов палитры и предпросмотр -->
        <section class="editor-content">
          <AppCard>
            <template #header>
              <div class="colors-header">
                <h2 class="section-title">Цвета в палитре ({{ palette.colors.length }})</h2>
                <span class="hint-order">Вы можете менять порядок и удалять цвета</span>
              </div>
            </template>

            <!-- Предпросмотр градиентной ленты палитры -->
            <div v-if="palette.colors.length > 0" class="palette-preview-strip">
              <div
                v-for="c in palette.colors"
                :key="c.id"
                class="strip-item"
                :style="{ backgroundColor: c.hex }"
                :title="`${c.name || ''} (${c.hex})`"
              />
            </div>

            <!-- Список карточек цветов -->
            <div v-if="palette.colors.length === 0" class="no-colors-box">
              <p>В этой палитре пока нет цветов. Добавьте цвет из формы слева!</p>
            </div>

            <div v-else class="colors-list-grid">
              <div
                v-for="(col, index) in palette.colors"
                :key="col.id"
                class="color-item-wrapper"
              >
                <div class="order-controls">
                  <button
                    type="button"
                    class="btn-arrow"
                    :disabled="index === 0"
                    title="Переместить левее"
                    @click="moveColorUp(index)"
                  >
                    ◀
                  </button>
                  <span class="index-num">#{{ index + 1 }}</span>
                  <button
                    type="button"
                    class="btn-arrow"
                    :disabled="index === palette.colors.length - 1"
                    title="Переместить правее"
                    @click="moveColorDown(index)"
                  >
                    ▶
                  </button>
                </div>

                <ColorCard
                  :color="col"
                  removable
                  @remove="handleRemoveColor"
                />
              </div>
            </div>

            <template #footer>
              <button
                type="button"
                class="btn-secondary"
                @click="router.push('/')"
              >
                Отмена
              </button>
              <button
                type="button"
                class="btn-primary"
                :disabled="state.loading"
                @click="handleSave"
              >
                <span v-if="state.loading" class="spinner-small"></span>
                💾 {{ isEditing ? 'Сохранить изменения' : 'Создать палитру' }}
              </button>
            </template>
          </AppCard>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.editor-page {
  padding: 2rem 1rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.editor-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-back {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0;
  font-size: 0.95rem;
}

.btn-back:hover {
  text-decoration: underline;
}

.editor-mode-badge {
  font-size: 0.8rem;
  font-weight: 600;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #bfdbfe;
}

.page-header {
  margin-bottom: 1.5rem;
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
}

.editor-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 960px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.text-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.text-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.textarea-input {
  resize: vertical;
}

.input--invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.validation-message {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}

.error-text {
  color: #ef4444;
}

.helper-text {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1rem;
}

.colors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.hint-order {
  font-size: 0.8rem;
  color: #94a3b8;
}

.palette-preview-strip {
  display: flex;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.strip-item {
  flex: 1;
}

.colors-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.color-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.order-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.25rem;
}

.btn-arrow {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.index-num {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.no-colors-box {
  padding: 3rem 1rem;
  text-align: center;
  color: #94a3b8;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
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

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.925rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
