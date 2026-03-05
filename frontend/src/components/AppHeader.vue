<template>
  <header class="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

      <!-- Logo / Brand -->
      <router-link to="/" class="flex items-center gap-2 group">
        <span class="text-2xl">⚽</span>
        <span class="font-black text-yellow-400 text-sm sm:text-base leading-tight group-hover:text-yellow-300 transition-colors">
          Cool Soccer<br class="hidden sm:block" /> <span class="hidden sm:inline">For Cool People</span>
        </span>
      </router-link>

      <!-- Nav -->
      <nav class="flex items-center gap-3">
        <router-link
          v-if="auth.isAdmin"
          to="/admin"
          class="px-3 py-1.5 rounded-lg text-sm font-semibold text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 transition-all"
        >
          Admin
        </router-link>

        <div v-if="auth.isLoggedIn" class="flex items-center gap-2">
          <div class="text-right hidden sm:block">
            <div class="text-xs text-white/60">{{ auth.user?.username }}</div>
            <div
              class="text-xs font-semibold"
              :class="auth.isAdmin ? 'text-yellow-400' : 'text-white/40'"
            >
              {{ auth.isAdmin ? 'Admin' : 'Player' }}
            </div>
          </div>
          <button
            @click="logout"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
