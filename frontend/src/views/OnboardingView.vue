<template>
  <div class="onboarding-page login-bg min-h-screen d-flex flex-column align-center">
    <div class="onboarding-container w-100 mt-12">

      <!-- Logo -->
      <div class="text-center mb-6">
        <div style="font-size:2.5rem">⚽</div>
        <h1 class="brand-title">Let's Build Your Card</h1>
      </div>

      <!-- Step indicator -->
      <div v-if="step < 4" class="step-indicator mb-8">
        <div v-for="n in 3" :key="n" class="step-dot" :class="{ active: n === step, done: n < step }" />
      </div>

      <!-- Step 1: Position -->
      <Transition name="fade" mode="out-in">
        <div v-if="step === 1" key="step1">
          <p class="step-heading">What position do you perfer to play?</p>
          <div class="position-groups">
            <div v-for="group in positionGroups" :key="group.label" class="position-group">
              <span class="group-label">{{ group.label }}</span>
              <div class="position-row">
                <button
                  v-for="pos in group.positions"
                  :key="pos"
                  class="pos-btn"
                  :class="{ selected: form.position === pos }"
                  @click="form.position = pos"
                >
                  {{ pos }}
                </button>
              </div>
            </div>
          </div>
          <div class="btn-row mt-6">
            <NButton size="large" type="primary" :disabled="!form.position" block style="font-weight:700;color:#000" @click="step = 2">
              Next →
            </NButton>
          </div>
        </div>

        <!-- Step 2: Name & Club -->
        <div v-else-if="step === 2" key="step2">
          <p class="step-heading">Tell us about yourself</p>
          <div class="d-flex flex-column gap-4">
            <NFormItem label="Name *" :show-feedback="false">
              <NInput v-model:value="form.name" placeholder="Your full name" size="large" @keydown.enter="form.name.trim() && (step = 3)" />
            </NFormItem>
            <NFormItem label="Club" :show-feedback="false">
              <NInput v-model:value="form.club" placeholder="Your team or club" size="large" />
            </NFormItem>
            <NFormItem label="Nationality" :show-feedback="false">
              <NInput v-model:value="form.nationality" placeholder="Country" size="large" />
            </NFormItem>
          </div>
          <div class="btn-row mt-6 d-flex gap-3">
            <NButton size="large" @click="step = 1">← Back</NButton>
            <NButton size="large" type="primary" :disabled="!form.name.trim()" style="flex:1;font-weight:700;color:#000" @click="step = 3">
              Next →
            </NButton>
          </div>
        </div>

        <!-- Step 3: Photo + Preview -->
        <div v-else-if="step === 3" key="step3" class="step3-layout">
          <div class="preview-side">
            <FifaCard :player="previewPlayer" />
          </div>
          <div class="upload-side">
            <p class="step-heading" style="margin-bottom:1rem">Add a photo</p>
            <p class="step-sub">Optional — you can update it later from your card.</p>

            <label class="photo-upload-label">
              <input type="file" accept="image/*,.svg" @change="onFile" class="visually-hidden" />
              <span>{{ photoFile ? photoFile.name : 'Choose image…' }}</span>
            </label>

            <NAlert v-if="error" type="error" :bordered="false" class="mt-4">{{ error }}</NAlert>

            <div class="btn-row mt-6 d-flex gap-3">
              <NButton size="large" @click="step = 2">← Back</NButton>
              <NButton size="large" type="primary" :loading="saving" style="flex:1;font-weight:700;color:#000" @click="submit">
                Create My Card
              </NButton>
            </div>
          </div>
        </div>

        <!-- Step 4: Done -->
        <div v-else-if="step === 4" key="step4" class="text-center">
          <p class="step-heading mb-2">Your card is ready!</p>
          <p class="step-sub mb-6">An admin will set your stats soon. Check back later!</p>
          <div class="d-flex justify-center mb-8">
            <FifaCard :player="createdPlayer" />
          </div>
          <NButton size="large" type="primary" block style="font-weight:700;color:#000;max-width:320px;margin:0 auto" @click="router.push('/')">
            Let's go →
          </NButton>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NFormItem, NInput, NAlert } from 'naive-ui'
import { useRouter } from 'vue-router'
import FifaCard from '../components/FifaCard.vue'
import { usePlayerStore } from '../stores/players'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const playerStore = usePlayerStore()
const auth = useAuthStore()

const step = ref(1)
const saving = ref(false)
const error = ref('')
const photoFile = ref(null)
const photoPreviewUrl = ref('')
const createdPlayer = ref(null)

const form = ref({
  position: '',
  name: '',
  club: 'Cool Soccer For Cool People',
  nationality: '',
})

const positionGroups = [
  { label: 'GK', positions: ['GK'] },
  { label: 'DEF', positions: ['CB', 'LB', 'RB'] },
  { label: 'MID', positions: ['CDM', 'CM', 'CAM', 'LM', 'RM'] },
  { label: 'ATT', positions: ['LW', 'RW', 'CF', 'ST'] },
]

const previewPlayer = computed(() => ({
  name: form.value.name || 'Your Name',
  position: form.value.position || '?',
  club: form.value.club || 'Cool Soccer For Cool People',
  nationality: form.value.nationality || '',
  overall: 50,
  stats: { pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50 },
  photo: photoPreviewUrl.value || '',
  verified: false,
}))

onMounted(async () => {
  if (!playerStore.players.length) await playerStore.fetchPlayers()
  const hasCard = playerStore.players.some(p => p.owner?._id === auth.user?.id)
  if (hasCard) router.push('/')
})

function onFile(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  photoPreviewUrl.value = URL.createObjectURL(file)
}

async function submit() {
  saving.value = true
  error.value = ''
  try {
    let photo = ''
    if (photoFile.value) {
      photo = await playerStore.uploadPhoto(photoFile.value)
    }
    const player = await playerStore.createSelf({
      name: form.value.name,
      position: form.value.position,
      club: form.value.club,
      nationality: form.value.nationality,
      photo,
    })
    createdPlayer.value = player
    step.value = 4
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.onboarding-page {
  padding: 2rem 1.5rem;
}

.onboarding-container {
  max-width: 560px;
  margin: 0 auto;
}

.brand-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #f5d577;
  letter-spacing: -0.5px;
  margin: 6px 0 0;
}

/* ── Step indicator ── */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s, transform 0.3s;
}

.step-dot.active {
  background: #f5d577;
  transform: scale(1.4);
}

.step-dot.done {
  background: rgba(245, 213, 119, 0.5);
}

/* ── Step text ── */
.step-heading {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
}

.step-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  margin-bottom: 0.5rem;
}

/* ── Position picker ── */
.position-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 30px;
  flex-shrink: 0;
}

.position-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pos-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.pos-btn:hover {
  border-color: rgba(245, 213, 119, 0.5);
  color: #f5d577;
  background: rgba(245, 213, 119, 0.08);
}

.pos-btn.selected {
  border-color: #f5d577;
  background: rgba(245, 213, 119, 0.15);
  color: #f5d577;
}

/* ── Step 3 layout ── */
.step3-layout {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
}

.preview-side {
  flex-shrink: 0;
}

.upload-side {
  flex: 1;
  min-width: 0;
}

/* ── Photo upload ── */
.photo-upload-label {
  display: block;
  padding: 12px 16px;
  border: 1.5px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  text-align: center;
}

.photo-upload-label:hover {
  border-color: rgba(245, 213, 119, 0.5);
  color: #f5d577;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}

.btn-row { width: 100%; }

/* ── Responsive ── */
@media (max-width: 560px) {
  .step3-layout {
    flex-direction: column;
  }

  .preview-side {
    transform: scale(0.75);
    transform-origin: center top;
    margin-bottom: -80px;
  }
}
</style>
