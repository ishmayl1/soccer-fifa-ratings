<template>
  <NModal :show="show" preset="card" title="Edit Your Card" style="max-width:440px" @update:show="val => !val && $emit('close')">
    <form @submit.prevent="submit" class="d-flex flex-column gap-4">
      <NFormItem label="Display Name" :show-feedback="false">
        <NInput v-model:value="form.name" placeholder="Your name" />
      </NFormItem>

      <div class="two-col d-grid gap-3">
        <NFormItem label="Nationality" :show-feedback="false">
          <NInput v-model:value="form.nationality" placeholder="Country" />
        </NFormItem>
        <NFormItem label="Club" :show-feedback="false">
          <NInput v-model:value="form.club" placeholder="Club name" />
        </NFormItem>
      </div>

      <NFormItem label="Position" :show-feedback="false">
        <NSelect v-model:value="form.position" :options="positionOptions" placeholder="Select..." />
      </NFormItem>

      <NFormItem label="Photo" :show-feedback="false">
        <div class="d-flex flex-column gap-2 w-full">
          <input type="file" accept="image/*" @change="onFile" class="text-dim text-sm cursor-pointer" />
          <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="photo-preview" />
        </div>
      </NFormItem>

      <NAlert v-if="error" type="error" :bordered="false">{{ error }}</NAlert>

      <div class="d-flex gap-3 mt-1">
        <NButton class="flex-1" @click="$emit('close')">Cancel</NButton>
        <NButton class="flex-1" style="color:#000;font-weight:700" type="primary" attr-type="submit" :loading="saving">Save</NButton>
      </div>
    </form>
  </NModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NModal, NFormItem, NInput, NSelect, NButton, NAlert } from 'naive-ui'
import { usePlayerStore } from '../stores/players'

const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']
const positionOptions = positions.map(p => ({ label: p, value: p }))

const props = defineProps({
  show: Boolean,
  player: Object,
})
const emit = defineEmits(['close', 'saved'])

const playerStore = usePlayerStore()
const form = ref({ name: '', nationality: '', club: '', position: '' })
const photoFile = ref(null)
const previewUrl = ref('')
const saving = ref(false)
const error = ref('')

watch(() => props.player, (p) => {
  if (p) {
    form.value.name = p.name
    form.value.nationality = p.nationality || ''
    form.value.club = p.club || ''
    form.value.position = p.position || ''
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
    const updated = await playerStore.updateProfile(props.player._id, {
      name: form.value.name,
      photo,
      nationality: form.value.nationality,
      club: form.value.club,
      position: form.value.position,
    })
    emit('saved', updated)
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.two-col { grid-template-columns: 1fr 1fr; }
.photo-preview { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(245,213,119,0.3); }
</style>
