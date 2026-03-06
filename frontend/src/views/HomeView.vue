<template>
  <main class="page-main">
    <div class="top-bar">
      <SearchBar @search="onSearch" />
      <p v-if="!playerStore.loading" class="player-count">
        {{ players.length }} player{{ players.length !== 1 ? 's' : '' }}
        <span v-if="currentSearch"> matching "<span class="text-gold">{{ currentSearch }}</span>"</span>
      </p>
    </div>

    <div
      v-if="!playerStore.loading && players.length > 0"
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
                <button
                  v-if="isOwner(player) && i === currentIndex"
                  @click.stop="openProfileEdit(player)"
                  class="edit-btn"
                  title="Edit your card"
                >
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
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

    <div v-else-if="playerStore.loading" class="loading-wrap">
      <NSpin size="large" />
    </div>

    <div v-else class="empty-wrap">
      <div style="font-size:4rem">⚽</div>
      <p>{{ currentSearch ? 'No players found' : 'No players yet. Ask an admin to add some!' }}</p>
    </div>
  </main>

  <ProfileEditModal
    :show="showProfileModal"
    :player="selectedPlayer"
    @close="showProfileModal = false"
    @saved="onProfileSaved"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { NSpin } from 'naive-ui'
import SearchBar from '../components/SearchBar.vue'
import FifaCard from '../components/FifaCard.vue'
import ProfileEditModal from '../components/ProfileEditModal.vue'
import { usePlayerStore } from '../stores/players'
import { useAuthStore } from '../stores/auth'

const playerStore = usePlayerStore()
const auth = useAuthStore()

const currentSearch = ref('')
const showProfileModal = ref(false)
const selectedPlayer = ref(null)
const currentIndex = ref(0)
const ringAngle = ref(0)

let touchStartX = 0

const players = computed(() => playerStore.players)
const count = computed(() => players.value.length)
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

onMounted(() => playerStore.fetchPlayers())

watch(count, (n) => {
  if (currentIndex.value >= n) {
    currentIndex.value = 0
    ringAngle.value = 0
  }
})

function onSearch(q) {
  currentSearch.value = q
  playerStore.fetchPlayers(q)
  currentIndex.value = 0
  ringAngle.value = 0
}

function isOwner(player) {
  return auth.user && player.owner && player.owner._id === auth.user.id
}

function openProfileEdit(player) {
  selectedPlayer.value = player
  showProfileModal.value = true
}

function onProfileSaved() {}
</script>

<style scoped>
.page-main {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-bar {
  width: 100%;
  max-width: 560px;
  margin-bottom: 2.5rem;
  text-align: center;
}

.player-count {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.45);
}

.text-gold { color: #f5d577; }

/* ── Carousel ── */
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
  top: 50%;
  width: 250px;
  height: 350px;
  transform: translate(-50%, -50%);
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

/* ── Nav buttons ── */
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

/* ── Edit button ── */
.edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5d577;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  z-index: 20;
}

.edit-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.75); }

/* ── States ── */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.empty-wrap {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  padding: 3rem 0;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .top-bar { margin-bottom: 2rem; }
  .carousel-nav { display: none; }
  .carousel-offset {
    left: 44%;
  }
}
</style>
