<script setup lang="ts">
/**
 * @file DashboardView.vue
 * @description Главная страница/Панель управления: обзор сохраненных палитр,
 * поиск и фильтрация, быстрые действия, отображение состояний загрузки, ошибок и пустоты.
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePalettes } from '../composables/usePalettes';
import { filterPalettesBySearch, calculatePaletteAverageLuminance } from '../utils/palette';
import AppCard from '../components/AppCard.vue';
import type { ColorPalette } from '../types';

const router = useRouter();
const { palettes, state, fetchPalettes, deletePalette, createPalette } = usePalettes();

const searchQuery = ref('');

// Загрузка данных при монтировании
onMounted(() => {
  if (palettes.value.length === 0) {
    fetchPalettes();
  }
});

// Вычисляемое свойство: отфильтрованные палитры с использованием чистой функции filterPalettesBySearch
const filteredPalettes = computed(() => {
  return filterPalettesBySearch(palettes.value, searchQuery.value);
});

// Переход к созданию новой палитры
function handleCreateNew() {
  router.push('/editor');
}

// Переход к редактированию палитры
function handleEdit(id: string) {
  router.push(`/editor/${id}`);
}

// Удаление палитры
async function handleDelete(palette: ColorPalette) {
  if (confirm(`Вы действительно хотите удалить палитру "${palette.title}"?`)) {
    await deletePalette(palette.id);
  }
}

// Дублирование палитры
async function handleDuplicate(palette: ColorPalette) {
  await createPalette({
    title: `${palette.title} (Копия)`,
    description: palette.description,
    colors: [...palette.colors],
  });
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
</script>

<template>
  <main class="dashboard-page">
    <div class="page-container">
      <!-- Заголовок страницы и действия -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Панель управления палитрами</h1>
          <p class="page-description">
            Создание, редактирование и анализ цветовых схем для веб-приложений.
          </p>
        </div>
        <button type="button" class="btn-primary" @click="handleCreateNew">
          <span class="btn-icon">+</span> Создать палитру
        </button>
      </header>

      <!-- Сообщение об ошибке или автономном режиме -->
      <div v-if="state.error" class="alert-box alert-warning">
        <span class="alert-icon">⚠️</span>
        <div class="alert-content">
          <strong>Внимание:</strong> {{ state.error }}
          <button type="button" class="btn-link" @click="fetchPalettes">
            Повторить попытку подключения
          </button>
        </div>
      </div>

      <!-- Панель поиска и статистика -->
      <section class="controls-bar">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Поиск по названию или описанию палитры..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-btn"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
        <div class="stats-badge">
          Всего палитр: <strong>{{ filteredPalettes.length }}</strong>
          <span v-if="searchQuery" class="stats-filter-note">
            (из {{ palettes.length }})
          </span>
        </div>
      </section>

      <!-- Состояние загрузки (Spinner) -->
      <div v-if="state.loading && palettes.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка палитр из базы данных...</p>
      </div>

      <!-- Пустое состояние (Empty state) -->
      <div
        v-else-if="filteredPalettes.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">🎨</div>
        <h3 class="empty-title">
          {{ searchQuery ? 'Ничего не найдено' : 'Палитр пока нет' }}
        </h3>
        <p class="empty-text">
          {{
            searchQuery
              ? `По запросу "${searchQuery}" палитр не обнаружено.`
              : 'Создайте свою первую цветовую схему в удобном визуальном редакторе!'
          }}
        </p>
        <button
          v-if="searchQuery"
          type="button"
          class="btn-secondary"
          @click="searchQuery = ''"
        >
          Сбросить фильтр
        </button>
        <button
          v-else
          type="button"
          class="btn-primary"
          @click="handleCreateNew"
        >
          Создать палитру
        </button>
      </div>

      <!-- Сетка карточек сохраненных палитр (демонстрация AppCard со слотами) -->
      <div v-else class="palettes-grid">
        <AppCard
          v-for="palette in filteredPalettes"
          :key="palette.id"
          hoverable
        >
          <!-- Слот заголовка карточки #header -->
          <template #header>
            <div class="palette-card-header">
              <h2 class="palette-card-title">{{ palette.title }}</h2>
              <span class="luminance-badge" title="Средняя относительная яркость">
                Яркость: {{ Math.round(calculatePaletteAverageLuminance(palette) * 100) }}%
              </span>
            </div>
          </template>

          <!-- Слот дополнительной информации в шапке #extra -->
          <template #extra>
            <span class="date-text">{{ formatDate(palette.createdAt) }}</span>
          </template>

          <!-- Основное тело карточки: описание и предпросмотр цветов -->
          <div class="palette-body">
            <p v-if="palette.description" class="palette-desc">
              {{ palette.description }}
            </p>

            <!-- Лента цветов -->
            <div class="palette-swatches-strip">
              <div
                v-for="col in palette.colors"
                :key="col.id"
                class="swatch-strip-item"
                :style="{ backgroundColor: col.hex }"
                :title="`${col.name || ''} (${col.hex.toUpperCase()})`"
              >
                <span class="swatch-label">{{ col.hex.toUpperCase() }}</span>
              </div>
            </div>

            <div class="palette-meta-info">
              Количество цветов: <strong>{{ palette.colors.length }}</strong>
            </div>
          </div>

          <!-- Слот подвала #footer с действиями -->
          <template #footer>
            <button
              type="button"
              class="btn-icon-action"
              title="Дублировать палитру"
              @click="handleDuplicate(palette)"
            >
              📋 Копия
            </button>
            <button
              type="button"
              class="btn-icon-action btn-danger"
              title="Удалить палитру"
              @click="handleDelete(palette)"
            >
              🗑️ Удалить
            </button>
            <button
              type="button"
              class="btn-secondary"
              @click="handleEdit(palette.id)"
            >
              ✏️ Редактировать
            </button>
          </template>
        </AppCard>
      </div>
    </div>
  </main>
</template>

<style scoped>
.dashboard-page {
  padding: 2rem 1rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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
  font-size: 1rem;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.2rem 0.65rem 2.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  background: #ffffff;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
}

.stats-badge {
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
}

.stats-filter-note {
  color: #94a3b8;
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .palettes-grid {
    grid-template-columns: 1fr;
  }
}

.palette-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.palette-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}

.luminance-badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.date-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.palette-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palette-desc {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.4;
  min-height: 2.8em;
}

.palette-swatches-strip {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.swatch-strip-item {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.35rem;
  transition: flex 0.2s ease;
}

.swatch-strip-item:hover {
  flex: 1.5;
}

.swatch-label {
  font-size: 0.65rem;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.swatch-strip-item:hover .swatch-label {
  opacity: 1;
}

.palette-meta-info {
  font-size: 0.825rem;
  color: #64748b;
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
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-icon-action {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  font-size: 0.825rem;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s ease;
}

.btn-icon-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-warning {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-text {
  color: #64748b;
  margin: 0 0 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
