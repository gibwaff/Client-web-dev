<script setup lang="ts">
/**
 * @file ColorInput.vue
 * @description Интерактивный редактор цвета с мгновенной взаимной синхронизацией
 * форматов HEX, RGB и HSL. Содержит валидацию диапазонов координат и ползунки.
 */
import { ref, watch } from 'vue';
import type { Color, RGB, HSL } from '../types';
import {
  createColorFromHex,
  createColorFromRgb,
  createColorFromHsl,
  isValidHex,
  validateHex,
  validateRgb,
  validateHsl,
} from '../utils/color';

interface Props {
  initialHex?: string;
  submitButtonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialHex: '#3b82f6',
  submitButtonText: 'Добавить цвет в палитру',
});

const emit = defineEmits<{
  (e: 'color-submit', color: Color): void;
  (e: 'change', color: Color): void;
}>();

// Активная вкладка управления (HEX, RGB, HSL)
const activeTab = ref<'hex' | 'rgb' | 'hsl'>('hex');

// Локальное состояние полей
const hexValue = ref<string>(props.initialHex);
const colorName = ref<string>('');

const rgbValue = ref<RGB>({ r: 59, g: 130, b: 246 });
const hslValue = ref<HSL>({ h: 217, s: 91, l: 60 });

// Текущий скомпилированный объект цвета
const currentColor = ref<Color>(createColorFromHex(props.initialHex));

// Ошибки валидации
const hexError = ref<string | null>(null);
const rgbError = ref<string | null>(null);
const hslError = ref<string | null>(null);

// Инициализация при монтировании
syncFromHex(props.initialHex);

/**
 * Синхронизирует все представления из HEX
 */
function syncFromHex(hex: string) {
  const val = validateHex(hex);
  if (!val.isValid) {
    hexError.value = val.error || 'Неверный HEX';
    return;
  }
  hexError.value = null;
  const col = createColorFromHex(hex, colorName.value || undefined);
  currentColor.value = col;
  rgbValue.value = { ...col.rgb };
  hslValue.value = { ...col.hsl };
  rgbError.value = null;
  hslError.value = null;
  emit('change', col);
}

/**
 * Синхронизирует все представления из RGB
 */
function syncFromRgb() {
  const val = validateRgb(rgbValue.value);
  if (!val.isValid) {
    rgbError.value = val.error || 'Неверный RGB';
    return;
  }
  rgbError.value = null;
  const col = createColorFromRgb(rgbValue.value, colorName.value || undefined);
  currentColor.value = col;
  hexValue.value = col.hex;
  hslValue.value = { ...col.hsl };
  hexError.value = null;
  hslError.value = null;
  emit('change', col);
}

/**
 * Синхронизирует все представления из HSL
 */
function syncFromHsl() {
  const val = validateHsl(hslValue.value);
  if (!val.isValid) {
    hslError.value = val.error || 'Неверный HSL';
    return;
  }
  hslError.value = null;
  const col = createColorFromHsl(hslValue.value, colorName.value || undefined);
  currentColor.value = col;
  hexValue.value = col.hex;
  rgbValue.value = { ...col.rgb };
  hexError.value = null;
  rgbError.value = null;
  emit('change', col);
}

// Обработка нативного color-picker
function onNativeColorPick(e: Event) {
  const target = e.target as HTMLInputElement;
  hexValue.value = target.value;
  syncFromHex(target.value);
}

// Отправка готового цвета
function handleSubmit() {
  if (hexError.value || rgbError.value || hslError.value) {
    return;
  }
  const colorToSubmit: Color = {
    ...currentColor.value,
    name: colorName.value.trim() || currentColor.value.name,
  };
  emit('color-submit', colorToSubmit);
  // Сброс имени после добавления
  colorName.value = '';
}

watch(
  () => props.initialHex,
  (newHex) => {
    if (newHex && isValidHex(newHex)) {
      hexValue.value = newHex;
      syncFromHex(newHex);
    }
  }
);
</script>

<template>
  <div class="color-input-widget">
    <!-- Верхняя панель: предварительный просмотр и нативный выбор цвета -->
    <div class="color-input-widget__preview-bar">
      <div class="swatch-wrapper">
        <div
          class="color-preview-box"
          :style="{ backgroundColor: currentColor.hex }"
        />
        <label class="native-picker-label" title="Открыть системную палитру">
          <input
            type="color"
            :value="currentColor.hex"
            class="native-picker-input"
            @input="onNativeColorPick"
          />
          🎨 Выбрать пипеткой
        </label>
      </div>

      <div class="name-input-group">
        <label for="color-name-field" class="field-label">Название цвета (опционально):</label>
        <input
          id="color-name-field"
          v-model="colorName"
          type="text"
          placeholder="Например: Изумрудный рассвет"
          class="text-input"
        />
      </div>
    </div>

    <!-- Вкладки форматов ввода -->
    <div class="tabs-nav">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'hex' }"
        @click="activeTab = 'hex'"
      >
        HEX
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'rgb' }"
        @click="activeTab = 'rgb'"
      >
        RGB (0-255)
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'hsl' }"
        @click="activeTab = 'hsl'"
      >
        HSL (360°, 100%, 100%)
      </button>
    </div>

    <!-- Контент вкладки HEX -->
    <div v-if="activeTab === 'hex'" class="tab-content">
      <div class="form-group">
        <label for="hex-field" class="field-label">Шестнадцатеричный код (HEX):</label>
        <input
          id="hex-field"
          v-model="hexValue"
          type="text"
          placeholder="#3B82F6"
          class="text-input font-mono"
          :class="{ 'input--invalid': hexError }"
          @input="syncFromHex(hexValue)"
        />
        <p v-if="hexError" class="validation-message error-text">{{ hexError }}</p>
        <p v-else class="hint-text">Поддерживаются форматы #RGB и #RRGGBB</p>
      </div>
    </div>

    <!-- Контент вкладки RGB -->
    <div v-if="activeTab === 'rgb'" class="tab-content">
      <div class="sliders-grid">
        <!-- Red -->
        <div class="slider-row">
          <label class="slider-label" style="color: #ef4444;">
            R (Красный): {{ rgbValue.r }}
          </label>
          <input
            v-model.number="rgbValue.r"
            type="range"
            min="0"
            max="255"
            class="slider-control"
            @input="syncFromRgb"
          />
          <input
            v-model.number="rgbValue.r"
            type="number"
            min="0"
            max="255"
            class="number-input font-mono"
            @input="syncFromRgb"
          />
        </div>

        <!-- Green -->
        <div class="slider-row">
          <label class="slider-label" style="color: #10b981;">
            G (Зеленый): {{ rgbValue.g }}
          </label>
          <input
            v-model.number="rgbValue.g"
            type="range"
            min="0"
            max="255"
            class="slider-control"
            @input="syncFromRgb"
          />
          <input
            v-model.number="rgbValue.g"
            type="number"
            min="0"
            max="255"
            class="number-input font-mono"
            @input="syncFromRgb"
          />
        </div>

        <!-- Blue -->
        <div class="slider-row">
          <label class="slider-label" style="color: #3b82f6;">
            B (Синий): {{ rgbValue.b }}
          </label>
          <input
            v-model.number="rgbValue.b"
            type="range"
            min="0"
            max="255"
            class="slider-control"
            @input="syncFromRgb"
          />
          <input
            v-model.number="rgbValue.b"
            type="number"
            min="0"
            max="255"
            class="number-input font-mono"
            @input="syncFromRgb"
          />
        </div>
      </div>
      <p v-if="rgbError" class="validation-message error-text">{{ rgbError }}</p>
    </div>

    <!-- Контент вкладки HSL -->
    <div v-if="activeTab === 'hsl'" class="tab-content">
      <div class="sliders-grid">
        <!-- Hue -->
        <div class="slider-row">
          <label class="slider-label">
            H (Цветовой тон): {{ hslValue.h }}°
          </label>
          <input
            v-model.number="hslValue.h"
            type="range"
            min="0"
            max="360"
            class="slider-control hue-slider"
            @input="syncFromHsl"
          />
          <input
            v-model.number="hslValue.h"
            type="number"
            min="0"
            max="360"
            class="number-input font-mono"
            @input="syncFromHsl"
          />
        </div>

        <!-- Saturation -->
        <div class="slider-row">
          <label class="slider-label">
            S (Насыщенность): {{ hslValue.s }}%
          </label>
          <input
            v-model.number="hslValue.s"
            type="range"
            min="0"
            max="100"
            class="slider-control"
            @input="syncFromHsl"
          />
          <input
            v-model.number="hslValue.s"
            type="number"
            min="0"
            max="100"
            class="number-input font-mono"
            @input="syncFromHsl"
          />
        </div>

        <!-- Lightness -->
        <div class="slider-row">
          <label class="slider-label">
            L (Светлота): {{ hslValue.l }}%
          </label>
          <input
            v-model.number="hslValue.l"
            type="range"
            min="0"
            max="100"
            class="slider-control"
            @input="syncFromHsl"
          />
          <input
            v-model.number="hslValue.l"
            type="number"
            min="0"
            max="100"
            class="number-input font-mono"
            @input="syncFromHsl"
          />
        </div>
      </div>
      <p v-if="hslError" class="validation-message error-text">{{ hslError }}</p>
    </div>

    <!-- Кнопка добавления -->
    <div class="widget-footer">
      <button
        type="button"
        class="submit-color-btn"
        :disabled="!!(hexError || rgbError || hslError)"
        @click="handleSubmit"
      >
        <span>+</span> {{ submitButtonText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.color-input-widget {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.color-input-widget__preview-bar {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.swatch-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-preview-box {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: background-color 0.15s ease;
}

.native-picker-label {
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}

.native-picker-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
}

.name-input-group {
  flex: 1;
  min-width: 200px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.35rem;
}

.text-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.text-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input--invalid {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #1e293b;
}

.tab-btn--active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-content {
  padding: 0.5rem 0;
}

.sliders-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.slider-row {
  display: grid;
  grid-template-columns: 140px 1fr 70px;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .slider-row {
    grid-template-columns: 1fr auto;
  }
  .slider-row .slider-label {
    grid-column: 1 / -1;
  }
}

.slider-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.slider-control {
  width: 100%;
  accent-color: #3b82f6;
  cursor: pointer;
}

.hue-slider {
  accent-color: #8b5cf6;
}

.number-input {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
}

.validation-message {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}

.error-text {
  color: #ef4444;
}

.hint-text {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.widget-footer {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
}

.submit-color-btn {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.15s ease, transform 0.1s ease;
}

.submit-color-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.submit-color-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
