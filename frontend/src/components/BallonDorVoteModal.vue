<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay">
      <div class="modal-box vote-modal">
        <div class="vote-header">
          <img src="/ballon_dor.png" width="48" height="48" style="object-fit:contain;" />
          <div>
            <h2 class="vote-title">Ballon d'Or Vote</h2>
            <p class="vote-sub">Who is the best player this season?</p>
          </div>
        </div>

        <div v-if="!submitted" class="player-list">
          <button
            v-for="player in players"
            :key="player._id"
            class="player-option"
            :class="{ selected: selected === player._id }"
            @click="selected = player._id"
          >
            <div class="player-option-photo">
              <img v-if="player.photo" :src="photoSrc(player.photo)" :alt="player.name" />
              <span v-else>⚽</span>
            </div>
            <div class="player-option-info">
              <span class="player-option-name">{{ player.name }}</span>
              <span class="player-option-pos">{{ player.position }}</span>
            </div>
            <div class="player-option-ovr">{{ player.overall }}</div>
            <div class="player-option-check" :class="{ visible: selected === player._id }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="vote-success">
          <img src="/ballon_dor.png" width="64" height="64" style="object-fit:contain; opacity:0.9;" />
          <p class="vote-success-text">Your vote has been cast!</p>
          <p class="vote-success-sub">You voted for <strong>{{ submittedName }}</strong></p>
        </div>

        <div v-if="!submitted" class="vote-actions">
          <button class="vote-cancel" @click="$emit('close')">Maybe later</button>
          <button class="vote-submit" :disabled="!selected || submitting" @click="submit">
            {{ submitting ? 'Submitting…' : 'Cast Vote' }}
          </button>
        </div>
        <div v-else class="vote-actions">
          <button class="vote-submit" @click="$emit('close')">Done</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVoteStore } from '../stores/votes'

const props = defineProps({
  show: { type: Boolean, required: true },
  players: { type: Array, required: true },
})

const emit = defineEmits(['close'])

const voteStore = useVoteStore()
const selected = ref(null)
const submitting = ref(false)
const submitted = ref(false)
const submittedName = ref('')

function photoSrc(photo) {
  if (!photo) return ''
  if (photo.startsWith('blob:') || photo.startsWith('http') || photo.startsWith('/')) return photo
  return `/uploads/${photo}`
}

async function submit() {
  if (!selected.value || submitting.value) return
  submitting.value = true
  try {
    await voteStore.castVote(selected.value)
    const player = props.players.find(p => p._id === selected.value)
    submittedName.value = player?.name ?? ''
    submitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.vote-modal {
  background: #1a1a2e;
  border: 1px solid rgba(245, 213, 119, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.6);
}

.vote-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.vote-title {
  font-family: 'Dancing Script', cursive;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f5d577;
  margin: 0 0 2px;
}

.vote-sub {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 1.25rem;
  padding-right: 2px;
}

.player-list::-webkit-scrollbar { width: 4px; }
.player-list::-webkit-scrollbar-track { background: transparent; }
.player-list::-webkit-scrollbar-thumb { background: rgba(245, 213, 119, 0.3); border-radius: 2px; }

.player-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: left;
  width: 100%;
}

.player-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.player-option.selected {
  background: rgba(245, 213, 119, 0.1);
  border-color: rgba(245, 213, 119, 0.5);
}

.player-option-photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.player-option-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.player-option-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-option-pos {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.player-option-ovr {
  font-size: 1rem;
  font-weight: 900;
  color: #f5d577;
  min-width: 28px;
  text-align: right;
}

.player-option-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f5d577;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.player-option-check.visible { opacity: 1; }

.vote-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1.5rem 0;
  text-align: center;
}

.vote-success-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f5d577;
  margin: 0;
}

.vote-success-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.vote-success-sub strong { color: #fff; }

.vote-actions {
  display: flex;
  gap: 8px;
}

.vote-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.vote-cancel:hover { background: rgba(255, 255, 255, 0.1); }

.vote-submit {
  flex: 2;
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #b8922a, #f5d577);
  border: none;
  color: #000;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s;
}

.vote-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.vote-submit:not(:disabled):hover { opacity: 0.85; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
