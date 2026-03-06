<template>
  <NModal
    :show="show"
    preset="card"
    :title="editingPlayer ? 'Edit Player' : 'Add New Player'"
    style="max-width: 800px; width: 95vw;"
    @update:show="val => !val && $emit('close')"
  >
    <div class="modal-layout d-flex gap-8 align-start" :class="{'align-center': isMobile || isTablet}">
      <!-- Form -->
      <form @submit.prevent="submit" class="form-col flex-1 d-flex flex-column gap-4">
        <div class="two-col d-grid gap-3">
          <NFormItem label="Name *" :show-feedback="false">
            <NInput v-model:value="form.name" placeholder="Player name" required />
          </NFormItem>
          <NFormItem label="Position *" :show-feedback="false">
            <NSelect v-model:value="form.position" :options="positionOptions" placeholder="Select..." />
          </NFormItem>
        </div>

        <div class="two-col d-grid gap-3">
          <NFormItem label="Nationality" :show-feedback="false">
            <NInput v-model:value="form.nationality" placeholder="Country" />
          </NFormItem>
          <NFormItem label="Club" :show-feedback="false">
            <NInput v-model:value="form.club" placeholder="Club name" />
          </NFormItem>
        </div>

        <div class="two-col d-grid gap-3">
          <NFormItem v-for="stat in statKeys" :key="stat" :show-feedback="false">
            <template #label>
              {{ stat.toUpperCase() }}: <span class="text-gold">{{ form.stats[stat] }}</span>
            </template>
            <NSlider v-model:value="form.stats[stat]" :min="1" :max="99" style="width:100%" />
          </NFormItem>
        </div>

        <NFormItem label="Photo" :show-feedback="false">
          <input type="file" accept="image/*" @change="onFile" class="text-dim text-sm cursor-pointer w-full" />
        </NFormItem>

        <NFormItem label="Assign Owner (optional)" :show-feedback="false">
          <NSelect v-model:value="form.owner" :options="userOptions" placeholder="None" clearable />
        </NFormItem>

        <NAlert v-if="error" type="error" :bordered="false">{{ error }}</NAlert>

        <div class="d-flex gap-3 mt-1">
          <NButton class="flex-1" @click="$emit('close')">Cancel</NButton>
          <NButton class="flex-1" style="color:#000;font-weight:700" type="primary" attr-type="submit" :loading="saving">
            {{ editingPlayer ? 'Update' : 'Create' }}
          </NButton>
        </div>
      </form>

      <!-- Live preview -->
      <div class="preview-col d-flex flex-column align-center gap-2 flex-shrink-0">
        <p class="text-xs text-muted text-uppercase tracking-wide">Live Preview</p>
        <FifaCard :player="FifaCardPreviewPlayer" />
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { NModal, NFormItem, NInput, NSelect, NSlider, NButton, NAlert } from 'naive-ui'
import FifaCard from './FifaCard.vue'
import { usePlayerStore } from '../stores/players'
import { useBreakpoints } from '../composables/useBreakpoints'

const props = defineProps({
  show: Boolean,
  editingPlayer: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const playerStore = usePlayerStore()
const { isMobile, isTablet } = useBreakpoints()

const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']
const positionOptions = positions.map(p => ({ label: p, value: p }))
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
const userOptions = computed(() =>
  users.value.map(u => ({ label: `${u.username} (${u.email})`, value: u._id }))
)
const overallValue = computed(() => {
  // find the average value of all stats
  let avg = null;
  const arr = Object.values(form.value.stats)
  if (arr.length > 0) {
    avg = arr.reduce((a, b) => a + b, 0) / arr.length
  }

  return Math.floor(avg);
  
})

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
  const p = { ...form.value, overall: overallValue.value, stats: { ...form.value.stats} }
  if (photoFile.value) {
    p.photo = photoPreviewUrl.value
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
      overall: overallValue.value,
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

<style scoped>
/* Responsive overrides — kept as classes so media queries can target them */
.modal-layout { align-items: flex-start; }
.form-col { min-width: 0; }
.two-col { grid-template-columns: 1fr 1fr; }
@media (max-width: 560px) {
  .modal-layout { flex-direction: column; align-items: stretch; }
  .preview-col { order: -1; align-items: center; }
  .two-col { grid-template-columns: 1fr; }
}
</style>
