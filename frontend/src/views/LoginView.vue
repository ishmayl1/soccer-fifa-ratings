<template>
  <div class="login-bg login-page d-flex align-center justify-center min-h-screen overflow-hidden position-relative">
    <!-- Background card decorations -->
    <div class="position-absolute pointer-events-none" style="inset:0">
      <div class="fifa-card gold deco-card" style="top:-40px;left:-40px;transform:rotate(-15deg);opacity:0.1"></div>
      <div class="fifa-card silver deco-card" style="bottom:-40px;right:-40px;transform:rotate(15deg);opacity:0.1"></div>
    </div>

    <div class="login-container position-relative w-100">
      <div class="login-logo text-center mb-8">
        <div style="font-size:3.5rem">⚽</div>
        <h1 class="login-title font-black text-gold">Cool Soccer</h1>
        <p class="text-muted text-sm">For Cool People</p>
      </div>

      <NCard class="py-2 px-0">
        <NTabs v-model:value="mode" type="bar" animated justify-content="space-evenly">
          <NTabPane name="login" tab="Login" />
          <NTabPane name="register" tab="Register" />
        </NTabs>

        <form @submit.prevent="submit" class="d-flex flex-column gap-3 mt-5">
          <Transition name="slide-up">
            <NFormItem v-if="mode === 'register'" label="Username" :show-feedback="false">
              <NInput v-model:value="form.username" placeholder="coolsoccer99" size="large" />
            </NFormItem>
          </Transition>

          <NFormItem label="Email" :show-feedback="false">
            <NInput v-model:value="form.email" type="text" placeholder="you@example.com" size="large" />
          </NFormItem>

          <NFormItem label="Password" :show-feedback="false">
            <NInput v-model:value="form.password" type="password" placeholder="••••••••" size="large" show-password-on="click" />
          </NFormItem>


          <NAlert v-if="error" type="error" :bordered="false" class="mt-1">
            {{ error }}
          </NAlert>

          <NButton
            attr-type="submit"
            type="primary"
            size="large"
            :loading="loading"
            block
            style="margin-top: 8px; font-weight: 700; color: #000;"
          >
            {{ mode === 'login' ? 'Login' : 'Create Account' }}
          </NButton>
        </form>
      </NCard>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NCard, NTabs, NTabPane, NFormItem, NInput, NButton, NAlert } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', email: '', password: '' })

watch(mode, () => { error.value = '' })

async function submit() {
  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'login') {
      await auth.login(form.value.email, form.value.password)
      router.push('/')
    } else {
      await auth.register(form.value.username, form.value.email, form.value.password)
      router.push(auth.isAdmin ? '/' : '/onboarding')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { padding: 1.5rem; }
.deco-card { position: absolute; width: 192px; height: 268px; }
.login-container { max-width: 420px; }
.login-title {
  font-size: 2rem;
  letter-spacing: -0.5px;
  margin: 8px 0 4px;
}
</style>
