<template>
  <main class="page-main">
    <div class="mb-6">
      <SearchBar @search="onSearch" />
    </div>

    <p v-if="!playerStore.loading" class="d-flex align-center justify-center text-muted text-sm mb-6">
      {{ playerStore.players.length }} player{{ playerStore.players.length !== 1 ? 's' : '' }}
      <span v-if="currentSearch"> matching "<span class="text-gold">{{ currentSearch }}</span>"</span>
    </p>

    <div v-if="!playerStore.loading && playerStore.players.length > 0" class="card-grid">
      <div v-for="player in playerStore.players" :key="player._id" class="card-wrap position-relative">
        <FifaCard :player="player">
          <button
            v-if="isOwner(player)"
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

    <div v-else-if="playerStore.loading" class="d-flex justify-center py-12">
      <NSpin size="large" />
    </div>

    <div v-else class="text-center text-muted py-12">
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
import { ref, onMounted } from 'vue'
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

onMounted(() => playerStore.fetchPlayers())

function onSearch(query) {
  currentSearch.value = query
  playerStore.fetchPlayers(query)
}

function isOwner(player) {
  if (!auth.user) return false
  return player.owner && player.owner._id === auth.user.id
}

function openProfileEdit(player) {
  selectedPlayer.value = player
  showProfileModal.value = true
}

function onProfileSaved() {
  // store already updated in place
}
</script>

<style scoped>
.page-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 250px));
  gap: 1.5rem;
  justify-content: center;
  justify-items: center;
}
@media (max-width: 599px) {
  .card-grid { grid-template-columns: min(80vw, 300px); }
}
.card-wrap:hover .edit-btn { opacity: 1; }
.edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5d577;
  opacity: 0;
  transition: opacity 0.2s, transform 0.15s;
  cursor: pointer;
}
.edit-btn:hover { transform: scale(1.1); background: rgba(0,0,0,0.75); }
</style>
