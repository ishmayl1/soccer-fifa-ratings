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

console.log('PROPS: ', props.player)

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

<style scoped>
.fifa-card {
  position: relative;
  width: 250px;
  height: 350px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.1s ease, filter 0.2s ease;
  user-select: none;
  clip-path: path('M 25 0 L 225 0 A 25 25 0 0 1 250 25 L 250 280 C 250 318 165 345 125 350 C 85 345 0 318 0 280 L 0 25 A 25 25 0 0 1 25 0 Z');
}

.fifa-card.gold {
  background: linear-gradient(135deg, #b8922a 0%, #f5d577 40%, #ffe9a0 55%, #f5d577 70%, #b8922a 100%);
  filter: drop-shadow(0 4px 20px rgba(245, 213, 119, 0.3));
}
.fifa-card.silver {
  background: linear-gradient(135deg, #5a5a5a 0%, #c0c0c0 40%, #e8e8e8 55%, #c0c0c0 70%, #5a5a5a 100%);
  filter: drop-shadow(0 4px 20px rgba(192, 192, 192, 0.3));
}
.fifa-card.bronze {
  background: linear-gradient(135deg, #6b3f1e 0%, #cd8c52 40%, #e8a96a 55%, #cd8c52 70%, #6b3f1e 100%);
  filter: drop-shadow(0 4px 20px rgba(205, 140, 82, 0.3));
}

.fifa-card:hover.gold {
  filter: drop-shadow(0 0 20px rgba(245, 213, 119, 0.8)) drop-shadow(0 0 40px rgba(245, 213, 119, 0.4));
}
.fifa-card:hover.silver {
  filter: drop-shadow(0 0 20px rgba(192, 192, 192, 0.8)) drop-shadow(0 0 40px rgba(192, 192, 192, 0.4));
}
.fifa-card:hover.bronze {
  filter: drop-shadow(0 0 20px rgba(205, 140, 82, 0.8)) drop-shadow(0 0 40px rgba(205, 140, 82, 0.4));
}

.fifa-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 14px 16px 75px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fifa-card-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.fifa-card-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.fifa-card-ovr {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
  color: rgba(0,0,0,0.75);
  text-shadow: 0 1px 0 rgba(255,255,255,0.3);
  letter-spacing: -1px;
}

.fifa-card-pos {
  font-size: 0.85rem;
  font-weight: 800;
  color: rgba(0,0,0,0.65);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 6px;
}

.fifa-card-photo-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -40px 0 2px;
}

.fifa-card-photo {
  width: 135px;
  height: 135px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.25);
  background: rgba(0,0,0,0.15);
}

.fifa-card-photo-placeholder {
  width: 135px;
  height: 135px;
  border-radius: 50%;
  background: rgba(0,0,0,0.2);
  border: 3px solid rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(0,0,0,0.4);
}

.fifa-card-name {
  text-align: center;
  font-size: 0.95rem;
  font-weight: 800;
  color: rgba(0,0,0,0.8);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: fit-content;
}

.fifa-card-club {
  text-align: center;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(0,0,0,0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.fifa-card-divider {
  height: 1px;
  background: rgba(0,0,0,0.2);
  margin: 0 -4px 8px;
}

.fifa-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 12px;
  margin-left: 15%
}

.fifa-card-stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.fifa-card-stat-val {
  font-size: 0.9rem;
  font-weight: 900;
  color: rgba(0,0,0,0.8);
  min-width: 22px;
}

.fifa-card-stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(0,0,0,0.55);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 640px) {
  .fifa-card {
    width: 160px;
    height: 224px;
    clip-path: path('M 16 0 L 144 0 A 16 16 0 0 1 160 16 L 160 179 C 160 204 106 221 80 224 C 54 221 0 204 0 179 L 0 16 A 16 16 0 0 1 16 0 Z');
  }
  .fifa-card-inner { padding: 8px 10px 48px; }
  .fifa-card-top { margin-bottom: 2px; }
  .fifa-card-ovr { font-size: 1.5rem; }
  .fifa-card-pos { font-size: 0.55rem; margin-top: 3px; }
  .fifa-card-photo-wrap { margin: -20px 0 2px; }
  .fifa-card-photo { width: 70px; height: 70px; }
  .fifa-card-photo-placeholder { width: 70px; height: 70px; font-size: 1.4rem; }
  .fifa-card-name { font-size: 0.6rem; letter-spacing: 1px; margin-bottom: 1px; }
  .fifa-card-club { font-size: 0.45rem; margin-bottom: 3px; }
  .fifa-card-stat-val { font-size: 0.6rem; min-width: 16px; }
  .fifa-card-stat-label { font-size: 0.45rem; }
  .fifa-card-stats { gap: 2px 8px; margin-left: 15% }
  .fifa-card-divider { margin-bottom: 3px; }
}

@media (max-width: 599px) {
  .fifa-card {
    width: 280px;
    height: 392px;
    clip-path: path('M 28 0 L 252 0 A 28 28 0 0 1 280 28 L 280 314 C 280 356 185 386 140 392 C 95 386 0 356 0 314 L 0 28 A 28 28 0 0 1 28 0 Z');
  }
  .fifa-card-inner { padding: 14px 16px 85px; }
  .fifa-card-top { margin-bottom: 4px; }
  .fifa-card-ovr { font-size: 2.6rem; }
  .fifa-card-pos { font-size: 0.9rem; margin-top: 6px; }
  .fifa-card-photo-wrap { margin: -40px 0 2px; }
  .fifa-card-photo { width: 135px; height: 135px; }
  .fifa-card-photo-placeholder { width: 135px; height: 135px; font-size: 2.6rem; }
  .fifa-card-name { font-size: 1rem; letter-spacing: 1.5px; margin-bottom: 2px; }
  .fifa-card-club { font-size: 0.65rem; margin-bottom: 8px; }
  .fifa-card-stat-val { font-size: 1rem; min-width: 24px; }
  .fifa-card-stat-label { font-size: 0.72rem; }
  .fifa-card-stats { gap: 3px 12px; margin-left: 15% }
  .fifa-card-divider { margin-bottom: 8px; }
}
</style>
