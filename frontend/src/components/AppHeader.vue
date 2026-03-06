<template>
  <header class="app-header">
    <div class="header-inner d-flex align-center justify-between gap-4">
      <router-link to="/" class="brand d-flex align-center gap-2">
        <Logo />
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

        <div v-if="auth.isLoggedIn" class="profile-wrap" ref="profileWrap">
          <button class="avatar-btn" @click="open = !open" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect y="2" width="18" height="2" rx="1"/>
              <rect y="8" width="18" height="2" rx="1"/>
              <rect y="14" width="18" height="2" rx="1"/>
            </svg>
          </button>

          <div v-if="open" class="dropdown">
            <div class="dropdown-header">
              <p class="dropdown-name">{{ auth.user?.username }}</p>
              <p class="dropdown-role" :style="auth.isAdmin ? 'color:#f5d577' : 'color:rgba(255,255,255,0.4)'">
                {{ auth.isAdmin ? 'Admin' : 'Player' }}
              </p>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="logout">Sign out</button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { NButton } from 'naive-ui'
import Logo from './Logo.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const version = __APP_VERSION__

const open = ref(false)
const profileWrap = ref(null)

function logout() {
  open.value = false
  auth.logout()
  router.push('/login')
}

function onClickOutside(e) {
  if (profileWrap.value && !profileWrap.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
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
  padding: .25rem 1.5rem 0 .8rem;
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

/* Profile dropdown */
.profile-wrap {
  position: relative;
}
.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(245, 213, 119, 0.15);
  border: 1.5px solid rgba(245, 213, 119, 0.4);
  color: #f5d577;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.avatar-btn:hover {
  background: rgba(245, 213, 119, 0.25);
  border-color: rgba(245, 213, 119, 0.7);
}
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 180px;
  background: #12122a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.dropdown-header {
  padding: 12px 16px;
}
.dropdown-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}
.dropdown-role {
  font-size: 0.75rem;
  margin-top: 2px;
}
.dropdown-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
}
.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.dropdown-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}
</style>
