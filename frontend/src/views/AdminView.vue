<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Header row -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-black text-white">Player Management</h1>
          <p class="text-white/40 text-sm mt-1">{{ playerStore.players.length }} players total</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          Add Player
        </button>
      </div>

      <!-- Search -->
      <div class="mb-8">
        <SearchBar @search="onSearch" />
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
            <!-- Admin controls overlay -->
            <div class="absolute inset-0 rounded-[12px] bg-black/0 group-hover:bg-black/20 transition-all pointer-events-none"></div>
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                @click.stop="openEdit(player)"
                class="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-yellow-400 hover:bg-black/80 hover:scale-110 transition-all"
                title="Edit"
              >
                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button
                @click.stop="confirmDelete(player)"
                class="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-black/80 hover:scale-110 transition-all"
                title="Delete"
              >
                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>

            <!-- Owner badge -->
            <div
              v-if="player.owner"
              class="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all"
            >
              <span class="bg-black/70 text-white/70 text-[9px] font-medium px-2 py-0.5 rounded-full truncate max-w-[90%]">
                {{ player.owner.username }}
              </span>
            </div>
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
        <p class="text-white/40 text-lg mb-4">No players yet</p>
        <button
          @click="openCreate"
          class="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all"
        >
          Add First Player
        </button>
      </div>
    </main>

    <!-- Player form modal -->
    <PlayerFormModal
      :show="showModal"
      :editingPlayer="editingPlayer"
      @close="closeModal"
      @saved="onSaved"
    />

    <!-- Delete confirm dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box" style="max-width: 400px;">
            <h3 class="text-lg font-bold text-white mb-2">Delete Player?</h3>
            <p class="text-white/60 text-sm mb-6">
              Are you sure you want to delete <span class="text-white font-semibold">{{ deleteTarget.name }}</span>? This cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                @click="deleteTarget = null"
                class="flex-1 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
              >Cancel</button>
              <button
                @click="doDelete"
                :disabled="deleting"
                class="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-400 transition-all disabled:opacity-50"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import SearchBar from '../components/SearchBar.vue'
import FifaCard from '../components/FifaCard.vue'
import PlayerFormModal from '../components/PlayerFormModal.vue'
import { usePlayerStore } from '../stores/players'

const playerStore = usePlayerStore()

const showModal = ref(false)
const editingPlayer = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

onMounted(() => playerStore.fetchPlayers())

function onSearch(query) {
  playerStore.fetchPlayers(query)
}

function openCreate() {
  editingPlayer.value = null
  showModal.value = true
}

function openEdit(player) {
  editingPlayer.value = player
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPlayer.value = null
}

function onSaved() {
  // players store already updated in place
}

function confirmDelete(player) {
  deleteTarget.value = player
}

async function doDelete() {
  deleting.value = true
  try {
    await playerStore.deletePlayer(deleteTarget.value._id)
    deleteTarget.value = null
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}
</script>
