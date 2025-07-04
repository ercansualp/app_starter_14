<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="closeModal">
    <div class="bg-card rounded-xl shadow-xl w-full max-w-lg border border-border-color transform transition-all">
      <div class="p-6 border-b border-border-color flex justify-between items-center">
        <h3 class="text-xl font-semibold text-text-primary">İki Faktörlü Doğrulamayı Ayarla</h3>
        <button @click="closeModal" class="text-text-secondary hover:text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <!-- Step Indicator -->
        <div class="flex items-center justify-center mb-6">
          <div v-for="s in 3" :key="s" class="flex items-center">
            <div class="flex flex-col items-center">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center font-bold', step >= s ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-text-secondary']">
                <svg v-if="step > s" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ s }}</span>
              </div>
              <p class="text-xs mt-2 text-center" :class="step >= s ? 'text-text-primary' : 'text-text-secondary'">{{ stepNames[s-1] }}</p>
            </div>
            <div v-if="s < 3" :class="['flex-auto h-1 mx-2', step > s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700']"></div>
          </div>
        </div>

        <!-- Step 1: Scan QR Code -->
        <div v-if="step === 1" class="space-y-4 text-center">
          <h4 class="text-lg font-semibold text-text-primary">Adım 1: QR Kodunu Tarayın</h4>
          <p class="text-sm text-text-secondary">Authenticator uygulamanızı (örn: Google Authenticator, Authy) kullanarak aşağıdaki QR kodunu tarayın.</p>
          <div class="p-4 bg-white inline-block rounded-lg mx-auto my-4">
            <QrcodeVue :value="qrCodeValue" :size="200" level="H" />
          </div>
          <p class="text-sm text-text-secondary">Kodu tarayamıyorsanız, aşağıdaki anahtarı manuel olarak girebilirsiniz:</p>
          <div class="flex items-center justify-center gap-2 p-2 bg-background rounded-md border border-border-color">
            <code class="text-text-primary font-mono">{{ secretKey }}</code>
            <button @click="copyToClipboard(secretKey, 'Anahtar')" class="text-text-secondary hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>

        <!-- Step 2: Verify Code -->
        <div v-if="step === 2" class="space-y-4">
          <h4 class="text-lg font-semibold text-text-primary text-center">Adım 2: Kodu Doğrulayın</h4>
          <p class="text-sm text-text-secondary text-center">Authenticator uygulamanızda görüntülenen 6 haneli kodu girerek kurulumu tamamlayın.</p>
          <div class="w-full max-w-xs mx-auto">
            <label for="verificationCode" class="block text-sm font-medium text-text-secondary mb-2">Doğrulama Kodu</label>
            <input 
              v-model="verificationCode"
              type="text" 
              id="verificationCode"
              maxlength="6"
              placeholder="123456"
              class="w-full text-center text-2xl tracking-[0.5em] bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary"
            >
            <p v-if="errorMessage" class="text-red-500 text-xs mt-2 text-center">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Step 3: Recovery Codes -->
        <div v-if="step === 3" class="space-y-4 text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h4 class="text-lg font-semibold text-text-primary">Kurulum Başarılı!</h4>
          <p class="text-sm text-text-secondary">2FA cihazınıza erişiminizi kaybederseniz, bu kurtarma kodlarını kullanarak hesabınıza erişebilirsiniz. <br><b>Lütfen bu kodları güvenli bir yerde saklayın.</b></p>
          <div class="grid grid-cols-2 gap-2 text-left bg-background p-4 rounded-lg border border-border-color">
            <div v-for="code in recoveryCodes" :key="code" class="font-mono text-text-primary tracking-wider">{{ code }}</div>
          </div>
          <button @click="copyToClipboard(recoveryCodes.join('\n'), 'Kurtarma kodları')" class="text-sm text-primary hover:underline">Kodları Kopyala</button>
        </div>
      </div>

      <!-- Footer with buttons -->
      <div class="bg-background px-6 py-4 flex justify-end gap-3 rounded-b-xl">
        <button v-if="step === 1" @click="closeModal" class="px-4 py-2 border border-border-color text-text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">İptal</button>
        <button v-if="step === 1" @click="step = 2" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">İleri</button>
        
        <button v-if="step === 2" @click="step = 1" class="px-4 py-2 border border-border-color text-text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Geri</button>
        <button v-if="step === 2" @click="verifyCode" :disabled="isLoading || verificationCode.length < 6" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Doğrula ve Etkinleştir
        </button>

        <button v-if="step === 3" @click="finishSetup" class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">Kapat</button>
      </div>
    </div>
    <div v-if="copySuccessMessage" class="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
      {{ copySuccessMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'completed'])

const step = ref(1)
const stepNames = ['QR Tara', 'Doğrula', 'Kaydet']
const secretKey = ref('')
const verificationCode = ref('')
const recoveryCodes = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const copySuccessMessage = ref('')

const qrCodeValue = computed(() => `otpauth://totp/JobHunter:admin@example.com?secret=${secretKey.value}&issuer=JobHunter`)

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const generateRecoveryCodes = () => {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(`${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`)
  }
  return codes
}

const initialize = () => {
  step.value = 1
  secretKey.value = generateRandomString(16)
  recoveryCodes.value = generateRecoveryCodes()
  verificationCode.value = ''
  errorMessage.value = ''
  isLoading.value = false
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    initialize()
  }
})

const verifyCode = async () => {
  if (verificationCode.value.length < 6) {
    errorMessage.value = 'Lütfen 6 haneli kodu girin.'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  
  await new Promise(resolve => setTimeout(resolve, 1500))

  if (verificationCode.value === '123456') { // Simülasyon
    step.value = 3
  } else {
    errorMessage.value = 'Geçersiz kod. Lütfen tekrar deneyin.'
  }
  isLoading.value = false
}

const copyToClipboard = async (text, type) => {
  try {
    await navigator.clipboard.writeText(text)
    copySuccessMessage.value = `${type} panoya kopyalandı!`
    setTimeout(() => copySuccessMessage.value = '', 2000)
  } catch (err) {
    console.error('Kopyalama başarısız oldu: ', err)
  }
}

const closeModal = () => {
  emit('close')
}

const finishSetup = () => {
  emit('completed')
}
</script>
