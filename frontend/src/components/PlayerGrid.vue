<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="players.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">⚽</div>
      <p class="text-white/40 text-lg">No players found</p>
    </div>

    <!-- Grid -->
    <div
      v-else
      class="grid gap-4 md:gap-6 justify-items-center"
      style="grid-template-columns: repeat(2, min-content);"
      :style="gridStyle"
    >
      <div
        v-for="player in players"
        :key="player._id"
        class="relative"
      >
        <FifaCard :player="player">
          <slot :player="player" />
        </FifaCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FifaCard from './FifaCard.vue'

defineProps({
  players: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const gridStyle = computed(() => ({
  'grid-template-columns': 'repeat(auto-fill, minmax(160px, 1fr))',
}))
</script>
