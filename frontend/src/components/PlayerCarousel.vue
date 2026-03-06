<template>
  <div
    class="carousel-wrap"
    @keydown.left.prevent="prev"
    @keydown.right.prevent="next"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    tabindex="0"
  >
    <div class="carousel-scene" :style="{ perspective: perspectiveValue + 'px', perspectiveOrigin: '50% 50%' }">
      <div class="carousel-offset" :style="offsetStyle">
        <div class="carousel-ring" :style="ringStyle">
          <div
            v-for="(player, i) in players"
            :key="player._id"
            class="carousel-slot"
            :style="slotStyle(i)"
          >
            <div class="card-wrapper" :class="{ active: i === currentIndex }">
              <FifaCard :player="player">
                <slot :player="player" :isActive="i === currentIndex" />
              </FifaCard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="carousel-nav prev" @click="prev" aria-label="Previous">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <button class="carousel-nav next" @click="next" aria-label="Next">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import FifaCard from './FifaCard.vue'

const props = defineProps({
  players: { type: Array, required: true },
  activeOwnerId: { type: String, default: null },
})
console.log('PROPS ID: ', props.activeOwnerId)

const currentIndex = ref(0)
const ringAngle = ref(0)
let touchStartX = 0

const count = computed(() => props.players.length)
const anglePerCard = computed(() => count.value > 0 ? 360 / count.value : 0)

const radius = computed(() => {
  if (count.value <= 1) return 0
  const natural = (275 * count.value) / (2 * Math.PI)
  return Math.min(700, Math.max(380, natural))
})

const perspectiveValue = computed(() => Math.max(1000, radius.value * 2.2))

const offsetStyle = computed(() => ({
  transform: `translateZ(-${radius.value}px)`,
}))

const ringStyle = computed(() => ({
  transform: `rotateY(${ringAngle.value}deg)`,
}))

function slotStyle(i) {
  return {
    transform: `rotateY(${anglePerCard.value * i}deg) translateZ(${radius.value}px)`,
  }
}

function goTo(index) {
  const n = count.value
  if (n === 0) return
  const normalized = ((index % n) + n) % n
  let delta = normalized - currentIndex.value
  if (delta > n / 2) delta -= n
  if (delta < -n / 2) delta += n
  currentIndex.value = normalized
  ringAngle.value -= delta * anglePerCard.value
}

function prev() { goTo(currentIndex.value - 1) }
function next() { goTo(currentIndex.value + 1) }

function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 50) dx < 0 ? next() : prev()
}

onMounted(() => {
  if (props.activeOwnerId && props.players.length > 0) {
    const idx = props.players.findIndex(p => p.owner?._id === props.activeOwnerId)
    if (idx !== -1) {
      currentIndex.value = idx
      ringAngle.value = -idx * anglePerCard.value
    }
  }
})

watch(count, (n) => {
  if (currentIndex.value >= n) {
    currentIndex.value = 0
    ringAngle.value = 0
  }
})
</script>

<style scoped>
.carousel-wrap {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 500px;
  outline: none;
  touch-action: pan-y;
}

.carousel-scene {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 250px;
  height: 350px;
  transform: translate(-50%, -50%);
}

@media (min-width: 601px) {
  .carousel-wrap { height: 680px; }
  .carousel-scene { transform: translate(-50%, -50%) scale(1.5); }
}

.carousel-offset {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
}

.carousel-ring {
  position: absolute;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.carousel-slot {
  position: absolute;
  width: 250px;
  height: 350px;
  margin-left: -125px;
  margin-top: -175px;
  transform-style: preserve-3d;
}

.card-wrapper {
  width: 100%;
  height: 100%;
  transition: opacity 0.4s ease, transform 0.4s ease;
  opacity: 0.4;
  transform: scale(0.88);
  pointer-events: none;
}

.card-wrapper.active {
  opacity: 1;
  transform: scale(1.05);
  pointer-events: auto;
}

.carousel-nav {
  position: absolute;
  top: calc(50% - 24px);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  z-index: 10;
}

.carousel-nav:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: scale(1.1);
}

.carousel-nav.prev { left: 16px; }
.carousel-nav.next { right: 16px; }

@media (max-width: 600px) {
  .carousel-nav { display: none; }
  .carousel-offset { left: 44%; }
}
</style>
