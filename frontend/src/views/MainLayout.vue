<template>
  <div class="layout-root">
    <AppHeader />
    <RouterView class="layout-content" />
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
</script>

<style scoped>
.layout-root {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>
