<template>
  <div class="search-wrap">
    <NInput
      v-model:value="query"
      placeholder="Search players..."
      clearable
      size="large"
      round
    >
      <template #prefix>
        <svg width="16" height="16" fill="none" stroke="#f5d577" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </template>
    </NInput>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NInput } from 'naive-ui'

const emit = defineEmits(['search'])
const query = ref('')

let timer = null
watch(query, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('search', val), 300)
})
</script>

<style scoped>
.search-wrap {
  max-width: 480px;
  margin: 0 auto;
}
</style>
