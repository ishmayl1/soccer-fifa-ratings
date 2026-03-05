<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="show" class="modal-box" style="max-width: 800px;">
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl z-10"
            >✕</button>

            <h2 class="text-xl font-bold text-yellow-400 mb-6">
              {{ editingPlayer ? 'Edit Player' : 'Add New Player' }}
            </h2>

            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Form -->
              <form @submit.prevent="submit" class="flex-1 space-y-4">
                <!-- Name + Position row -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-white/60 mb-1">Name *</label>
                    <input v-model="form.name" required type="text"
                      class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-white/60 mb-1">Position *</label>
                    <select v-model="form.position" required
                      class="w-full bg-[#1a1a35] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors">
                      <option value="">Select...</option>
                      <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
                    </select>
                  </div>
                </div>

                <!-- Nationality + Club -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-white/60 mb-1">Nationality</label>
                    <input v-model="form.nationality" type="text"
                      class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-white/60 mb-1">Club</label>
                    <input v-model="form.club" type="text"
                      class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors" />
                  </div>
                </div>

                <!-- Overall -->
                <div>
                  <label class="block text-xs font-medium text-white/60 mb-1">
                    Overall Rating: <span class="text-yellow-400 font-bold">{{ form.overall }}</span>
                  </label>
                  <input v-model.number="form.overall" type="range" min="1" max="99"
                    class="w-full accent-yellow-400" />
                </div>

                <!-- Stats grid -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div v-for="stat in statKeys" :key="stat">
                    <label class="block text-xs font-medium text-white/60 mb-0.5">
                      {{ stat.toUpperCase() }}: <span class="text-yellow-400">{{ form.stats[stat] }}</span>
                    </label>
                    <input v-model.number="form.stats[stat]" type="range" min="1" max="99"
                      class="w-full accent-yellow-400" />
                  </div>
                </div>

                <!-- Photo upload -->
                <div>
                  <label class="block text-xs font-medium text-white/60 mb-1">Photo</label>
                  <input type="file" accept="image/*" @change="onFile"
                    class="w-full text-sm text-white/60 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-yellow-400/10 file:text-yellow-400 hover:file:bg-yellow-400/20 transition-all cursor-pointer" />
                </div>

                <!-- Owner assignment -->
                <div>
                  <label class="block text-xs font-medium text-white/60 mb-1">Assign Owner (optional)</label>
                  <select v-model="form.owner"
                    class="w-full bg-[#1a1a35] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors">
                    <option value="">None</option>
                    <option v-for="u in users" :key="u._id" :value="u._id">
                      {{ u.username }} ({{ u.email }})
                    </option>
                  </select>
                </div>

                <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>

                <div class="flex gap-3 pt-1">
                  <button type="button" @click="$emit('close')"
                    class="flex-1 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit" :disabled="saving"
                    class="flex-1 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all text-sm disabled:opacity-50">
                    {{ saving ? 'Saving...' : (editingPlayer ? 'Update' : 'Create') }}
                  </button>
                </div>
              </form>

              <!-- Live preview -->
              <div class="flex flex-col items-center gap-3 lg:min-w-[180px]">
                <p class="text-xs text-white/40 font-medium uppercase tracking-wider">Live Preview</p>
                <FifaCard :player="FifaCardPreviewPlayer" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FifaCard from './FifaCard.vue'
import { usePlayerStore } from '../stores/players'

const props = defineProps({
  show: Boolean,
  editingPlayer: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const playerStore = usePlayerStore()

const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']
const statKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy']

const defaultForm = () => ({
  name: '',
  position: '',
  nationality: '',
  club: 'Cool Soccer For Cool People',
  overall: 75,
  stats: { pac: 75, sho: 75, pas: 75, dri: 75, def: 75, phy: 75 },
  owner: '',
})

const form = ref(defaultForm())
const photoFile = ref(null)
const photoPreviewUrl = ref('')
const saving = ref(false)
const error = ref('')
const users = ref([])

onMounted(async () => {
  try {
    users.value = await playerStore.fetchUsers()
  } catch {}
})

watch(() => props.editingPlayer, (p) => {
  if (p) {
    form.value = {
      name: p.name,
      position: p.position,
      nationality: p.nationality || '',
      club: p.club || 'Cool Soccer For Cool People',
      overall: p.overall,
      stats: { ...p.stats },
      owner: p.owner?._id || '',
    }
    photoPreviewUrl.value = p.photo ? `/uploads/${p.photo}` : ''
  } else {
    form.value = defaultForm()
    photoPreviewUrl.value = ''
  }
  photoFile.value = null
  error.value = ''
}, { immediate: true })

function onFile(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  photoPreviewUrl.value = URL.createObjectURL(file)
}

const FifaCardPreviewPlayer = computed(() => {
  const p = { ...form.value, stats: { ...form.value.stats } }
  if (photoFile.value) {
    p.photo = photoPreviewUrl.value  // blob URL — FifaCard handles it directly
  } else if (props.editingPlayer?.photo) {
    p.photo = props.editingPlayer.photo
  } else {
    p.photo = ''
  }
  return p
})

async function submit() {
  saving.value = true
  error.value = ''
  try {
    let photo = props.editingPlayer?.photo || ''
    if (photoFile.value) {
      photo = await playerStore.uploadPhoto(photoFile.value)
    }

    const payload = {
      name: form.value.name,
      position: form.value.position,
      nationality: form.value.nationality,
      club: form.value.club,
      overall: form.value.overall,
      stats: { ...form.value.stats },
      photo,
      owner: form.value.owner || null,
    }

    let result
    if (props.editingPlayer) {
      result = await playerStore.updatePlayer(props.editingPlayer._id, payload)
    } else {
      result = await playerStore.createPlayer(payload)
    }

    emit('saved', result)
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>
