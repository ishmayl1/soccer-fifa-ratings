<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="show" class="modal-box">
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl"
            >✕</button>

            <h2 class="text-xl font-bold text-yellow-400 mb-6">Edit Your Card</h2>

            <form @submit.prevent="submit" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Display Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                />
              </div>

              <!-- Photo -->
              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  @change="onFile"
                  class="w-full text-sm text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-400/10 file:text-yellow-400 hover:file:bg-yellow-400/20 transition-all cursor-pointer"
                />
                <div v-if="previewUrl" class="mt-2">
                  <img :src="previewUrl" alt="Preview" class="w-16 h-16 rounded-full object-cover border-2 border-yellow-400/30" />
                </div>
              </div>

              <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="flex-1 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="flex-1 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all disabled:opacity-50"
                >
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePlayerStore } from '../stores/players'

const props = defineProps({
  show: Boolean,
  player: Object,
})
const emit = defineEmits(['close', 'saved'])

const playerStore = usePlayerStore()
const form = ref({ name: '' })
const photoFile = ref(null)
const previewUrl = ref('')
const saving = ref(false)
const error = ref('')

watch(() => props.player, (p) => {
  if (p) {
    form.value.name = p.name
    previewUrl.value = p.photo ? `/uploads/${p.photo}` : ''
    photoFile.value = null
    error.value = ''
  }
}, { immediate: true })

function onFile(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function submit() {
  saving.value = true
  error.value = ''
  try {
    let photo = props.player.photo
    if (photoFile.value) {
      photo = await playerStore.uploadPhoto(photoFile.value)
    }
    const updated = await playerStore.updateProfile(props.player._id, { name: form.value.name, photo })
    emit('saved', updated)
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>
