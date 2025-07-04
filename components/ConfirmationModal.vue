<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div class="bg-card rounded-xl shadow-xl w-full max-w-md border border-border-color">
        <div class="p-6 border-b border-border-color flex justify-between items-center">
          <h3 class="text-xl font-semibold text-text-primary">{{ title }}</h3>
          <button @click="$emit('close')" class="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <p class="text-text-secondary mb-6">{{ message }}</p>
          
          <div class="flex justify-end gap-3">
            <button 
              type="button" 
              @click="$emit('close')"
              class="px-4 py-2 border border-border-color text-text-primary rounded-lg hover:bg-background transition-colors"
            >
              İptal
            </button>
            <button 
              type="button" 
              @click="$emit('confirm')"
              :disabled="isConfirming"
              :class="[
                'px-4 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                confirmButtonClass
              ]"
            >
              <svg v-if="isConfirming" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isConfirming ? 'İşleniyor...' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Onayla'
  },
  confirmButtonClass: {
    type: String,
    default: 'bg-blue-600 hover:bg-blue-700'
  },
  isConfirming: { // New prop for loading state
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
