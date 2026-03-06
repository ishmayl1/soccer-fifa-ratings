<template>
  <main class="page-main">
    <div class="d-flex align-center justify-between mb-8 w-100">
      <div>
        <p class="text-xs text-muted" style="margin-top:2px">{{ playerStore.players.length }} players total</p>
      </div>
      <NButton v-if="isSuperAdmin" @click="openRoles" style="margin-right:8px;">
        Manage Roles
      </NButton>
      <NButton type="primary" @click="openCreate" style="color:#000; font-weight:700;">
        <template #icon>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"/>
          </svg>
        </template>
        Add Player
      </NButton>
    </div>

    <div class="mb-8" style="width:100%; max-width:560px;">
      <SearchBar @search="onSearch" />
    </div>

    <PlayerCarousel v-if="!playerStore.loading && playerStore.players.length > 0" :players="playerStore.players">
      <template #default="{ player, isActive }">
        <div class="card-actions" :class="{ visible: isActive }">
          <button @click.stop="openEdit(player)" class="action-btn" title="Edit">
            <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button v-if="isSuperAdmin" @click.stop="confirmDelete(player)" class="action-btn delete-btn" title="Delete">
            <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
        <div v-if="player.owner && isActive" class="owner-badge text-truncate">{{ player.owner.username }}</div>
      </template>
    </PlayerCarousel>

    <div v-else-if="playerStore.loading" class="d-flex justify-center py-12">
      <NSpin size="large" />
    </div>

    <div v-else class="text-center text-muted py-12">
      <div class="mb-4" style="font-size:4rem">⚽</div>
      <p class="mb-6">No players yet</p>
      <NButton type="primary" @click="openCreate" style="color:#000;font-weight:700;">Add First Player</NButton>
    </div>
  </main>

  <!-- Manage Roles — superadmin only -->
  <NModal v-if="isSuperAdmin" v-model:show="showRoles" preset="card" title="Manage Roles" style="max-width:480px;">
    <div v-if="rolesLoading" class="d-flex justify-center py-6"><NSpin size="medium" /></div>
    <div v-else class="roles-list">
      <div v-for="u in allUsers" :key="u._id" class="role-row">
        <div class="role-user">
          <span class="role-name">{{ u.username }}</span>
          <span class="role-email">{{ u.email }}</span>
        </div>
        <NButton
          size="small"
          :type="u.role === 'admin' ? 'warning' : 'primary'"
          :disabled="u.email === 'ishmayl1@gmail.com' || roleUpdating === u._id"
          :loading="roleUpdating === u._id"
          @click="toggleRole(u)"
        >
          {{ u.role === 'admin' ? 'Remove Admin' : 'Make Admin' }}
        </NButton>
      </div>
    </div>
  </NModal>

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
import { ref, computed, onMounted } from 'vue'
import { NButton, NSpin, NModal } from 'naive-ui'
import SearchBar from '../components/SearchBar.vue'
import PlayerCarousel from '../components/PlayerCarousel.vue'
import PlayerFormModal from '../components/PlayerFormModal.vue'
import { usePlayerStore } from '../stores/players'
import { useAuthStore } from '../stores/auth'

const playerStore = usePlayerStore()
const auth = useAuthStore()

const SUPERADMIN_EMAIL = 'ishmayl1@gmail.com'
const isSuperAdmin = computed(() => auth.user?.email === SUPERADMIN_EMAIL)

const showRoles = ref(false)
const rolesLoading = ref(false)
const roleUpdating = ref(null)
const allUsers = ref([])

async function openRoles() {
  showRoles.value = true
  rolesLoading.value = true
  try {
    allUsers.value = await playerStore.fetchUsers()
  } finally {
    rolesLoading.value = false
  }
}

async function toggleRole(user) {
  roleUpdating.value = user._id
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const updated = await playerStore.setUserRole(user._id, newRole)
    const idx = allUsers.value.findIndex(u => u._id === user._id)
    if (idx !== -1) allUsers.value[idx] = { ...allUsers.value[idx], role: updated.role }
  } finally {
    roleUpdating.value = null
  }
}

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

function onSaved() {}

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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.role-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}

.role-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
}

.card-actions.visible {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5d577;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.action-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.8); }
.delete-btn { color: #f56c6c; }

.owner-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: rgba(255, 255, 255, 0.7);
  font-size: 9px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  max-width: 90%;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
