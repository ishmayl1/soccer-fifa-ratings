<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Search -->
      <div class="mb-8">
        <SearchBar @search="onSearch" />
      </div>

      <!-- Stats bar -->
      <div v-if="!playerStore.loading" class="flex items-center justify-between mb-6">
        <p class="text-white/40 text-sm">
          {{ playerStore.players.length }} player{{ playerStore.players.length !== 1 ? 's' : '' }}
          <span v-if="currentSearch">matching "<span class="text-yellow-400">{{ currentSearch }}</span>"</span>
        </p>
      </div>

      <!-- Grid -->
      <div
        v-if="!playerStore.loading && playerStore.players.length > 0"
        class="grid gap-4 md:gap-6 justify-items-center"
        style="grid-template-columns: repeat(auto-fill, minmax(160px, max-content));"
      >
        <div
          v-for="player in playerStore.players"
          :key="player._id"
          class="relative group"
        >
          <FifaCard :player="player">
            <!-- Pencil icon for card owner -->
            <button
              v-if="isOwner(player)"
              @click.stop="openProfileEdit(player)"
              class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-yellow-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
              title="Edit your card"
            >
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </FifaCard>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="playerStore.loading" class="flex justify-center items-center py-20">
        <div class="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">⚽</div>
        <p class="text-white/40 text-lg">
          {{ currentSearch ? 'No players found' : 'No players yet. Ask an admin to add some!' }}
        </p>
      </div>
  </main>

  <!-- Profile edit modal -->
  <ProfileEditModal
    :show="showProfileModal"
    :player="selectedPlayer"
    @close="showProfileModal = false"
    @saved="onProfileSaved"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
