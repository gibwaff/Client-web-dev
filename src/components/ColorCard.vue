<script setup lang="ts">
/**
 * @file ColorCard.vue
 * @description Компонент карточки отдельного цвета.
 * 
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ VUE В ЭТОМ ФАЙЛЕ:
 * 1. defineProps — объявление входных параметров, которые родитель передает в карточку.
 * 2. defineEmits — объявление событий, которые карточка испускает наверх родителю.
 * 3. computed — вычисляемое свойство (кэширует расчет контрастного цвета надписи).
 * 4. Слоты (Slots) — слот #actions позволяет родителю вставить свои кнопки в карточку.
 */
import { ref, computed } from 'vue';
import type { Color } from '../types';
import { getLuminance } from '../utils/contrast';

/**
 * Описание входных параметров (Props)
 */
interface Props {
  color: Color;             // Объект цвета (обязательный параметр)
  removable?: boolean;      // Показывать ли крестик удаления (по умолчанию false)
  selectable?: boolean;     // Можно ли кликнуть на карточку для выбора
}

// withDefaults задает значения по умолчанию для необязательных props
const props = withDefaults(defineProps<Props>(), {
  removable: false,
  selectable: false,
});

/**
 * Описание событий (Emits), которые компонент может генерировать:
 * - 'remove': отправляет ID цвета при удалении
 * - 'select': отправляет весь объект цвета при клике
 */
const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'select', color: Color): void;
}>();

// Локальное реактивное состояние для плашки «Скопировано!»
const copiedField = ref<string | null>(null);

/**
 * ВЫЧИСЛЯЕМОЕ СВОЙСТВО (COMPUTED PROPERTY):
 * 
 * ЗАЧЕМ НУЖНО:
 * Название цвета пишется прямо поверх цветной плашки.
 * Если плашка светлая (желтая, белая) — текст должен быть темным (#0f172a).
 * Если плашка темная (синяя, черная) — текст должен быть белым (#ffffff).
 * 
 * ПОЧЕМУ COMPUTED, А НЕ ОБЫЧНАЯ ФУНКЦИЯ:
 * computed кэширует свой результат и пересчитывается ТОЛЬКО тогда,
 * когда меняется цвет в props.color.
 */
const textContrastColor = computed(() => {
  const lum = getLuminance(props.color.rgb);
  // Порог 0.4: если яркость выше 40% — пишем темным шрифтом, иначе белым
  return lum > 0.4 ? '#0f172a' : '#ffffff';
});

/**
 * Копирование HEX, RGB или HSL кода в буфер обмена операционной системы
 * через стандартный браузерный API navigator.clipboard.
 */
async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = label;
    // Через 1.5 секунды убираем бейдж «Скопировано!»
    setTimeout(() => {
      copiedField.value = null;
    }, 1500);
  } catch (err) {
    console.error('Ошибка доступа к буферу обмена:', err);
  }
}
</script>

<template>
  <div
    class="color-card"
    :class="{ 'color-card--selectable': selectable }"
    @click="selectable && emit('select', color)"
  >
    <!-- Плашка цвета с динамическим стилем фона и цвета текста -->
    <div
      class="color-card__swatch"
      :style="{ backgroundColor: color.hex, color: textContrastColor }"
    >
      <span class="color-card__name">{{ color.name || color.hex }}</span>
      <span v-if="copiedField" class="color-card__copied-badge">
        {{ copiedField }} скопирован!
      </span>
    </div>

    <!-- Блок значений: HEX, RGB, HSL с кнопками быстрого копирования -->
    <div class="color-card__values">
      <!-- @click.stop предотвращает всплытие события (event bubbling), чтобы не сработал клик по всей карточке -->
      <button
        type="button"
        class="value-chip"
        title="Нажмите, чтобы скопировать HEX"
        @click.stop="copyToClipboard(color.hex, 'HEX')"
      >
        <span class="value-chip__label">HEX</span>
        <span class="value-chip__text">{{ color.hex.toUpperCase() }}</span>
      </button>

      <button
        type="button"
        class="value-chip"
        title="Нажмите, чтобы скопировать RGB"
        @click.stop="copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, 'RGB')"
      >
        <span class="value-chip__label">RGB</span>
        <span class="value-chip__text">{{ color.rgb.r }}, {{ color.rgb.g }}, {{ color.rgb.b }}</span>
      </button>

      <button
        type="button"
        class="value-chip"
        title="Нажмите, чтобы скопировать HSL"
        @click.stop="copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, 'HSL')"
      >
        <span class="value-chip__label">HSL</span>
        <span class="value-chip__text">{{ color.hsl.h }}°, {{ color.hsl.s }}%, {{ color.hsl.l }}%</span>
      </button>
    </div>

    <!-- Кнопка удаления или кастомные действия через слот -->
    <div v-if="removable || $slots.actions" class="color-card__actions">
      <!-- Именованный слот #actions: если родитель передал свои кнопки — рендерятся они, иначе крестик -->
      <slot name="actions">
        <button
          v-if="removable"
          type="button"
          class="btn-remove"
          title="Удалить цвет"
          aria-label="Удалить цвет"
          @click.stop="emit('remove', color.id)"
        >
          ✕
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.color-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-card--selectable {
  cursor: pointer;
}

.color-card--selectable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.color-card__swatch {
  height: 90px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.color-card__name {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  word-break: break-all;
  max-width: 85%;
}

.color-card__copied-badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(15, 23, 42, 0.85);
  color: #ffffff;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.color-card__values {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: #f8fafc;
}

.value-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.value-chip:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.value-chip__label {
  font-weight: 700;
  color: #64748b;
  font-size: 0.7rem;
}

.value-chip__text {
  color: #0f172a;
}

.color-card__actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.btn-remove {
  background: rgba(255, 255, 255, 0.85);
  color: #ef4444;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background 0.15s ease, transform 0.15s ease;
}

.btn-remove:hover {
  background: #ef4444;
  color: #ffffff;
  transform: scale(1.1);
}
</style>
