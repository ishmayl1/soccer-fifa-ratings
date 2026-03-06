<template>
  <main class="page-main">
    <div class="d-flex align-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-black text-white">Player Management</h1>
        <p class="text-xs text-muted" style="margin-top:2px">{{ playerStore.players.length }} players total</p>
      </div>
      <NButton type="primary" @click="openCreate" style="color:#000; font-weight:700;">
        <template #icon>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"/>
          </svg>
        </template>
        Add Player
      </NButton>
    </div>

    <div class="mb-8">
      <SearchBar @search="onSearch" />
    </div>

    <div v-if="!playerStore.loading && playerStore.players.length > 0" class="card-grid">
      <div v-for="player in playerStore.players" :key="player._id" class="card-wrap position-relative">
        <FifaCard :player="player">
          <div class="card-overlay"></div>
          <div class="card-actions">
            <button @click.stop="openEdit(player)" class="action-btn" title="Edit">
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button @click.stop="confirmDelete(player)" class="action-btn delete-btn" title="Delete">
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
          <div v-if="player.owner" class="owner-badge text-truncate">{{ player.owner.username }}</div>
        </FifaCard>
      </div>
    </div>

    <div v-else-if="playerStore.loading" class="d-flex justify-center py-12">
      <NSpin size="large" />
    </div>

    <div v-else class="text-center text-muted py-12">
      <div class="mb-4" style="font-size:4rem">⚽</div>
      <p class="mb-6">No players yet</p>
      <NButton type="primary" @click="openCreate" style="color:#000;font-weight:700;">Add First Player</NButton>
    </div>
  </main>

  <PlayerFormModal :show="showModal" :editingPlayer="editingPlayer" @close="closeModal" @saved="onSaved" />

  <NModal v-model:show="showDeleteConfirm" preset="card" title="Delete Player?" style="max-width:400px;">
    <p class="text-dim mb-6 text-sm">
      Are you sure you want to delete <strong class="text-white">{{ deleteTarget?.name }}</strong>? This cannot be undone.
    </p>
    <div class="d-flex gap-3">
      <NButton class="flex-1" @click="showDeleteConfirm = false">Cancel</NButton>
      <NButton class="flex-1 font-bold" type="error" :loading="deleting" @click="doDelete">Delete</NButton>
    </div>
  </NModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NButton, NSpin, NModal } from 'naive-ui'
import SearchBar from '../components/SearchBar.vue'
import FifaCard from '../components/FifaCard.vue'
import PlayerFormModal from '../components/PlayerFormModal.vue'
import { usePlayerStore } from '../stores/players'

const playerStore = usePlayerStore()

const showModal = ref(false)
const editingPlayer = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

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
  showDeleteConfirm.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    await playerStore.deletePlayer(deleteTarget.value._id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
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
.card-wrap:hover .card-actions { opacity: 1; }
.card-wrap:hover .card-overlay { background: rgba(0,0,0,0.2); }
.card-wrap:hover .owner-badge { opacity: 1; }
.card-overlay {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: transparent;
  transition: background 0.2s;
  pointer-events: none;
}
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5d577;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}
.action-btn:hover { transform: scale(1.1); background: rgba(0,0,0,0.8); }
.delete-btn { color: #f56c6c; }
.owner-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: rgba(255,255,255,0.7);
  font-size: 9px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  max-width: 90%;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
</style>
