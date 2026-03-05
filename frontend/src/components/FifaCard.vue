<template>
  <div
    class="fifa-card"
    :class="tier"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    :style="cardStyle"
  >
    <div class="fifa-card-inner">
      <div class="fifa-card-top">
        <div>
          <div class="fifa-card-ovr">{{ player.overall }}</div>
          <div class="fifa-card-pos">{{ player.position }}</div>
        </div>
      </div>

      <div class="fifa-card-photo-wrap">
        <img
          v-if="photoSrc"
          :src="photoSrc"
          :alt="player.name"
          class="fifa-card-photo"
        />
        <div v-else class="fifa-card-photo-placeholder">⚽</div>
      </div>

      <div class="fifa-card-name">{{ player.name }}</div>
      <div class="fifa-card-club">{{ player.club || 'Cool Soccer For Cool People' }}</div>

      <div class="fifa-card-divider"></div>

      <div class="fifa-card-stats">
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.pac ?? '—' }}</span>
          <span class="fifa-card-stat-label">PAC</span>
        </div>
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.dri ?? '—' }}</span>
          <span class="fifa-card-stat-label">DRI</span>
        </div>
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.sho ?? '—' }}</span>
          <span class="fifa-card-stat-label">SHO</span>
        </div>
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.def ?? '—' }}</span>
          <span class="fifa-card-stat-label">DEF</span>
        </div>
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.pas ?? '—' }}</span>
          <span class="fifa-card-stat-label">PAS</span>
        </div>
        <div class="fifa-card-stat">
          <span class="fifa-card-stat-val">{{ player.stats?.phy ?? '—' }}</span>
          <span class="fifa-card-stat-label">PHY</span>
        </div>
      </div>
    </div>

    <!-- Slot for overlay icons (edit pencil, delete, etc.) -->
    <slot />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
})

const photoSrc = computed(() => {
  const p = props.player.photo
  if (!p) return ''
  if (p.startsWith('blob:') || p.startsWith('http') || p.startsWith('/')) return p
  return `/uploads/${p}`
})

const tier = computed(() => {
  const ovr = props.player.overall
  if (ovr >= 75) return 'gold'
  if (ovr >= 65) return 'silver'
  return 'bronze'
})

const rotateX = ref(0)
const rotateY = ref(0)

const cardStyle = computed(() => ({
  transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
}))

function onMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const cx = rect.width / 2
  const cy = rect.height / 2
  rotateY.value = ((x - cx) / cx) * 8
  rotateX.value = -((y - cy) / cy) * 8
}

function onMouseLeave() {
  rotateX.value = 0
  rotateY.value = 0
}
</script>
