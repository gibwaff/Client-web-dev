<script setup lang="ts">
/**
 * @file App.vue
 * @description Корневой компонент SPA-приложения управления цветовыми палитрами.
 */
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="app-layout">
    <Navbar />

    <div class="app-content">
      <RouterView />
    </div>

    <footer class="app-footer">
      <div class="footer-container">
        <p class="footer-text">
          <strong>ColorPalette SPA</strong> — Лабораторные работы №03 (Vue: SPA) и №04 (Unit Tests).
        </p>
        <p class="footer-subtext">
          Разработано на Vue 3, TypeScript, Vue Router, Vitest и json-server.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
}

.app-footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 1.75rem 1rem;
  margin-top: 3rem;
  text-align: center;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-text {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
}

.footer-subtext {
  margin: 0.35rem 0 0;
  color: #94a3b8;
  font-size: 0.85rem;
}
</style>
