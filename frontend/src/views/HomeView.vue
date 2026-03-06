<template>
  <main class="page-main">
    <div class="top-bar">
      <SearchBar @search="onSearch" />
      <p v-if="!playerStore.loading" class="player-count">
        {{ players.length }} player{{ players.length !== 1 ? 's' : '' }}
        <span v-if="currentSearch"> matching "<span class="text-gold">{{ currentSearch }}</span>"</span>
      </p>
    </div>

    <PlayerCarousel v-if="!playerStore.loading && players.length > 0 && auth.user?.id" :players="players" :active-owner-id="auth.user?.id">
      <template #default="{ player, isActive }">
        <button
          v-if="isOwner(player) && isActive"
          @click.stop="openProfileEdit(player)"
          class="edit-btn"
          title="Edit your card"
        >
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </template>
    </PlayerCarousel>

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

  <BallonDorVoteModal
    :show="showVoteModal"
    :players="players"
    @close="showVoteModal = false"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NSpin } from 'naive-ui'
import { useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import PlayerCarousel from '../components/PlayerCarousel.vue'
import ProfileEditModal from '../components/ProfileEditModal.vue'
import BallonDorVoteModal from '../components/BallonDorVoteModal.vue'
import { usePlayerStore } from '../stores/players'
import { useAuthStore } from '../stores/auth'
import { useVoteStore } from '../stores/votes'

const playerStore = usePlayerStore()
const auth = useAuthStore()
const voteStore = useVoteStore()
const router = useRouter()

const currentSearch = ref('')
const showProfileModal = ref(false)
const selectedPlayer = ref(null)
const showVoteModal = ref(false)

const players = computed(() => playerStore.players)

onMounted(async () => {
  await playerStore.fetchPlayers()
  const hasCard = playerStore.players.some(p => p.owner?._id === auth.user?.id)
  if (!hasCard) {
    router.push('/onboarding')
    return
  }

  // Show vote modal after 3s if user hasn't voted yet
  try {
    await voteStore.checkVote()
    if (!voteStore.voted) {
      setTimeout(() => { showVoteModal.value = true }, 3000)
    }
  } catch {}
})

function onSearch(q) {
  currentSearch.value = q
  playerStore.fetchPlayers(q)
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
  height: 100%;
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

@media (max-width: 600px) {
  .top-bar { margin-bottom: 2rem; }
}
</style>
