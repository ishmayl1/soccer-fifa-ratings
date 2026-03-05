<template>
  <div class="relative w-full max-w-md mx-auto">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
    </div>
    <input
      v-model="query"
      type="text"
      placeholder="Search players..."
      class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 focus:bg-white/8 transition-all"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['search'])
const query = ref('')

let timer = null
watch(query, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('search', val), 300)
})
</script>
