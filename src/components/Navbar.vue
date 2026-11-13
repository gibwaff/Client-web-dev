<script setup lang="ts">
/**
 * @file Navbar.vue
 * @description Навигационная панель приложения со ссылками на все ключевые разделы
 * и индикатором состояния подключения к REST API (json-server).
 */
import { RouterLink } from 'vue-router';
import { usePalettes } from '../composables/usePalettes';

const { state } = usePalettes();
</script>

<template>
  <nav class="app-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link">
          <span class="brand-icon">🎨</span>
          <span class="brand-title">ColorPalette SPA</span>
        </RouterLink>
      </div>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link" active-class="nav-link--active">
          Главная панель
        </RouterLink>
        <RouterLink to="/editor" class="nav-link" active-class="nav-link--active">
          Редактор палитр
        </RouterLink>
        <RouterLink to="/harmonies" class="nav-link" active-class="nav-link--active">
          Цветовые гармонии
        </RouterLink>
        <RouterLink to="/accessibility" class="nav-link" active-class="nav-link--active">
          Проверка доступности
        </RouterLink>
      </div>

      <div class="nav-status">
        <span
          class="status-indicator"
          :class="{
            'status-indicator--online': state.isServerConnected,
            'status-indicator--offline': !state.isServerConnected
          }"
          :title="state.isServerConnected ? 'json-server подключен (порт 3000)' : 'json-server отключен (локальный режим)'"
        >
          <span class="status-dot"></span>
          <span class="status-label">
            {{ state.isServerConnected ? 'REST API онлайн' : 'Оффлайн режим' }}
          </span>
        </span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: #0f172a;
  font-weight: 700;
  font-size: 1.15rem;
}

.brand-icon {
  font-size: 1.4rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.925rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.nav-link:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.nav-link--active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
}

.nav-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid transparent;
}

.status-indicator--online {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.status-indicator--offline {
  background: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
