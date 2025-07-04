<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="closeModal">
    <div class="bg-card rounded-xl shadow-xl w-full max-w-md border border-border-color transform transition-all">
      <div class="p-6 border-b border-border-color flex justify-between items-center">
        <h3 class="text-xl font-semibold text-text-primary">{{ title }}</h3>
        <button @click="closeModal" class="text-text-secondary hover:text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <p class="text-text-secondary text-sm">{{ message }}</p>
        <div>
          <label for="passwordConfirm" class="block text-sm font-medium text-text-secondary mb-1">
            Şifreniz <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="passwordConfirm" 
              required 
              class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 pr-10 text-text-primary focus:ring-primary focus:border-primary"
              @keyup.enter="handleConfirm"
            >
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <p v-if="errorMessage" class="text-red-500 text-xs mt-2">{{ errorMessage }}</p>
        </div>
      </div>

      <div class="bg-background px-6 py-4 flex justify-end gap-3 rounded-b-xl">
        <button 
          @click="closeModal" 
          class="px-4 py-2 border border-border-color text-text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          İptal
        </button>
        <button 
          @click="handleConfirm"
          :disabled="isLoading || !password"
          :class="['px-4 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2', confirmButtonClass]"
        >
          <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Doğrulanıyor...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Onay Gerekli'
  },
  message: {
    type: String,
    default: 'Bu işlemi gerçekleştirmek için lütfen şifrenizi girin.'
  },
  confirmText: {
    type: String,
    default: 'Onayla'
  },
  confirmButtonClass: {
    type: String,
    default: 'bg-primary hover:bg-blue-600'
  }
})

const emit = defineEmits(['close', 'confirm'])

const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    password.value = ''
    errorMessage.value = ''
    isLoading.value = false
  }
})

const handleConfirm = async () => {
  if (!password.value) {
    errorMessage.value = 'Lütfen şifrenizi girin.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // Simulate API call for password verification
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Dummy password check (replace with actual authentication logic)
  if (password.value === 'password123') { // Replace with actual user password check
    emit('confirm')
    closeModal()
  } else {
    errorMessage.value = 'Yanlış şifre. Lütfen tekrar deneyin.'
  }
  isLoading.value = false
}

const closeModal = () => {
  emit('close')
}
</script>
