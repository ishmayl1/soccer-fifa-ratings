<template>
  <header class="app-header">
    <div class="header-inner d-flex align-center justify-between gap-4">
      <router-link to="/" class="brand d-flex align-center gap-2">
        <span class="brand-icon">⚽</span>
        <span class="brand-text">Cool Soccer<br /><span class="brand-sub">For Cool People</span></span>
      </router-link>

      <span class="version text-xs user-select-none">v{{ version }}</span>

      <nav class="d-flex align-center gap-3">
        <NButton
          v-if="auth.isAdmin"
          size="small"
          @click="$router.push('/admin')"
          style="border-color: rgba(245,213,119,0.35); color: #f5d577;"
        >
          Admin
        </NButton>

        <div v-if="auth.isLoggedIn" class="d-flex align-center gap-2">
          <div class="d-flex flex-column align-end leading-tight">
            <span class="text-xs text-dim">{{ auth.user?.username }}</span>
            <span class="text-xs font-semibold" :style="auth.isAdmin ? 'color:#f5d577' : 'color:rgba(255,255,255,0.35)'">
              {{ auth.isAdmin ? 'Admin' : 'Player' }}
            </span>
          </div>
          <NButton size="small" quaternary @click="logout">Logout</NButton>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const version = __APP_VERSION__

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10, 10, 26, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.header-inner {
  padding: 0 1.5rem;
  height: 64px;
}
.brand {
  text-decoration: none;
  flex-shrink: 0;
}
.brand-icon { font-size: 1.5rem; }
.brand-text {
  font-weight: 900;
  color: #f5d577;
  font-size: 0.875rem;
  line-height: 1.2;
}
.brand-sub { font-size: 0.75rem; }
.version {
  font-family: monospace;
  color: rgba(255,255,255,0.18);
}
</style>
