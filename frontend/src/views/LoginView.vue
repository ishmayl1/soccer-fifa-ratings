<template>
  <div class="login-bg min-h-screen flex items-center justify-center p-4">

    <!-- Floating card decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-10 -left-10 w-48 h-64 fifa-card gold opacity-10 rotate-[-15deg]"></div>
      <div class="absolute -bottom-10 -right-10 w-48 h-64 fifa-card silver opacity-10 rotate-[15deg]"></div>
      <div class="absolute top-1/4 right-8 w-32 h-44 fifa-card bronze opacity-10 rotate-[8deg]"></div>
    </div>

    <div class="relative w-full max-w-md">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-3">⚽</div>
        <h1 class="text-3xl font-black text-yellow-400 tracking-tight">
          Cool Soccer
        </h1>
        <p class="text-white/40 text-sm mt-1">For Cool People</p>
      </div>

      <!-- Card -->
      <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">

        <!-- Tab toggle -->
        <div class="flex rounded-xl bg-white/5 p-1 mb-6">
          <button
            @click="mode = 'login'"
            class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="mode === 'login' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-white'"
          >Login</button>
          <button
            @click="mode = 'register'"
            class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="mode === 'register' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-white'"
          >Register</button>
        </div>

        <form @submit.prevent="submit" class="space-y-4">

          <!-- Username (register only) -->
          <Transition name="slide-up">
            <div v-if="mode === 'register'">
              <label class="block text-sm font-medium text-white/70 mb-1">Username</label>
              <input
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition-all"
                placeholder="coolsoccer99"
              />
            </div>
          </Transition>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-white/70 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- Admin secret (register only, optional) -->
          <Transition name="slide-up">
            <div v-if="mode === 'register'">
              <label class="block text-sm font-medium text-white/70 mb-1">
                Admin Secret <span class="text-white/30 text-xs">(optional)</span>
              </label>
              <input
                v-model="form.adminSecret"
                type="password"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition-all"
                placeholder="Leave blank for regular account"
              />
            </div>
          </Transition>

          <!-- Error -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-base hover:bg-yellow-300 transition-all disabled:opacity-50 mt-2"
          >
            {{ loading ? '...' : (mode === 'login' ? 'Login' : 'Create Account') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const mode = ref('login')
const loading = ref(false)
const error = ref('')

const form = ref({ username: '', email: '', password: '', adminSecret: '' })

watch(mode, () => { error.value = '' })

async function submit() {
  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'login') {
      await auth.login(form.value.email, form.value.password)
    } else {
      await auth.register(form.value.username, form.value.email, form.value.password, form.value.adminSecret || null)
    }
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>
